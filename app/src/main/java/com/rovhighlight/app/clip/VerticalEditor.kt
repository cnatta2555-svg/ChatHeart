package com.rovhighlight.app.clip

import android.graphics.SurfaceTexture
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLContext
import android.opengl.EGLDisplay
import android.opengl.EGLExt
import android.opengl.EGLSurface
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.view.Surface
import com.rovhighlight.app.capture.GlUtil
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

/**
 * Builds a vertical 9:16 highlight video in the style of TikTok game edits: every clip is shown
 * full-width in the middle over a blurred, zoomed copy of itself, and clips fade through black
 * into each other. Video is re-encoded, audio is copied unchanged.
 */
object VerticalEditor {
    private const val TAG = "VerticalEditor"

    fun render(inputs: List<File>, output: File, onProgress: (Int, Int) -> Unit = { _, _ -> }): Boolean {
        val clips = inputs.mapNotNull { probe(it) }
        if (clips.isEmpty()) return false
        val audioFormat = clips.first().audioFormat.takeIf { clips.all { c -> c.audioFormat != null } }
        var job: Job? = null
        return try {
            val j = Job(output, audioFormat)
            job = j
            clips.forEachIndexed { i, c ->
                onProgress(i, clips.size)
                j.addClip(c)
            }
            j.finish()
            true
        } catch (e: Exception) {
            Log.e(TAG, "render failed", e)
            false
        } finally {
            job?.release()
        }
    }

    private class ClipInfo(
        val file: File,
        val videoTrack: Int,
        val videoFormat: MediaFormat,
        val audioTrack: Int,
        val audioFormat: MediaFormat?,
    )

    private fun probe(file: File): ClipInfo? {
        val ex = MediaExtractor()
        return try {
            ex.setDataSource(file.path)
            var v = -1
            var a = -1
            for (i in 0 until ex.trackCount) {
                val mime = ex.getTrackFormat(i).getString(MediaFormat.KEY_MIME) ?: continue
                if (mime.startsWith("video/") && v < 0) v = i
                if (mime.startsWith("audio/") && a < 0) a = i
            }
            if (v < 0) null else ClipInfo(file, v, ex.getTrackFormat(v), a, if (a >= 0) ex.getTrackFormat(a) else null)
        } catch (e: Exception) {
            Log.w(TAG, "skip ${file.name}", e)
            null
        } finally {
            ex.release()
        }
    }

    private class Job(output: File, private val audioFormat: MediaFormat?) {
        private val muxer = MediaMuxer(output.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        private var videoOut = -1
        private var audioOut = -1
        private var muxerStarted = false

        private val encoder: MediaCodec
        private val width: Int
        private val height: Int
        private val encoderSurface: Surface

        private var eglDisplay: EGLDisplay = EGL14.EGL_NO_DISPLAY
        private var eglContext: EGLContext = EGL14.EGL_NO_CONTEXT
        private var eglSurface: EGLSurface = EGL14.EGL_NO_SURFACE

        private val progOes: Int
        private val progBlur: Int
        private val oesTex: Int
        private val fboA: IntArray
        private val fboB: IntArray
        private val bw: Int
        private val bh: Int

        private val frameThread = HandlerThread("EditorFrames").apply { start() }
        private val surfaceTexture: SurfaceTexture
        private val decoderSurface: Surface
        private val frameLock = ReentrantLock()
        private val frameCond = frameLock.newCondition()
        private var frameAvailable = false

        private val texMatrix = FloatArray(16)
        private val identity = FloatArray(16).also { android.opengl.Matrix.setIdentityM(it, 0) }
        private val quad: FloatBuffer = ByteBuffer.allocateDirect(8 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
        private val texCoords = GlUtil.floatBuffer(0f, 0f, 1f, 0f, 0f, 1f, 1f, 1f)
        private val info = MediaCodec.BufferInfo()
        private var offsetUs = 0L

        init {
            var enc: MediaCodec? = null
            var w = 0
            var h = 0
            for ((cw, ch) in listOf(1080 to 1920, 720 to 1280)) {
                val c = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
                try {
                    val f = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, cw, ch).apply {
                        setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
                        setInteger(MediaFormat.KEY_BIT_RATE, cw * ch * 5)
                        setInteger(MediaFormat.KEY_FRAME_RATE, 30)
                        setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                    }
                    c.configure(f, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                    enc = c
                    w = cw
                    h = ch
                    break
                } catch (e: Exception) {
                    Log.w(TAG, "encoder ${cw}x$ch failed", e)
                    c.release()
                }
            }
            encoder = enc ?: throw IllegalStateException("no vertical encoder")
            width = w
            height = h
            encoderSurface = encoder.createInputSurface()
            encoder.start()

            setupEgl()
            progOes = GlUtil.createProgram(VERTEX_SHADER, FRAGMENT_OES)
            progBlur = GlUtil.createProgram(VERTEX_SHADER, FRAGMENT_BLUR)
            val t = IntArray(1)
            GLES20.glGenTextures(1, t, 0)
            oesTex = t[0]
            GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex)
            GlUtil.setTexParams(GLES11Ext.GL_TEXTURE_EXTERNAL_OES)
            bw = width / 8
            bh = height / 8
            fboA = GlUtil.createFramebuffer(bw, bh)
            fboB = GlUtil.createFramebuffer(bw, bh)

            surfaceTexture = SurfaceTexture(oesTex)
            surfaceTexture.setOnFrameAvailableListener({
                frameLock.withLock {
                    frameAvailable = true
                    frameCond.signalAll()
                }
            }, Handler(frameThread.looper))
            decoderSurface = Surface(surfaceTexture)
        }

        private fun setupEgl() {
            eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
            val version = IntArray(2)
            check(EGL14.eglInitialize(eglDisplay, version, 0, version, 1)) { "eglInitialize failed" }
            val attribs = intArrayOf(
                EGL14.EGL_RED_SIZE, 8, EGL14.EGL_GREEN_SIZE, 8, EGL14.EGL_BLUE_SIZE, 8, EGL14.EGL_ALPHA_SIZE, 8,
                EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
                GlUtil.EGL_RECORDABLE_ANDROID, 1,
                EGL14.EGL_NONE,
            )
            val configs = arrayOfNulls<EGLConfig>(1)
            val num = IntArray(1)
            check(EGL14.eglChooseConfig(eglDisplay, attribs, 0, configs, 0, 1, num, 0) && num[0] > 0) { "no EGL config" }
            eglContext = EGL14.eglCreateContext(
                eglDisplay, configs[0], EGL14.EGL_NO_CONTEXT,
                intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE), 0,
            )
            check(eglContext != EGL14.EGL_NO_CONTEXT) { "eglCreateContext failed" }
            eglSurface = EGL14.eglCreateWindowSurface(eglDisplay, configs[0], encoderSurface, intArrayOf(EGL14.EGL_NONE), 0)
            check(eglSurface != EGL14.EGL_NO_SURFACE) { "eglCreateWindowSurface failed" }
            check(EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)) { "eglMakeCurrent failed" }
        }

        fun addClip(clip: ClipInfo) {
            val ex = MediaExtractor()
            var decoder: MediaCodec? = null
            try {
                ex.setDataSource(clip.file.path)
                ex.selectTrack(clip.videoTrack)
                val vf = clip.videoFormat
                val srcW = vf.getInteger(MediaFormat.KEY_WIDTH)
                val srcH = vf.getInteger(MediaFormat.KEY_HEIGHT)
                val durationUs = if (vf.containsKey(MediaFormat.KEY_DURATION)) vf.getLong(MediaFormat.KEY_DURATION) else -1L
                val dec = MediaCodec.createDecoderByType(vf.getString(MediaFormat.KEY_MIME)!!)
                decoder = dec
                dec.configure(vf, decoderSurface, null, 0)
                dec.start()

                var inputDone = false
                var outputDone = false
                var lastPts = 0L
                val decInfo = MediaCodec.BufferInfo()
                while (!outputDone) {
                    if (!inputDone) {
                        val idx = dec.dequeueInputBuffer(TIMEOUT_US)
                        if (idx >= 0) {
                            val buf = dec.getInputBuffer(idx)!!
                            val size = ex.readSampleData(buf, 0)
                            if (size < 0) {
                                dec.queueInputBuffer(idx, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                                inputDone = true
                            } else {
                                dec.queueInputBuffer(idx, 0, size, ex.sampleTime, 0)
                                ex.advance()
                            }
                        }
                    }
                    val out = dec.dequeueOutputBuffer(decInfo, TIMEOUT_US)
                    if (out >= 0) {
                        val render = decInfo.size > 0
                        val pts = decInfo.presentationTimeUs
                        val eos = decInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
                        dec.releaseOutputBuffer(out, render)
                        if (render) {
                            awaitFrame()
                            surfaceTexture.updateTexImage()
                            surfaceTexture.getTransformMatrix(texMatrix)
                            drawFrame(fade(pts, durationUs), srcW.toFloat() / srcH)
                            EGLExt.eglPresentationTimeANDROID(eglDisplay, eglSurface, (offsetUs + pts) * 1000)
                            EGL14.eglSwapBuffers(eglDisplay, eglSurface)
                            if (pts > lastPts) lastPts = pts
                            drainEncoder(0)
                        }
                        if (eos) outputDone = true
                    }
                }

                if (audioOut >= 0 || audioFormat != null) copyAudio(ex, clip)
                offsetUs += lastPts + FRAME_US
            } finally {
                try {
                    decoder?.stop()
                } catch (_: Exception) {
                }
                decoder?.release()
                ex.release()
            }
        }

        private fun copyAudio(ex: MediaExtractor, clip: ClipInfo) {
            if (clip.audioTrack < 0) return
            // The muxer starts once the encoder reported its format.
            var tries = 0
            while (!muxerStarted && tries++ < 300) drainEncoder(TIMEOUT_US)
            if (!muxerStarted || audioOut < 0) return
            ex.unselectTrack(clip.videoTrack)
            ex.selectTrack(clip.audioTrack)
            ex.seekTo(0, MediaExtractor.SEEK_TO_CLOSEST_SYNC)
            val buf = ByteBuffer.allocate(1 shl 20)
            val ai = MediaCodec.BufferInfo()
            while (true) {
                val size = ex.readSampleData(buf, 0)
                if (size < 0) break
                ai.set(0, size, offsetUs + ex.sampleTime, MediaCodec.BUFFER_FLAG_KEY_FRAME)
                muxer.writeSampleData(audioOut, buf, ai)
                ex.advance()
            }
        }

        private fun awaitFrame() {
            frameLock.withLock {
                var waitNs = TimeUnit.MILLISECONDS.toNanos(2500)
                while (!frameAvailable) {
                    if (waitNs <= 0) throw IllegalStateException("decoder frame timeout")
                    waitNs = frameCond.awaitNanos(waitNs)
                }
                frameAvailable = false
            }
        }

        private fun fade(ptsUs: Long, durationUs: Long): Float {
            val fadeIn = ptsUs.toFloat() / FADE_US
            val fadeOut = if (durationUs > 0) (durationUs - ptsUs).toFloat() / FADE_US else 1f
            return minOf(fadeIn, fadeOut).coerceIn(0f, 1f)
        }

        private fun drawFrame(gain: Float, srcAspect: Float) {
            val outAspect = width.toFloat() / height
            // Background: centre crop that fills 9:16, shrunk, blurred twice, darkened.
            val coverW = (outAspect / srcAspect).coerceAtMost(1f)
            val cover = floatArrayOf(0.5f - coverW / 2, 0f, 0.5f + coverW / 2, 1f)
            val full = floatArrayOf(0f, 0f, 1f, 1f)

            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboA[1])
            GLES20.glViewport(0, 0, bw, bh)
            draw(progOes, GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex, texMatrix, cover, -1f, -1f, 1f, 1f, 1f)
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboB[1])
            draw(progBlur, GLES20.GL_TEXTURE_2D, fboA[0], identity, full, -1f, -1f, 1f, 1f, 1f)

            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
            GLES20.glViewport(0, 0, width, height)
            GLES20.glClearColor(0f, 0f, 0f, 1f)
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
            draw(progBlur, GLES20.GL_TEXTURE_2D, fboB[0], identity, full, -1f, -1f, 1f, 1f, 0.5f * gain)

            // Foreground: whole clip at full width, centred.
            if (srcAspect >= outAspect) {
                val hNdc = outAspect / srcAspect
                draw(progOes, GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex, texMatrix, full, -1f, -hNdc, 1f, hNdc, gain)
            } else {
                val wNdc = srcAspect / outAspect
                draw(progOes, GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex, texMatrix, full, -wNdc, -1f, wNdc, 1f, gain)
            }
        }

        private fun draw(
            program: Int, target: Int, tex: Int, matrix: FloatArray, crop: FloatArray,
            x0: Float, y0: Float, x1: Float, y1: Float, gain: Float,
        ) {
            GLES20.glUseProgram(program)
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
            GLES20.glBindTexture(target, tex)
            GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "uTexMatrix"), 1, false, matrix, 0)
            GLES20.glUniform4f(GLES20.glGetUniformLocation(program, "uCrop"), crop[0], crop[1], crop[2], crop[3])
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "uGain"), gain)
            val texel = GLES20.glGetUniformLocation(program, "uTexel")
            if (texel >= 0) GLES20.glUniform2f(texel, 1.5f / bw, 1.5f / bh)
            quad.clear()
            quad.put(floatArrayOf(x0, y0, x1, y0, x0, y1, x1, y1)).position(0)
            val aPos = GLES20.glGetAttribLocation(program, "aPosition")
            val aTex = GLES20.glGetAttribLocation(program, "aTexCoord")
            GLES20.glEnableVertexAttribArray(aPos)
            GLES20.glVertexAttribPointer(aPos, 2, GLES20.GL_FLOAT, false, 8, quad)
            GLES20.glEnableVertexAttribArray(aTex)
            GLES20.glVertexAttribPointer(aTex, 2, GLES20.GL_FLOAT, false, 8, texCoords)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
            GLES20.glDisableVertexAttribArray(aPos)
            GLES20.glDisableVertexAttribArray(aTex)
        }

        /** Moves encoded output into the muxer; waits up to [timeoutUs] for the first buffer. */
        private fun drainEncoder(timeoutUs: Long): Boolean {
            while (true) {
                val idx = encoder.dequeueOutputBuffer(info, timeoutUs)
                when {
                    idx == MediaCodec.INFO_TRY_AGAIN_LATER -> return false
                    idx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                        videoOut = muxer.addTrack(encoder.outputFormat)
                        if (audioFormat != null) audioOut = muxer.addTrack(audioFormat)
                        muxer.start()
                        muxerStarted = true
                    }
                    idx >= 0 -> {
                        val buf = encoder.getOutputBuffer(idx)
                        val isConfig = info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0
                        if (buf != null && info.size > 0 && !isConfig && muxerStarted) {
                            buf.position(info.offset)
                            buf.limit(info.offset + info.size)
                            muxer.writeSampleData(videoOut, buf, info)
                        }
                        encoder.releaseOutputBuffer(idx, false)
                        if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) return true
                    }
                }
            }
        }

        fun finish() {
            encoder.signalEndOfInputStream()
            var tries = 0
            while (tries++ < 500) {
                if (drainEncoder(TIMEOUT_US)) break
            }
            check(muxerStarted) { "no video was encoded" }
            muxer.stop()
        }

        fun release() {
            try { encoder.stop() } catch (_: Exception) { }
            encoder.release()
            try { muxer.release() } catch (_: Exception) { }
            decoderSurface.release()
            surfaceTexture.release()
            frameThread.quitSafely()
            if (eglDisplay != EGL14.EGL_NO_DISPLAY) {
                GLES20.glDeleteProgram(progOes)
                GLES20.glDeleteProgram(progBlur)
                GLES20.glDeleteTextures(3, intArrayOf(oesTex, fboA[0], fboB[0]), 0)
                GLES20.glDeleteFramebuffers(2, intArrayOf(fboA[1], fboB[1]), 0)
                EGL14.eglMakeCurrent(eglDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
                EGL14.eglDestroySurface(eglDisplay, eglSurface)
                EGL14.eglDestroyContext(eglDisplay, eglContext)
                EGL14.eglReleaseThread()
                EGL14.eglTerminate(eglDisplay)
            }
            encoderSurface.release()
        }
    }

    private const val TIMEOUT_US = 10_000L
    private const val FADE_US = 350_000L
    private const val FRAME_US = 33_333L

    private val VERTEX_SHADER = """
        attribute vec4 aPosition;
        attribute vec4 aTexCoord;
        uniform mat4 uTexMatrix;
        uniform vec4 uCrop;
        varying vec2 vTex;
        void main() {
            gl_Position = aPosition;
            vec2 t = mix(uCrop.xy, uCrop.zw, aTexCoord.xy);
            vTex = (uTexMatrix * vec4(t, 0.0, 1.0)).xy;
        }
    """.trimIndent()

    private val FRAGMENT_OES = """
        #extension GL_OES_EGL_image_external : require
        precision mediump float;
        varying vec2 vTex;
        uniform samplerExternalOES sTex;
        uniform float uGain;
        void main() {
            gl_FragColor = vec4(texture2D(sTex, vTex).rgb * uGain, 1.0);
        }
    """.trimIndent()

    private val FRAGMENT_BLUR = """
        precision mediump float;
        varying vec2 vTex;
        uniform sampler2D sTex;
        uniform vec2 uTexel;
        uniform float uGain;
        void main() {
            vec3 c = vec3(0.0);
            for (int x = -2; x <= 2; x++) {
                for (int y = -2; y <= 2; y++) {
                    c += texture2D(sTex, vTex + vec2(float(x), float(y)) * uTexel).rgb;
                }
            }
            gl_FragColor = vec4(c / 25.0 * uGain, 1.0);
        }
    """.trimIndent()
}
