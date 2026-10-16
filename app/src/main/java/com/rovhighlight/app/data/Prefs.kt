package com.rovhighlight.app.data

import android.content.Context

class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    private fun bool(key: String, def: Boolean) = sp.getBoolean(key, def)
    private fun setBool(key: String, v: Boolean) = sp.edit().putBoolean(key, v).apply()

    /** 1 (fewer clips) … 5 (more clips) for the big-fight detector. */
    var sensitivity: Int
        get() = sp.getInt("sensitivity", 3)
        set(v) = sp.edit().putInt("sensitivity", v).apply()

    var ocrEnabled: Boolean
        get() = bool("ocr", true)
        set(v) = setBool("ocr", v)

    var audioEnabled: Boolean
        get() = bool("audio", true)
        set(v) = setBool("audio", v)

    var fightEnabled: Boolean
        get() = bool("fight", true)
        set(v) = setBool("fight", v)

    var floatingButton: Boolean
        get() = bool("floating", true)
        set(v) = setBool("floating", v)

    var autoMerge: Boolean
        get() = bool("autoMerge", true)
        set(v) = setBool("autoMerge", v)

    /** Gallery video contains only kill shots (fights / manual saves stay in the app). */
    var mergeKillsOnly: Boolean
        get() = bool("killsOnly", true)
        set(v) = setBool("killsOnly", v)

    /** Gallery video in vertical 9:16 with a blurred background and fades (TikTok style). */
    var verticalStyle: Boolean
        get() = bool("vertical", true)
        set(v) = setBool("vertical", v)

    var highQuality: Boolean
        get() = bool("hq", false)
        set(v) = setBool("hq", v)

    val preSeconds: Int get() = 12
    val postSeconds: Int get() = 5
}
