package com.rovhighlight.app.clip

import com.rovhighlight.app.detect.HighlightType

/**
 * Turns highlight events into clip windows of [preUs] before and [postUs] after each event.
 * Overlapping windows are merged into one; a merged window never grows beyond [maxLenUs]
 * and never re-uses footage that an earlier window already covered.
 *
 * Emitted windows may end in the future: the caller must wait until the footage exists.
 */
class ClipScheduler(
    private val preUs: Long,
    private val postUs: Long,
    private val maxLenUs: Long,
) {
    data class Window(val startUs: Long, val endUs: Long, val types: Set<HighlightType>) {
        val best: HighlightType get() = HighlightType.best(types)
        val durationUs: Long get() = endUs - startUs
    }

    private var hasPending = false
    private var pStart = 0L
    private var pEnd = 0L
    private val pTypes = mutableSetOf<HighlightType>()
    private var lastEmittedEnd = Long.MIN_VALUE

    @get:Synchronized
    val pendingStartUs: Long?
        get() = if (hasPending) pStart else null

    /** Registers an event at [tUs]. Returns a window that got closed by it, if any. */
    @Synchronized
    fun onEvent(tUs: Long, type: HighlightType): Window? {
        val end = tUs + postUs
        var emitted: Window? = null
        if (hasPending) {
            val start = maxOf(tUs - preUs, lastEmittedEnd)
            if (start <= pEnd) {
                val newEnd = maxOf(pEnd, end)
                if (newEnd - pStart <= maxLenUs) {
                    pEnd = newEnd
                    pTypes += type
                    return null
                }
            }
            emitted = takePending()
        }
        val start = maxOf(tUs - preUs, lastEmittedEnd)
        if (end <= start) return emitted
        pStart = start
        pEnd = end
        pTypes.clear()
        pTypes += type
        hasPending = true
        return emitted
    }

    /** Returns the pending window once [nowUs] has passed its end. */
    @Synchronized
    fun poll(nowUs: Long): Window? = if (hasPending && nowUs >= pEnd) takePending() else null

    /** Closes the pending window early (recording stopped), cutting it at [nowUs]. */
    @Synchronized
    fun flush(nowUs: Long): Window? {
        if (!hasPending) return null
        pEnd = minOf(pEnd, nowUs)
        if (pEnd <= pStart) {
            hasPending = false
            return null
        }
        return takePending()
    }

    private fun takePending(): Window {
        hasPending = false
        lastEmittedEnd = pEnd
        return Window(pStart, pEnd, pTypes.toSet())
    }
}
