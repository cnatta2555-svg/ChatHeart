package com.rovhighlight.app.ui

import android.content.Intent
import android.graphics.Bitmap
import android.media.ThumbnailUtils
import android.net.Uri
import android.os.Bundle
import android.util.LruCache
import android.util.Size
import android.view.LayoutInflater
import android.view.MenuItem
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.rovhighlight.app.clip.ClipRepository
import com.rovhighlight.app.clip.GallerySaver
import com.rovhighlight.app.clip.VideoMerger
import com.rovhighlight.app.databinding.ActivityClipsBinding
import com.rovhighlight.app.databinding.ItemClipBinding
import com.rovhighlight.app.databinding.ItemSessionBinding
import com.rovhighlight.app.detect.HighlightType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale

/** Lists the saved clips per recording session: watch, share, delete, re-merge. */
class ClipsActivity : AppCompatActivity() {

    private sealed class Row {
        data class Header(val session: ClipRepository.Session) : Row()
        data class ClipRow(val clip: ClipRepository.Clip) : Row()
    }

    private lateinit var b: ActivityClipsBinding
    private lateinit var repo: ClipRepository
    private val adapter = Adapter()
    private val thumbs = LruCache<String, Bitmap>(60)
    private val sessionFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US)
    private val displayFormat = SimpleDateFormat("d MMM yyyy  HH:mm", Locale("th", "TH"))

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivityClipsBinding.inflate(layoutInflater)
        setContentView(b.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        repo = ClipRepository(this)
        b.list.layoutManager = LinearLayoutManager(this)
        b.list.adapter = adapter
    }

    override fun onResume() {
        super.onResume()
        reload()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    private fun reload() {
        lifecycleScope.launch {
            val sessions = withContext(Dispatchers.IO) { repo.sessions() }
            val rows = sessions.flatMap { s -> listOf(Row.Header(s)) + s.clips.map { Row.ClipRow(it) } }
            adapter.submit(rows)
            b.empty.isVisible = rows.isEmpty()
        }
    }

    private fun sessionTitle(dir: File): String = try {
        displayFormat.format(sessionFormat.parse(dir.name)!!)
    } catch (e: Exception) {
        dir.name
    }

    private fun play(clip: ClipRepository.Clip) {
        startActivity(PlayerActivity.intent(this, clip.file.path))
    }

    private fun share(clip: ClipRepository.Clip) {
        val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", clip.file)
        val send = Intent(Intent.ACTION_SEND)
            .setType("video/mp4")
            .putExtra(Intent.EXTRA_STREAM, uri)
            .putExtra(Intent.EXTRA_TEXT, "${clip.type.title} — ROV Highlight")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        startActivity(Intent.createChooser(send, "แชร์คลิป"))
    }

    private fun confirmDelete(clip: ClipRepository.Clip) {
        MaterialAlertDialogBuilder(this)
            .setTitle("ลบคลิปนี้?")
            .setMessage("${clip.type.title} จะถูกลบออกจากแอป (วิดีโอที่รวมไว้ในแกลเลอรีไม่ถูกลบ)")
            .setPositiveButton("ลบ") { _, _ ->
                lifecycleScope.launch {
                    withContext(Dispatchers.IO) { repo.delete(clip) }
                    reload()
                }
            }
            .setNegativeButton("ยกเลิก", null)
            .show()
    }

    private fun chooseMerge(session: ClipRepository.Session) {
        val kills = session.clips.filter(repo::isKill)
        MaterialAlertDialogBuilder(this)
            .setTitle("รวมคลิปเป็นวิดีโอเดียว")
            .setItems(
                arrayOf("เฉพาะช็อตฆ่า (${kills.size} คลิป)", "ทุกคลิป (${session.clips.size} คลิป)"),
            ) { _, which ->
                val clips = if (which == 0) kills else session.clips
                if (clips.isEmpty()) {
                    Toast.makeText(this, "รอบนี้ไม่มีช็อตฆ่า", Toast.LENGTH_SHORT).show()
                } else {
                    merge(session, clips)
                }
            }
            .setNegativeButton("ยกเลิก", null)
            .show()
    }

    private fun merge(session: ClipRepository.Session, clips: List<ClipRepository.Clip>) {
        Toast.makeText(this, "กำลังรวม ${clips.size} คลิป…", Toast.LENGTH_SHORT).show()
        lifecycleScope.launch {
            val uri: Uri? = withContext(Dispatchers.IO) {
                val tmp = File(cacheDir, "merge_${session.dir.name}.mp4")
                try {
                    if (VideoMerger.merge(clips.map { it.file }, tmp)) {
                        GallerySaver.saveVideo(
                            this@ClipsActivity, tmp, "ROV_Highlight_${session.dir.name}_${System.currentTimeMillis() / 1000}.mp4",
                        )?.also { repo.markMerged(session.dir, it) }
                    } else {
                        null
                    }
                } finally {
                    tmp.delete()
                }
            }
            if (uri != null) {
                Toast.makeText(this@ClipsActivity, "เซฟลงอัลบั้ม \"${GallerySaver.ALBUM}\" แล้ว", Toast.LENGTH_LONG).show()
                reload()
            } else {
                Toast.makeText(this@ClipsActivity, "รวมวิดีโอไม่สำเร็จ", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun openInGallery(uri: Uri) {
        try {
            startActivity(
                Intent(Intent.ACTION_VIEW).setDataAndType(uri, "video/mp4").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION),
            )
        } catch (e: Exception) {
            Toast.makeText(this, "เปิดวิดีโอไม่ได้", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadThumb(clip: ClipRepository.Clip, holder: ClipHolder) {
        val key = clip.file.path
        holder.b.thumb.tag = key
        thumbs.get(key)?.let {
            holder.b.thumb.setImageBitmap(it)
            return
        }
        holder.b.thumb.setImageDrawable(null)
        lifecycleScope.launch {
            val bmp = withContext(Dispatchers.IO) {
                try {
                    ThumbnailUtils.createVideoThumbnail(clip.file, Size(320, 180), null)
                } catch (e: Exception) {
                    null
                }
            } ?: return@launch
            thumbs.put(key, bmp)
            if (holder.b.thumb.tag == key) holder.b.thumb.setImageBitmap(bmp)
        }
    }

    private class SessionHolder(val b: ItemSessionBinding) : RecyclerView.ViewHolder(b.root)
    private class ClipHolder(val b: ItemClipBinding) : RecyclerView.ViewHolder(b.root)

    private inner class Adapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
        private var rows: List<Row> = emptyList()

        @android.annotation.SuppressLint("NotifyDataSetChanged")
        fun submit(newRows: List<Row>) {
            rows = newRows
            notifyDataSetChanged()
        }

        override fun getItemCount() = rows.size

        override fun getItemViewType(position: Int) = if (rows[position] is Row.Header) 0 else 1

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
            val inflater = LayoutInflater.from(parent.context)
            return if (viewType == 0) {
                SessionHolder(ItemSessionBinding.inflate(inflater, parent, false))
            } else {
                ClipHolder(ItemClipBinding.inflate(inflater, parent, false))
            }
        }

        override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
            when (val row = rows[position]) {
                is Row.Header -> {
                    val h = holder as SessionHolder
                    val s = row.session
                    h.b.title.text = sessionTitle(s.dir)
                    val totalSec = s.clips.sumOf { it.durationMs } / 1000
                    val merged = if (s.galleryUri != null) " • อยู่ในแกลเลอรีแล้ว" else ""
                    val kills = s.clips.count(repo::isKill)
                    h.b.subtitle.text =
                        "${s.clips.size} คลิป (ช็อตฆ่า $kills) • ${totalSec / 60}:${"%02d".format(totalSec % 60)} นาที$merged"
                    h.b.btnMerge.text = if (s.galleryUri != null) "ดูวิดีโอรวม" else "รวม & เซฟลงแกลเลอรี"
                    h.b.btnMerge.setOnClickListener {
                        val uri = s.galleryUri
                        if (uri != null) openInGallery(uri) else chooseMerge(s)
                    }
                    h.b.btnMerge.setOnLongClickListener {
                        chooseMerge(s)
                        true
                    }
                }
                is Row.ClipRow -> {
                    val h = holder as ClipHolder
                    val c = row.clip
                    h.b.label.text = c.type.title
                    val others = c.types.filter { it != c.type && it != HighlightType.BIG_FIGHT }
                    h.b.detail.text = if (others.isEmpty()) {
                        if (c.types.contains(HighlightType.BIG_FIGHT) && c.type != HighlightType.BIG_FIGHT) "+ ไฟต์ใหญ่" else ""
                    } else {
                        "+ " + others.joinToString { it.title }
                    }
                    val sec = c.durationMs / 1000
                    h.b.duration.text = "${sec / 60}:${"%02d".format(sec % 60)}"
                    h.b.root.setOnClickListener { play(c) }
                    h.b.btnPlay.setOnClickListener { play(c) }
                    h.b.btnShare.setOnClickListener { share(c) }
                    h.b.btnDelete.setOnClickListener { confirmDelete(c) }
                    loadThumb(c, h)
                }
            }
        }
    }
}
