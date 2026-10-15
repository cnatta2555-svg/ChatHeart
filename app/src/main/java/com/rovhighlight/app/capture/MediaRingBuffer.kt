package com.rovhighlight.app.capture

import android.media.MediaCodec
import android.media.MediaFormat

/**
 * Keeps the last few seconds of *encoded* video and audio in memory, so nothing is
 * written to storage unless it becomes part of a highlight clip.
 */
class MediaRingBuffer {

    class Sample(val data: ByteArray, val ptsUs: Long, val flags: Int) {
        val isKeyFrame: Boolean get() = flags and MediaCodec.BUFFER_FLAG_KEY_FRAME != 0
    }

    class Snapshot(
        val videoFormat: MediaFormat,
        val audioFormat: MediaFormat?,
        val video: List<Sample>,
        val audio: List<Sample>,
    ) {
        val durationUs: Long get() = video.last().ptsUs - video.first().ptsUs
    }

    private val lock = Any()
    private val video = ArrayDeque<Sample>()
    private val audio = ArrayDeque<Sample>()
    private var bytes = 0L

    @Volatile var videoFormat: MediaFormat? = null
    @Volatile var audioFormat: MediaFormat? = null

    val sizeBytes: Long get() = synchronized(lock) { bytes }

    fun addVideo(sample: Sample) = synchronized(lock) {
        video.addLast(sample)
        bytes += sample.data.size
    }

    fun addAudio(sample: Sample) = synchronized(lock) {
        audio.addLast(sample)
        bytes += sample.data.size
    }

    /** Drops data older than [keepFromUs], always keeping video decodable from a key frame. */
    fun trim(keepFromUs: Long) = synchronized(lock) {
        var keyIdx = -1
        for ((i, s) in video.withIndex()) {
            if (s.ptsUs > keepFromUs) break
            if (s.isKeyFrame) keyIdx = i
        }
        repeat(maxOf(keyIdx, 0)) { bytes -= video.removeFirst().data.size }
        val audioFrom = minOf(video.firstOrNull()?.ptsUs ?: keepFromUs, keepFromUs)
        while (audio.isNotEmpty() && audio.first().ptsUs < audioFrom) {
            bytes -= audio.removeFirst().data.size
        }
    }

    /** Copies out the samples covering [startUs, endUs], starting at the key frame before [startUs]. */
    fun snapshot(startUs: Long, endUs: Long): Snapshot? = synchronized(lock) {
        val vf = videoFormat ?: return null
        var from = -1
        for ((i, s) in video.withIndex()) {
            if (s.ptsUs > startUs) break
            if (s.isKeyFrame) from = i
        }
        if (from < 0) from = video.indexOfFirst { it.isKeyFrame && it.ptsUs <= endUs }
        if (from < 0) return null
        val v = ArrayList<Sample>()
        for (i in from until video.size) {
            val s = video[i]
            if (s.ptsUs > endUs) break
            v += s
        }
        if (v.size < 2) return null
        val vStart = v.first().ptsUs
        val a = audio.filter { it.ptsUs in vStart..endUs }
        Snapshot(vf, audioFormat.takeIf { a.isNotEmpty() }, v, a)
    }

    fun clear() = synchronized(lock) {
        video.clear()
        audio.clear()
        bytes = 0
    }
}
