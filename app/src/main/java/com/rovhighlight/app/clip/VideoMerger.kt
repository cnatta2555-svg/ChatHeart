package com.rovhighlight.app.clip

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.util.Log
import java.io.File
import java.nio.ByteBuffer

/**
 * Joins clips one after another into a single .mp4 without re-encoding.
 * Works because every clip of a session comes from the same encoder settings.
 */
object VideoMerger {
    private const val TAG = "VideoMerger"
    private const val FRAME_GAP_US = 33_333L

    private class Tracks(val video: Int, val audio: Int, val videoFormat: MediaFormat?, val audioFormat: MediaFormat?)

    private fun tracksOf(ex: MediaExtractor): Tracks {
        var v = -1
        var a = -1
        var vf: MediaFormat? = null
        var af: MediaFormat? = null
        for (i in 0 until ex.trackCount) {
            val f = ex.getTrackFormat(i)
            val mime = f.getString(MediaFormat.KEY_MIME) ?: continue
            if (mime.startsWith("video/") && v < 0) {
                v = i; vf = f
            } else if (mime.startsWith("audio/") && a < 0) {
                a = i; af = f
            }
        }
        return Tracks(v, a, vf, af)
    }

    fun merge(inputs: List<File>, output: File, onProgress: (Int, Int) -> Unit = { _, _ -> }): Boolean {
        if (inputs.isEmpty()) return false
        val infos = inputs.map { f ->
            val ex = MediaExtractor()
            try {
                ex.setDataSource(f.path)
                tracksOf(ex)
            } catch (e: Exception) {
                Log.w(TAG, "skip unreadable ${f.name}", e)
                null
            } finally {
                ex.release()
            }
        }
        val usable = inputs.indices.filter { infos[it]?.videoFormat != null }
        if (usable.isEmpty()) return false
        val first = infos[usable.first()]!!
        val withAudio = first.audioFormat != null && usable.all { infos[it]!!.audioFormat != null }

        var muxer: MediaMuxer? = null
        return try {
            val m = MediaMuxer(output.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            muxer = m
            val outVideo = m.addTrack(first.videoFormat!!)
            val outAudio = if (withAudio) m.addTrack(first.audioFormat!!) else -1
            m.start()

            val buffer = ByteBuffer.allocate(8 * 1024 * 1024)
            val info = MediaCodec.BufferInfo()
            var offsetUs = 0L
            usable.forEachIndexed { n, idx ->
                onProgress(n, usable.size)
                val ex = MediaExtractor()
                try {
                    ex.setDataSource(inputs[idx].path)
                    val t = tracksOf(ex)
                    ex.selectTrack(t.video)
                    if (withAudio) ex.selectTrack(t.audio)
                    var maxPts = 0L
                    while (true) {
                        val track = ex.sampleTrackIndex
                        if (track < 0) break
                        val size = ex.readSampleData(buffer, 0)
                        if (size < 0) break
                        val pts = ex.sampleTime
                        val flags = if (ex.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC != 0) {
                            MediaCodec.BUFFER_FLAG_KEY_FRAME
                        } else {
                            0
                        }
                        info.set(0, size, offsetUs + pts, flags)
                        m.writeSampleData(if (track == t.video) outVideo else outAudio, buffer, info)
                        if (pts > maxPts) maxPts = pts
                        ex.advance()
                    }
                    offsetUs += maxPts + FRAME_GAP_US
                } finally {
                    ex.release()
                }
            }
            m.stop()
            true
        } catch (e: Exception) {
            Log.e(TAG, "merge failed", e)
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
