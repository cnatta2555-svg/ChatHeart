package com.rovhighlight.app

import com.rovhighlight.app.clip.ClipScheduler
import com.rovhighlight.app.detect.HighlightType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ClipSchedulerTest {
    private val s = 1_000_000L
    private fun scheduler() = ClipScheduler(12 * s, 5 * s, 60 * s)

    @Test fun singleEvent() {
        val c = scheduler()
        assertNull(c.onEvent(100 * s, HighlightType.DOUBLE_KILL))
        assertNull(c.poll(104 * s))
        val w = c.poll(105 * s)!!
        assertEquals(88 * s, w.startUs)
        assertEquals(105 * s, w.endUs)
        assertEquals(HighlightType.DOUBLE_KILL, w.best)
    }

    @Test fun overlappingEventsMerge() {
        val c = scheduler()
        c.onEvent(100 * s, HighlightType.DOUBLE_KILL)
        c.onEvent(108 * s, HighlightType.TRIPLE_KILL) // start 96 <= end 105 → merge
        assertNull(c.poll(110 * s))
        val w = c.poll(113 * s)!!
        assertEquals(88 * s, w.startUs)
        assertEquals(113 * s, w.endUs)
        assertEquals(HighlightType.TRIPLE_KILL, w.best)
        assertTrue(w.types.contains(HighlightType.DOUBLE_KILL))
    }

    @Test fun separateEvents() {
        val c = scheduler()
        c.onEvent(100 * s, HighlightType.MANUAL)
        val first = c.poll(105 * s)!!
        c.onEvent(130 * s, HighlightType.BIG_FIGHT)
        val second = c.poll(135 * s)!!
        assertEquals(105 * s, first.endUs)
        assertEquals(118 * s, second.startUs)
    }

    @Test fun noDuplicateFootageAfterEmit() {
        val c = scheduler()
        c.onEvent(100 * s, HighlightType.MANUAL)
        c.poll(105 * s)
        c.onEvent(107 * s, HighlightType.MANUAL) // would start at 95, clamp to 105
        val w = c.poll(112 * s)!!
        assertEquals(105 * s, w.startUs)
    }

    @Test fun longFightIsSplitAtMaxLength() {
        val c = scheduler()
        var closed: ClipScheduler.Window? = null
        var t = 100 * s
        while (closed == null && t < 300 * s) {
            closed = c.onEvent(t, HighlightType.BIG_FIGHT)
            t += s / 2
        }
        assertNotNull(closed)
        assertTrue(closed!!.durationUs <= 60 * s)
        // next window continues right where the previous one stopped
        assertEquals(closed.endUs, c.pendingStartUs)
    }

    @Test fun flushCutsAtNow() {
        val c = scheduler()
        c.onEvent(100 * s, HighlightType.MANUAL)
        val w = c.flush(102 * s)!!
        assertEquals(102 * s, w.endUs)
        assertNull(c.flush(103 * s))
    }
}
