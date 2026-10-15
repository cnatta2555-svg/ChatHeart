package com.rovhighlight.app.clip

import android.media.MediaCodec
import android.media.MediaMuxer
import android.util.Log
import com.rovhighlight.app.capture.MediaRingBuffer
import java.io.File
import java.nio.ByteBuffer

/** Writes a ring-buffer snapshot to an .mp4 file. */
object ClipWriter {
    private const val TAG = "ClipWriter"

    fun write(file: File, snap: MediaRingBuffer.Snapshot): Boolean {
        var muxer: MediaMuxer? = null
        return try {
            file.parentFile?.mkdirs()
            val m = MediaMuxer(file.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            muxer = m
            val videoTrack = m.addTrack(snap.videoFormat)
            val audioTrack = snap.audioFormat?.let { m.addTrack(it) } ?: -1
            m.start()

            val base = snap.video.first().ptsUs
            val info = MediaCodec.BufferInfo()
            var vi = 0
            var ai = 0
            val video = snap.video
            val audio = if (audioTrack >= 0) snap.audio else emptyList()
            // Interleave both tracks in timestamp order.
            while (vi < video.size || ai < audio.size) {
                val takeVideo = ai >= audio.size || (vi < video.size && video[vi].ptsUs <= audio[ai].ptsUs)
                val s = if (takeVideo) video[vi++] else audio[ai++]
                val flags = if (s.isKeyFrame) MediaCodec.BUFFER_FLAG_KEY_FRAME else 0
                info.set(0, s.data.size, s.ptsUs - base, flags)
                m.writeSampleData(if (takeVideo) videoTrack else audioTrack, ByteBuffer.wrap(s.data), info)
            }
            m.stop()
            true
        } catch (e: Exception) {
            Log.e(TAG, "write failed", e)
            false
        } finally {
            try {
                muxer?.release()
            } catch (e: Exception) {
                Log.w(TAG, "release", e)
            }
        }
    }
}
