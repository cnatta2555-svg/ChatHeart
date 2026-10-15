package com.rovhighlight.app

import com.rovhighlight.app.detect.HighlightType
import com.rovhighlight.app.detect.KeywordMatcher
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class KeywordMatcherTest {
    @Test fun exactBanners() {
        assertEquals(HighlightType.DOUBLE_KILL, KeywordMatcher.match("DOUBLE KILL"))
        assertEquals(HighlightType.TRIPLE_KILL, KeywordMatcher.match("Triple Kill"))
        assertEquals(HighlightType.QUADRA_KILL, KeywordMatcher.match("QUADRA\nKILL"))
        assertEquals(HighlightType.PENTA_KILL, KeywordMatcher.match("PENTA KILL!"))
        assertEquals(HighlightType.SOLO_KILL, KeywordMatcher.match("SOLO KILL"))
    }

    @Test fun ocrNoise() {
        assertEquals(HighlightType.DOUBLE_KILL, KeywordMatcher.match("D0UBLE K1LL"))
        assertEquals(HighlightType.TRIPLE_KILL, KeywordMatcher.match("TRlPLE KIL"))
        assertEquals(HighlightType.QUADRA_KILL, KeywordMatcher.match("QUADKA KILL"))
        assertEquals(HighlightType.PENTA_KILL, KeywordMatcher.match("Player1 PENTAKIL"))
    }

    @Test fun highestWins() {
        assertEquals(HighlightType.PENTA_KILL, KeywordMatcher.match("DOUBLE KILL\nPENTA KILL"))
    }

    @Test fun unrelatedText() {
        assertNull(KeywordMatcher.match("VICTORY"))
        assertNull(KeywordMatcher.match("Lv 12  Gold 3500"))
        assertNull(KeywordMatcher.match("KILL"))
        assertNull(KeywordMatcher.match(""))
    }
}
