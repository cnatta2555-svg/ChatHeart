package com.rovhighlight.app.clip

import android.util.Log
import java.io.File

/** Joins clips into the final highlight video, vertical TikTok style or plain landscape. */
object HighlightExport {
    fun build(clips: List<File>, output: File, vertical: Boolean): Boolean {
        if (vertical) {
            if (VerticalEditor.render(clips, output)) return true
            // Never lose the highlights because the re-encode failed on this phone.
            Log.w("HighlightExport", "vertical edit failed, falling back to plain join")
            output.delete()
        }
        return VideoMerger.merge(clips, output)
    }
}
