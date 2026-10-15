package com.rovhighlight.app.detect

/** What triggered a highlight clip. Higher priority wins when a clip contains several events. */
enum class HighlightType(val priority: Int, val title: String) {
    PENTA_KILL(100, "Penta Kill"),
    QUADRA_KILL(90, "Quadra Kill"),
    TRIPLE_KILL(80, "Triple Kill"),
    DOUBLE_KILL(70, "Double Kill"),
    SOLO_KILL(60, "Solo Kill"),
    MANUAL(50, "เซฟเอง"),
    BIG_FIGHT(40, "ไฟต์ใหญ่");

    /** A kill banner (Double … Penta, Solo), as opposed to a fight or a manual save. */
    val isKill: Boolean get() = priority >= SOLO_KILL.priority

    companion object {
        fun fromName(name: String?): HighlightType = entries.firstOrNull { it.name == name } ?: MANUAL

        fun best(types: Collection<HighlightType>): HighlightType =
            types.maxByOrNull { it.priority } ?: MANUAL
    }
}
