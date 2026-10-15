package com.rovhighlight.app.capture

import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.util.Log
import android.view.Surface

/** H.264 encoder fed through an input [Surface]; encoded frames go into the ring buffer. */
class VideoEncoder private constructor(
    val width: Int,
    val height: Int,
    private val codec: MediaCodec,
    private val ring: MediaRingBuffer,
) {
    val inputSurface: Surface = codec.createInputSurface()

    @Volatile private var stopRequested = false
    private val drainThread = Thread(::drainLoop, "VideoEncoderDrain")

    init {
        codec.start()
        drainThread.start()
    }

    private fun drainLoop() {
        val info = MediaCodec.BufferInfo()
        var idleAfterStop = 0
        try {
            while (true) {
                val idx = codec.dequeueOutputBuffer(info, 10_000)
                when {
                    idx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> ring.videoFormat = codec.outputFormat
                    idx >= 0 -> {
                        val buf = codec.getOutputBuffer(idx)
                        val isConfig = info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0
                        if (buf != null && info.size > 0 && !isConfig) {
                            val data = ByteArray(info.size)
                            buf.position(info.offset)
                            buf.limit(info.offset + info.size)
                            buf.get(data)
                            ring.addVideo(MediaRingBuffer.Sample(data, info.presentationTimeUs, info.flags))
                        }
                        codec.releaseOutputBuffer(idx, false)
                        if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) break
                    }
                    stopRequested -> if (++idleAfterStop > 100) break
                }
            }
        } catch (e: IllegalStateException) {
            Log.w(TAG, "drain stopped", e)
        }
    }

    fun stop() {
        try {
            codec.signalEndOfInputStream()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "signalEndOfInputStream", e)
        }
        stopRequested = true
        drainThread.join(2000)
        try {
            codec.stop()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "codec.stop", e)
        }
        codec.release()
        inputSurface.release()
    }

    companion object {
        private const val TAG = "VideoEncoder"
        private const val MIME = MediaFormat.MIMETYPE_VIDEO_AVC

        /** Tries the requested size first, then falls back to sizes every encoder supports. */
        fun create(width: Int, height: Int, bitrate: Int, ring: MediaRingBuffer): VideoEncoder {
            val candidates = listOf(width to height, 1280 to 720, 1280 to 576)
            var last: Exception? = null
            for ((w, h) in candidates.distinct()) {
                val codec = MediaCodec.createEncoderByType(MIME)
                try {
                    val format = MediaFormat.createVideoFormat(MIME, w, h).apply {
                        setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
                        setInteger(MediaFormat.KEY_BIT_RATE, bitrate)
                        setInteger(MediaFormat.KEY_FRAME_RATE, 30)
                        setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                        // Keep producing frames when the screen is static so the buffer always has key frames.
                        setLong(MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER, 100_000L)
                    }
                    codec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                    return VideoEncoder(w, h, codec, ring)
                } catch (e: Exception) {
                    Log.w(TAG, "encoder ${w}x$h failed", e)
                    codec.release()
                    last = e
                }
            }
            throw last ?: IllegalStateException("No usable video encoder")
        }
    }
}
