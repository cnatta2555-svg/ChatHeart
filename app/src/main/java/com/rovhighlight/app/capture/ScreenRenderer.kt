package com.rovhighlight.app.capture

import android.graphics.SurfaceTexture
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.projection.MediaProjection
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
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Mirrors the screen into an OpenGL texture (one VirtualDisplay, as Android 14 requires),
 * draws every frame into the video encoder and, a couple of times per second, reads back
 * a smaller copy for analysis (OCR + motion).
 */
class ScreenRenderer(
    private val projection: MediaProjection,
    private val encoderSurface: Surface,
    private val width: Int,
    private val height: Int,
    private val densityDpi: Int,
    private val analysisWidth: Int,
    private val analysisHeight: Int,
    private val analysisIntervalMs: Long,
    private val analysisBusy: AtomicBoolean,
    private val onAnalysisFrame: (buffer: ByteBuffer, width: Int, height: Int, ptsUs: Long) -> Unit,
) {
    private val thread = HandlerThread("ScreenRenderer").apply { start() }
    private val handler = Handler(thread.looper)

    private var eglDisplay: EGLDisplay = EGL14.EGL_NO_DISPLAY
    private var eglContext: EGLContext = EGL14.EGL_NO_CONTEXT
    private var eglSurface: EGLSurface = EGL14.EGL_NO_SURFACE

    private var program = 0
    private var aPosition = 0
    private var aTexCoord = 0
    private var uTexMatrix = 0
    private var uFlipY = 0
    private var uTexMatrixF = 0
    private var uMask = 0
    private var uFrameSize = 0
    private var oesTex = 0
    private var fbo = 0
    private var fboTex = 0
    private val texMatrix = FloatArray(16)

    private var surfaceTexture: SurfaceTexture? = null
    private var inputSurface: Surface? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var readBuffer: ByteBuffer? = null

    // Circle (frame pixels, origin bottom-left) painted over with its surroundings: hides our floating button.
    @Volatile private var maskX = 0f
    @Volatile private var maskY = 0f
    @Volatile private var maskR = 0f

    private var lastEncodedNs = 0L
    private var lastAnalysisNs = 0L

    private val vertices = GlUtil.floatBuffer(-1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f)
    private val texCoords = GlUtil.floatBuffer(0f, 0f, 1f, 0f, 0f, 1f, 1f, 1f)

    /** Sets everything up on the render thread; throws if that fails. */
    fun start() {
        val latch = CountDownLatch(1)
        var error: Throwable? = null
        handler.post {
            try {
                setup()
            } catch (t: Throwable) {
                error = t
            }
            latch.countDown()
        }
        if (!latch.await(5, TimeUnit.SECONDS)) throw IllegalStateException("Renderer setup timed out")
        error?.let { release(); throw it }
    }

    private fun setup() {
        eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
        val version = IntArray(2)
        check(EGL14.eglInitialize(eglDisplay, version, 0, version, 1)) { "eglInitialize failed" }
        val attribs = intArrayOf(
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
            GlUtil.EGL_RECORDABLE_ANDROID, 1,
            EGL14.EGL_NONE,
        )
        val configs = arrayOfNulls<EGLConfig>(1)
        val num = IntArray(1)
        check(EGL14.eglChooseConfig(eglDisplay, attribs, 0, configs, 0, 1, num, 0) && num[0] > 0) { "no EGL config" }
        val config = configs[0]!!
        eglContext = EGL14.eglCreateContext(
            eglDisplay, config, EGL14.EGL_NO_CONTEXT,
            intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE), 0,
        )
        check(eglContext != EGL14.EGL_NO_CONTEXT) { "eglCreateContext failed" }
        eglSurface = EGL14.eglCreateWindowSurface(eglDisplay, config, encoderSurface, intArrayOf(EGL14.EGL_NONE), 0)
        check(eglSurface != EGL14.EGL_NO_SURFACE) { "eglCreateWindowSurface failed" }
        check(EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)) { "eglMakeCurrent failed" }

        program = GlUtil.createProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        aPosition = GLES20.glGetAttribLocation(program, "aPosition")
        aTexCoord = GLES20.glGetAttribLocation(program, "aTexCoord")
        uTexMatrix = GLES20.glGetUniformLocation(program, "uTexMatrix")
        uFlipY = GLES20.glGetUniformLocation(program, "uFlipY")
        uTexMatrixF = GLES20.glGetUniformLocation(program, "uTexMatrixF")
        uMask = GLES20.glGetUniformLocation(program, "uMask")
        uFrameSize = GLES20.glGetUniformLocation(program, "uFrameSize")

        val tex = IntArray(2)
        GLES20.glGenTextures(2, tex, 0)
        oesTex = tex[0]
        fboTex = tex[1]
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex)
        GlUtil.setTexParams(GLES11Ext.GL_TEXTURE_EXTERNAL_OES)

        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, fboTex)
        GlUtil.setTexParams(GLES20.GL_TEXTURE_2D)
        GLES20.glTexImage2D(
            GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, analysisWidth, analysisHeight, 0,
            GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, null,
        )
        val fbos = IntArray(1)
        GLES20.glGenFramebuffers(1, fbos, 0)
        fbo = fbos[0]
        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fbo)
        GLES20.glFramebufferTexture2D(GLES20.GL_FRAMEBUFFER, GLES20.GL_COLOR_ATTACHMENT0, GLES20.GL_TEXTURE_2D, fboTex, 0)
        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
        readBuffer = ByteBuffer.allocateDirect(analysisWidth * analysisHeight * 4).order(ByteOrder.nativeOrder())

        val st = SurfaceTexture(oesTex)
        st.setDefaultBufferSize(width, height)
        st.setOnFrameAvailableListener({ onFrame() }, handler)
        surfaceTexture = st
        val surface = Surface(st)
        inputSurface = surface
        virtualDisplay = projection.createVirtualDisplay(
            "ROVHighlight", width, height, densityDpi,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, surface, null, null,
        )
    }

    private fun onFrame() {
        val st = surfaceTexture ?: return
        try {
            st.updateTexImage()
        } catch (e: RuntimeException) {
            Log.w(TAG, "updateTexImage", e)
            return
        }
        st.getTransformMatrix(texMatrix)
        val ts = st.timestamp.takeIf { it > 0 } ?: System.nanoTime()

        // Cap the encoded stream at ~30 fps (high refresh screens deliver 90-120).
        if (ts - lastEncodedNs >= MIN_FRAME_INTERVAL_NS) {
            GLES20.glViewport(0, 0, width, height)
            draw(1f)
            EGLExt.eglPresentationTimeANDROID(eglDisplay, eglSurface, ts)
            EGL14.eglSwapBuffers(eglDisplay, eglSurface)
            lastEncodedNs = ts
        }

        val now = System.nanoTime()
        if (now - lastAnalysisNs >= analysisIntervalMs * 1_000_000 && analysisBusy.compareAndSet(false, true)) {
            lastAnalysisNs = now
            val buf = readBuffer ?: return
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fbo)
            GLES20.glViewport(0, 0, analysisWidth, analysisHeight)
            draw(-1f) // flipped so that row 0 of glReadPixels is the top of the screen
            buf.rewind()
            GLES20.glReadPixels(0, 0, analysisWidth, analysisHeight, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, buf)
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
            buf.rewind()
            try {
                onAnalysisFrame(buf, analysisWidth, analysisHeight, ts / 1000)
            } catch (t: Throwable) {
                analysisBusy.set(false)
                Log.w(TAG, "analysis", t)
            }
        }
    }

    private fun draw(flipY: Float) {
        GLES20.glUseProgram(program)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTex)
        GLES20.glUniformMatrix4fv(uTexMatrix, 1, false, texMatrix, 0)
        GLES20.glUniform1f(uFlipY, flipY)
        GLES20.glUniformMatrix4fv(uTexMatrixF, 1, false, texMatrix, 0)
        GLES20.glUniform3f(uMask, maskX, maskY, maskR)
        GLES20.glUniform2f(uFrameSize, width.toFloat(), height.toFloat())
        GLES20.glEnableVertexAttribArray(aPosition)
        GLES20.glVertexAttribPointer(aPosition, 2, GLES20.GL_FLOAT, false, 8, vertices)
        GLES20.glEnableVertexAttribArray(aTexCoord)
        GLES20.glVertexAttribPointer(aTexCoord, 2, GLES20.GL_FLOAT, false, 8, texCoords)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        GLES20.glDisableVertexAttribArray(aPosition)
        GLES20.glDisableVertexAttribArray(aTexCoord)
    }

    /**
     * Paints over a circle of the mirrored screen (frame pixels, origin top-left) with the
     * colours around it, so an overlay such as the floating button doesn't show in clips.
     * A radius <= 0 turns the mask off.
     */
    fun setMask(centerX: Float, centerY: Float, radius: Float) {
        maskX = centerX
        maskY = height - centerY
        maskR = radius
    }

    /** Stops mirroring and frees GL resources. Blocks until done. */
    fun release() {
        val latch = CountDownLatch(1)
        handler.post {
            try {
                virtualDisplay?.release()
                virtualDisplay = null
                surfaceTexture?.setOnFrameAvailableListener(null)
                surfaceTexture?.release()
                surfaceTexture = null
                inputSurface?.release()
                inputSurface = null
                if (eglDisplay != EGL14.EGL_NO_DISPLAY) {
                    if (program != 0) GLES20.glDeleteProgram(program)
                    if (fbo != 0) GLES20.glDeleteFramebuffers(1, intArrayOf(fbo), 0)
                    GLES20.glDeleteTextures(2, intArrayOf(oesTex, fboTex), 0)
                    EGL14.eglMakeCurrent(eglDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
                    if (eglSurface != EGL14.EGL_NO_SURFACE) EGL14.eglDestroySurface(eglDisplay, eglSurface)
                    if (eglContext != EGL14.EGL_NO_CONTEXT) EGL14.eglDestroyContext(eglDisplay, eglContext)
                    EGL14.eglReleaseThread()
                    EGL14.eglTerminate(eglDisplay)
                }
                eglDisplay = EGL14.EGL_NO_DISPLAY
                eglSurface = EGL14.EGL_NO_SURFACE
                eglContext = EGL14.EGL_NO_CONTEXT
            } catch (t: Throwable) {
                Log.w(TAG, "release", t)
            }
            latch.countDown()
        }
        latch.await(3, TimeUnit.SECONDS)
        thread.quitSafely()
    }

    companion object {
        private const val TAG = "ScreenRenderer"
        private const val MIN_FRAME_INTERVAL_NS = 30_000_000L

        private val VERTEX_SHADER = """
            uniform mat4 uTexMatrix;
            uniform float uFlipY;
            attribute vec4 aPosition;
            attribute vec4 aTexCoord;
            varying vec2 vTexCoord;
            varying vec2 vPos;
            void main() {
                gl_Position = vec4(aPosition.x, aPosition.y * uFlipY, 0.0, 1.0);
                vTexCoord = (uTexMatrix * aTexCoord).xy;
                vPos = aTexCoord.xy;
            }
        """.trimIndent()

        // Inside the mask circle the pixel is rebuilt from samples just outside it,
        // which reads as a soft blur of the scenery instead of the button.
        private val FRAGMENT_SHADER = """
            #extension GL_OES_EGL_image_external : require
            #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
            #else
            precision mediump float;
            #endif
            varying vec2 vTexCoord;
            varying vec2 vPos;
            uniform samplerExternalOES sTexture;
            uniform mat4 uTexMatrixF;
            uniform vec3 uMask;
            uniform vec2 uFrameSize;
            vec4 sampleAt(vec2 px) {
                return texture2D(sTexture, (uTexMatrixF * vec4(px / uFrameSize, 0.0, 1.0)).xy);
            }
            void main() {
                vec2 d = vPos * uFrameSize - uMask.xy;
                float dist = length(d);
                if (uMask.z > 0.0 && dist < uMask.z) {
                    float ring = uMask.z * 1.1;
                    vec4 acc = vec4(0.0);
                    for (int i = 0; i < 12; i++) {
                        float a = float(i) * 0.5235988;
                        acc += sampleAt(uMask.xy + vec2(cos(a), sin(a)) * ring);
                    }
                    acc /= 12.0;
                    vec2 dir = dist > 0.001 ? d / dist : vec2(1.0, 0.0);
                    vec4 edge = sampleAt(uMask.xy + dir * ring);
                    gl_FragColor = mix(acc, edge, dist / uMask.z);
                } else {
                    gl_FragColor = texture2D(sTexture, vTexCoord);
                }
            }
        """.trimIndent()
    }
}
