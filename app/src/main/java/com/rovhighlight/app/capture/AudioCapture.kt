package com.rovhighlight.app.capture

import android.annotation.SuppressLint
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioPlaybackCaptureConfiguration
import android.media.AudioRecord
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.projection.MediaProjection
import android.util.Log
import kotlin.math.log10

/**
 * Captures the game's audio output (Android 10+ playback capture), encodes it to AAC into
 * the ring buffer and keeps a running loudness value for fight detection.
 */
@SuppressLint("MissingPermission") // RECORD_AUDIO is checked by the caller
class AudioCapture(projection: MediaProjection, private val ring: MediaRingBuffer) {

    private val record: AudioRecord
    private val codec: MediaCodec = MediaCodec.createEncoderByType(MIME)

    @Volatile private var running = false
    private var thread: Thread? = null

    /** Loudness of roughly the last second, in dBFS (-90 = silence). */
    @Volatile var loudnessDb: Double = -90.0
        private set

    /** True once any real sound arrived (some games block playback capture and give silence). */
    @Volatile var hasSignal: Boolean = false
        private set

    init {
        val config = AudioPlaybackCaptureConfiguration.Builder(projection)
            .addMatchingUsage(AudioAttributes.USAGE_GAME)
            .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
            .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
            .build()
        val format = AudioFormat.Builder()
            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            .setSampleRate(SAMPLE_RATE)
            .setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
            .build()
        val minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT)
        record = AudioRecord.Builder()
            .setAudioFormat(format)
            .setBufferSizeInBytes(maxOf(minBuf, CHUNK_BYTES * 4))
            .setAudioPlaybackCaptureConfig(config)
            .build()
        if (record.state != AudioRecord.STATE_INITIALIZED) {
            record.release()
            codec.release()
            throw IllegalStateException("AudioRecord not initialized")
        }
        val aac = MediaFormat.createAudioFormat(MIME, SAMPLE_RATE, CHANNELS).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, 128_000)
            setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, CHUNK_BYTES * 2)
        }
        codec.configure(aac, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
    }

    fun start() {
        codec.start()
        record.startRecording()
        running = true
        thread = Thread(::loop, "AudioCapture").also { it.start() }
    }

    private fun loop() {
        val pcm = ByteArray(CHUNK_BYTES)
        val info = MediaCodec.BufferInfo()
        val energies = DoubleArray(ENERGY_WINDOW)
        var energyIdx = 0
        var anchorUs = -1L
        var frames = 0L
        try {
            while (running) {
                val n = record.read(pcm, 0, pcm.size)
                if (n <= 0) continue
                val nowUs = System.nanoTime() / 1000
                val chunkFrames = n / (2 * CHANNELS)
                // Presentation time from the sample count, re-anchored if capture stalled.
                if (anchorUs < 0) anchorUs = nowUs - chunkFrames * 1_000_000L / SAMPLE_RATE
                var ptsUs = anchorUs + frames * 1_000_000L / SAMPLE_RATE
                val endUs = ptsUs + chunkFrames * 1_000_000L / SAMPLE_RATE
                if (nowUs - endUs > 200_000) {
                    anchorUs += nowUs - endUs
                    ptsUs = anchorUs + frames * 1_000_000L / SAMPLE_RATE
                }
                frames += chunkFrames

                energies[energyIdx] = meanSquare(pcm, n)
                energyIdx = (energyIdx + 1) % ENERGY_WINDOW
                val mean = energies.average()
                loudnessDb = if (mean <= 1e-9) -90.0 else 10 * log10(mean)
                if (loudnessDb > -55) hasSignal = true

                val inIdx = codec.dequeueInputBuffer(10_000)
                if (inIdx >= 0) {
                    val inBuf = codec.getInputBuffer(inIdx)
                    if (inBuf != null) {
                        inBuf.clear()
                        val size = minOf(n, inBuf.remaining())
                        inBuf.put(pcm, 0, size)
                        codec.queueInputBuffer(inIdx, 0, size, ptsUs, 0)
                    }
                }
                drain(info)
            }
        } catch (e: IllegalStateException) {
            Log.w(TAG, "audio loop stopped", e)
        }
    }

    private fun drain(info: MediaCodec.BufferInfo) {
        while (true) {
            val idx = codec.dequeueOutputBuffer(info, 0)
            when {
                idx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> ring.audioFormat = codec.outputFormat
                idx >= 0 -> {
                    val buf = codec.getOutputBuffer(idx)
                    val isConfig = info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0
                    if (buf != null && info.size > 0 && !isConfig) {
                        val data = ByteArray(info.size)
                        buf.position(info.offset)
                        buf.limit(info.offset + info.size)
                        buf.get(data)
                        ring.addAudio(MediaRingBuffer.Sample(data, info.presentationTimeUs, info.flags))
                    }
                    codec.releaseOutputBuffer(idx, false)
                }
                else -> return
            }
        }
    }

    fun stop() {
        running = false
        try {
            record.stop()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "record.stop", e)
        }
        thread?.join(1500)
        try {
            codec.stop()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "codec.stop", e)
        }
        codec.release()
        record.release()
    }

    companion object {
        private const val TAG = "AudioCapture"
        private const val MIME = MediaFormat.MIMETYPE_AUDIO_AAC
        private const val SAMPLE_RATE = 44_100
        private const val CHANNELS = 2
        private const val CHUNK_BYTES = 1024 * 2 * CHANNELS // 1024 frames ≈ 23 ms
        private const val ENERGY_WINDOW = 43 // ≈ 1 s of chunks

        /** Mean square of 16-bit little-endian PCM, normalised to full scale = 1.0. */
        private fun meanSquare(pcm: ByteArray, n: Int): Double {
            var sum = 0.0
            var count = 0
            var i = 0
            while (i + 1 < n) {
                val s = ((pcm[i + 1].toInt() shl 8) or (pcm[i].toInt() and 0xFF)).toShort() / 32768.0
                sum += s * s
                count++
                i += 2
            }
            return if (count == 0) 0.0 else sum / count
        }
    }
}
