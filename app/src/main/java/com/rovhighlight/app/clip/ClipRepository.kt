package com.rovhighlight.app.clip

import android.content.Context
import android.net.Uri
import com.rovhighlight.app.detect.HighlightType
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Clips live in app storage: files/clips/<session>/clip_###_<TYPE>.mp4 plus a .json sidecar.
 * A session is one recording run (start → stop).
 */
class ClipRepository(context: Context) {

    data class Clip(
        val file: File,
        val type: HighlightType,
        val types: List<HighlightType>,
        val durationMs: Long,
        val createdAt: Long,
    )

    data class Session(
        val dir: File,
        val createdAt: Long,
        val clips: List<Clip>,
        val galleryUri: Uri?,
    )

    val root = File(context.filesDir, "clips")

    fun newSessionDir(): File {
        val name = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        return File(root, name).apply { mkdirs() }
    }

    fun clipFiles(sessionDir: File): List<File> =
        sessionDir.listFiles { f -> f.isFile && f.name.endsWith(".mp4") }
            ?.sortedBy { it.name }
            .orEmpty()

    fun clips(sessionDir: File): List<Clip> = clipFiles(sessionDir).map(::readClip)

    /** A clip counts as a kill shot when any event inside it was a kill banner. */
    fun isKill(clip: Clip): Boolean = clip.type.isKill || clip.types.any { it.isKill }

    fun saveMeta(clip: File, types: Collection<HighlightType>, durationMs: Long) {
        val sorted = types.sortedByDescending { it.priority }
        val json = JSONObject()
            .put("type", HighlightType.best(sorted).name)
            .put("types", JSONArray(sorted.map { it.name }))
            .put("durationMs", durationMs)
            .put("createdAt", System.currentTimeMillis())
        metaFile(clip).writeText(json.toString())
    }

    fun markMerged(sessionDir: File, uri: Uri) {
        File(sessionDir, MERGED_FILE).writeText(uri.toString())
    }

    fun sessions(): List<Session> =
        root.listFiles { f -> f.isDirectory }
            .orEmpty()
            .map { dir ->
                val merged = File(dir, MERGED_FILE).takeIf { it.exists() }?.readText()?.let(Uri::parse)
                Session(dir, dir.lastModified(), clips(dir), merged)
            }
            .filter { it.clips.isNotEmpty() }
            .sortedByDescending { it.dir.name }

    fun delete(clip: Clip) {
        clip.file.delete()
        metaFile(clip.file).delete()
        val dir = clip.file.parentFile ?: return
        if (clipFiles(dir).isEmpty()) dir.deleteRecursively()
    }

    fun deleteIfEmpty(sessionDir: File) {
        if (clipFiles(sessionDir).isEmpty()) sessionDir.deleteRecursively()
    }

    private fun readClip(file: File): Clip {
        val meta = metaFile(file)
        return try {
            val json = JSONObject(meta.readText())
            val arr = json.optJSONArray("types") ?: JSONArray()
            val types = (0 until arr.length()).map { HighlightType.fromName(arr.optString(it)) }
            Clip(
                file,
                HighlightType.fromName(json.optString("type")),
                types,
                json.optLong("durationMs"),
                json.optLong("createdAt", file.lastModified()),
            )
        } catch (e: Exception) {
            val type = HighlightType.fromName(file.nameWithoutExtension.substringAfter("_").substringAfter("_"))
            Clip(file, type, listOf(type), 0, file.lastModified())
        }
    }

    private fun metaFile(clip: File) = File(clip.parentFile, clip.nameWithoutExtension + ".json")

    companion object {
        private const val MERGED_FILE = "merged.txt"
    }
}
