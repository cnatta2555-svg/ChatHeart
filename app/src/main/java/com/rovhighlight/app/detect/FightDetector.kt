package com.rovhighlight.app.detect

import kotlin.math.max

/**
 * Detects "big fight / nice play" moments: game audio well above its running
 * baseline together with lots of on-screen motion, sustained for a few seconds.
 * Falls back to motion only when game audio can't be captured.
 *
 * Fed about twice per second with the motion score of the latest frame and the
 * loudness (dBFS over the last second) of the game audio.
 */
class FightDetector(sensitivity: Int) {

    sealed class Result {
        data object None : Result()
        /** A fight started; [eventUs] is when it began heating up. */
        data class Trigger(val eventUs: Long) : Result()
        /** The current fight is still going. */
        data object Extend : Result()
    }

    private val level = sensitivity.coerceIn(1, 5) - 1
    private val audioThresholdDb = doubleArrayOf(10.0, 8.0, 6.5, 5.0, 4.0)[level]
    private val motionWithAudio = doubleArrayOf(1.5, 1.35, 1.2, 1.1, 1.0)[level]
    private val motionOnly = doubleArrayOf(2.6, 2.2, 1.9, 1.7, 1.5)[level]

    private val requiredHotUs = 2_500_000L
    private val maxGapUs = 1_000_000L
    private val cooldownUs = 15_000_000L
    private val warmupUs = 8_000_000L

    private var firstUs = -1L
    private var lastUs = -1L
    private var motionBase = -1.0
    private var audioBase = Double.NaN
    private var hotSinceUs = -1L
    private var lastHotUs = -1L
    private var active = false
    private var lastActiveEndUs = Long.MIN_VALUE / 2

    fun update(tUs: Long, motion: Double, audioDb: Double?): Result {
        if (firstUs < 0) firstUs = tUs
        val dt = if (lastUs < 0) 0.5 else ((tUs - lastUs) / 1e6).coerceIn(0.05, 5.0)
        lastUs = tUs
        val db = audioDb?.coerceAtLeast(-60.0)

        if (motionBase < 0) motionBase = motion
        if (db != null && audioBase.isNaN()) audioBase = db

        val motionRatio = motion / max(motionBase, 1.0)
        val hot = if (db != null) {
            db - audioBase >= audioThresholdDb && motionRatio >= motionWithAudio
        } else {
            motionRatio >= motionOnly
        }

        // Baselines follow the general level of the game; adapt slower during fights.
        val alpha = (dt / if (hot) 120.0 else 30.0).coerceAtMost(1.0)
        motionBase += (motion - motionBase) * alpha
        if (db != null) audioBase += (db - audioBase) * alpha

        if (tUs - firstUs < warmupUs) return Result.None

        if (hot) {
            if (hotSinceUs < 0) hotSinceUs = tUs
            lastHotUs = tUs
        } else if (hotSinceUs >= 0 && tUs - lastHotUs > maxGapUs) {
            hotSinceUs = -1
            if (active) {
                active = false
                lastActiveEndUs = tUs
            }
        }
        if (hotSinceUs < 0) return Result.None
        if (active) return if (hot) Result.Extend else Result.None
        if (hot && tUs - hotSinceUs >= requiredHotUs && tUs - lastActiveEndUs >= cooldownUs) {
            active = true
            return Result.Trigger(hotSinceUs)
        }
        return Result.None
    }
}
