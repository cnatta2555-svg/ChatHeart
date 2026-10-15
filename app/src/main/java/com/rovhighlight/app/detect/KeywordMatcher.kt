package com.rovhighlight.app.detect

/**
 * Finds kill announcements ("DOUBLE KILL", "PENTA KILL", ...) in OCR output.
 * Game banners use stylised fonts, so matching is fuzzy: common digit/letter
 * confusions are normalised and a few edit errors are tolerated.
 */
object KeywordMatcher {

    private class Rule(val pattern: String, val maxErrors: Int, val type: HighlightType)

    private val rules = listOf(
        Rule("PENTAKILL", 2, HighlightType.PENTA_KILL),
        Rule("PENTA", 0, HighlightType.PENTA_KILL),
        Rule("QUADRAKILL", 2, HighlightType.QUADRA_KILL),
        Rule("QUADRA", 1, HighlightType.QUADRA_KILL),
        Rule("TRIPLEKILL", 2, HighlightType.TRIPLE_KILL),
        Rule("TRIPLE", 1, HighlightType.TRIPLE_KILL),
        Rule("DOUBLEKILL", 2, HighlightType.DOUBLE_KILL),
        Rule("DOUBLE", 0, HighlightType.DOUBLE_KILL),
        Rule("SOLOKILL", 1, HighlightType.SOLO_KILL),
    )

    fun match(text: String): HighlightType? {
        val normalized = normalize(text)
        if (normalized.length < 5) return null
        return rules
            .filter { approxSubstringDistance(it.pattern, normalized) <= it.maxErrors }
            .maxByOrNull { it.type.priority }
            ?.type
    }

    /** Uppercase letters only, with typical OCR digit confusions mapped back to letters. */
    fun normalize(text: String): String = buildString {
        for (c in text.uppercase()) {
            when (c) {
                in 'A'..'Z' -> append(c)
                '0' -> append('O')
                '1', '|', '!' -> append('I')
                '5' -> append('S')
                '4' -> append('A')
                else -> Unit
            }
        }
    }

    /** Minimum edit distance between [pattern] and any substring of [text] (Sellers' algorithm). */
    fun approxSubstringDistance(pattern: String, text: String): Int {
        val m = pattern.length
        var prev = IntArray(m + 1) { it }
        var cur = IntArray(m + 1)
        var best = prev[m]
        for (c in text) {
            cur[0] = 0
            for (i in 1..m) {
                val cost = if (pattern[i - 1] == c) 0 else 1
                cur[i] = minOf(prev[i - 1] + cost, prev[i] + 1, cur[i - 1] + 1)
            }
            if (cur[m] < best) best = cur[m]
            val t = prev; prev = cur; cur = t
        }
        return best
    }
}
