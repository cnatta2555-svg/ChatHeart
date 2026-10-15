package com.rovhighlight.app

import com.rovhighlight.app.detect.HighlightType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HighlightTypeTest {
    @Test fun killTypes() {
        listOf(
            HighlightType.PENTA_KILL, HighlightType.QUADRA_KILL, HighlightType.TRIPLE_KILL,
            HighlightType.DOUBLE_KILL, HighlightType.SOLO_KILL,
        ).forEach { assertTrue(it.name, it.isKill) }
        assertFalse(HighlightType.BIG_FIGHT.isKill)
        assertFalse(HighlightType.MANUAL.isKill)
    }

    @Test fun killBeatsFightInMergedClip() {
        assertEquals(HighlightType.DOUBLE_KILL, HighlightType.best(listOf(HighlightType.BIG_FIGHT, HighlightType.DOUBLE_KILL)))
    }
}
