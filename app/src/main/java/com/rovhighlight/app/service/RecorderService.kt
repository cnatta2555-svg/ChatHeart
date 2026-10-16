package com.rovhighlight.app.service

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.hardware.display.DisplayManager
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.DisplayMetrics
import android.util.Log
import android.view.Display
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import androidx.core.content.IntentCompat
import com.rovhighlight.app.R
import com.rovhighlight.app.capture.AudioCapture
import com.rovhighlight.app.capture.MediaRingBuffer
import com.rovhighlight.app.capture.ScreenRenderer
import com.rovhighlight.app.capture.VideoEncoder
import com.rovhighlight.app.clip.ClipRepository
import com.rovhighlight.app.clip.ClipScheduler
import com.rovhighlight.app.clip.ClipWriter
import com.rovhighlight.app.clip.GallerySaver
import com.rovhighlight.app.clip.HighlightExport
import com.rovhighlight.app.data.Prefs
import com.rovhighlight.app.detect.FightDetector
import com.rovhighlight.app.detect.FrameAnalyzer
import com.rovhighlight.app.detect.HighlightType
import com.rovhighlight.app.ui.ClipsActivity
import com.rovhighlight.app.ui.MainActivity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.File
import java.util.Locale
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

/**
 * Foreground service that mirrors the screen into an in-memory ring buffer, watches it
 * for highlights and writes only those moments to clips. On stop it joins the clips into
 * one video in the gallery.
 */
class RecorderService : Service(), FrameAnalyzer.Listener {

    data class State(
        val running: Boolean = false,
        val busy: Boolean = false,
        val clipCount: Int = 0,
        val lastType: HighlightType? = null,
        val audio: Boolean = false,
        val message: String = "",
    )

    companion object {
        private const val TAG = "RecorderService"
        const val ACTION_START = "com.rovhighlight.app.START"
        const val ACTION_SAVE = "com.rovhighlight.app.SAVE"
        const val ACTION_STOP = "com.rovhighlight.app.STOP"
        private const val EXTRA_RESULT_CODE = "result_code"
        private const val EXTRA_DATA = "data"

        private const val CHANNEL_RECORDING = "recording"
        private const val CHANNEL_DONE = "done"
        private const val NOTIF_ID = 1
        private const val NOTIF_DONE_ID = 2

        private const val TICK_MS = 250L
        private const val ANALYSIS_INTERVAL_MS = 500L
        private const val MAX_CLIP_US = 60_000_000L
        private const val MAX_RETENTION_US = 90_000_000L
        private const val WRITE_MARGIN_US = 500_000L
        private const val TYPE_COOLDOWN_US = 4_000_000L

        private val _state = MutableStateFlow(State())
        val state: StateFlow<State> = _state

        fun start(context: Context, resultCode: Int, data: Intent) {
            val i = Intent(context, RecorderService::class.java)
                .setAction(ACTION_START)
                .putExtra(EXTRA_RESULT_CODE, resultCode)
                .putExtra(EXTRA_DATA, data)
            ContextCompat.startForegroundService(context, i)
        }

        fun send(context: Context, action: String) {
            context.startService(Intent(context, RecorderService::class.java).setAction(action))
        }

        private fun nowUs() = System.nanoTime() / 1000
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private val writer = Executors.newSingleThreadExecutor { r -> Thread(r, "ClipWriter") }
    private lateinit var prefs: Prefs
    private lateinit var repo: ClipRepository

    private var projection: MediaProjection? = null
    private var renderer: ScreenRenderer? = null
    private var videoEncoder: VideoEncoder? = null
    private var audioCapture: AudioCapture? = null
    private var analyzer: FrameAnalyzer? = null
    private var floating: FloatingButton? = null

    private var ring = MediaRingBuffer()
    private var scheduler = ClipScheduler(12_000_000, 5_000_000, MAX_CLIP_US)
    private var fight = FightDetector(3)
    private var fightEnabled = true
    private var preUs = 12_000_000L
    private var postUs = 5_000_000L
    private var sessionDir: File? = null
    private val readyWindows = mutableListOf<ClipScheduler.Window>()
    private val lastEventByType = HashMap<HighlightType, Long>()
    private val clipIndex = AtomicInteger(0)
    private val clipCount = AtomicInteger(0)

    private var running = false
    private var stopping = false

    private val projectionCallback = object : MediaProjection.Callback() {
        override fun onStop() {
            mainHandler.post { stopCapture() }
        }
    }

    private val tick = object : Runnable {
        override fun run() {
            onTick()
            if (running) mainHandler.postDelayed(this, TICK_MS)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        prefs = Prefs(this)
        repo = ClipRepository(this)
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_RECORDING, "กำลังจับไฮไลท์", NotificationManager.IMPORTANCE_LOW),
        )
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_DONE, "ไฮไลท์เสร็จแล้ว", NotificationManager.IMPORTANCE_DEFAULT),
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent)
            ACTION_SAVE -> saveManual()
            ACTION_STOP -> stopCapture()
            else -> if (!running && !stopping) stopSelf()
        }
        return START_NOT_STICKY
    }

    // ---- start -------------------------------------------------------------------------

    private fun handleStart(intent: Intent) {
        if (running || stopping) return
        ServiceCompat.startForeground(
            this, NOTIF_ID, buildNotification("กำลังเริ่ม…", actions = false),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION,
        )
        val code = intent.getIntExtra(EXTRA_RESULT_CODE, 0)
        val data = IntentCompat.getParcelableExtra(intent, EXTRA_DATA, Intent::class.java)
        if (data == null) {
            fail("ไม่ได้รับสิทธิ์อัดหน้าจอ")
            return
        }
        try {
            startCapture(code, data)
        } catch (e: Exception) {
            Log.e(TAG, "start failed", e)
            releaseCapture()
            fail("เริ่มอัดไม่สำเร็จ: ${e.message}")
        }
    }

    private fun startCapture(code: Int, data: Intent) {
        val mpm = getSystemService(MediaProjectionManager::class.java)
        val mp = mpm.getMediaProjection(code, data) ?: throw IllegalStateException("MediaProjection = null")
        projection = mp
        mp.registerCallback(projectionCallback, mainHandler)

        // Encode in landscape (RoV is played sideways) at the screen's aspect ratio.
        val dm = DisplayMetrics()
        @Suppress("DEPRECATION")
        getSystemService(DisplayManager::class.java).getDisplay(Display.DEFAULT_DISPLAY).getRealMetrics(dm)
        val longSide = maxOf(dm.widthPixels, dm.heightPixels)
        val shortSide = minOf(dm.widthPixels, dm.heightPixels)
        val wanted = minOf(if (prefs.highQuality) 1920 else 1280, longSide)
        val encW = wanted / 16 * 16
        val encH = (encW.toLong() * shortSide / longSide).toInt() / 16 * 16
        val bitrate = if (prefs.highQuality) 12_000_000 else 6_000_000

        ring = MediaRingBuffer()
        preUs = prefs.preSeconds * 1_000_000L
        postUs = prefs.postSeconds * 1_000_000L
        scheduler = ClipScheduler(preUs, postUs, MAX_CLIP_US)
        fight = FightDetector(prefs.sensitivity)
        fightEnabled = prefs.fightEnabled
        readyWindows.clear()
        lastEventByType.clear()
        clipIndex.set(0)
        clipCount.set(0)

        val encoder = VideoEncoder.create(encW, encH, bitrate, ring)
        videoEncoder = encoder

        val audioAllowed = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        if (prefs.audioEnabled && audioAllowed) {
            audioCapture = try {
                AudioCapture(mp, ring).also { it.start() }
            } catch (e: Exception) {
                Log.w(TAG, "audio capture unavailable", e)
                null
            }
        }

        val an = FrameAnalyzer(prefs.ocrEnabled, this)
        analyzer = an
        val aw = minOf(1280, encoder.width)
        val ah = (aw.toLong() * encoder.height / encoder.width).toInt() / 2 * 2
        val r = ScreenRenderer(
            mp, encoder.inputSurface, encoder.width, encoder.height, dm.densityDpi,
            aw, ah, ANALYSIS_INTERVAL_MS, an.busy, an::onFrame,
        )
        renderer = r
        r.start()

        sessionDir = repo.newSessionDir()
        running = true
        if (prefs.floatingButton) {
            floating = FloatingButton(this, onTap = ::saveManual, onLongPress = ::stopCapture).also { it.show() }
        }
        mainHandler.postDelayed(tick, TICK_MS)
        val msg = "กำลังจับไฮไลท์ — เปิด ROV แล้วดู replay ได้เลย"
        _state.value = State(running = true, audio = audioCapture != null, message = msg)
        notifyRecording(msg)
    }

    // ---- events --------------------------------------------------------------------------

    private fun addEvent(tUs: Long, type: HighlightType, cooldown: Boolean = true) {
        if (!running) return
        if (cooldown) {
            val last = lastEventByType[type]
            if (last != null && tUs - last in 0 until TYPE_COOLDOWN_US) return
            lastEventByType[type] = tUs
        }
        Log.i(TAG, "event $type at $tUs")
        scheduler.onEvent(tUs, type)?.let { readyWindows += it }
    }

    private fun saveManual() {
        if (!running) return
        addEvent(nowUs(), HighlightType.MANUAL, cooldown = false)
        floating?.flash() // no toast: it would show up in the clip
    }

    override fun onMotion(ptsUs: Long, motion: Double) {
        mainHandler.post {
            if (!running || !fightEnabled) return@post
            val audioDb = audioCapture?.takeIf { it.hasSignal }?.loudnessDb
            when (val r = fight.update(ptsUs, motion, audioDb)) {
                is FightDetector.Result.Trigger -> addEvent(r.eventUs, HighlightType.BIG_FIGHT, cooldown = false)
                FightDetector.Result.Extend -> addEvent(ptsUs, HighlightType.BIG_FIGHT, cooldown = false)
                FightDetector.Result.None -> Unit
            }
        }
    }

    override fun onOcrHighlight(ptsUs: Long, type: HighlightType, text: String) {
        Log.i(TAG, "OCR $type: ${text.replace('\n', ' ')}")
        mainHandler.post { addEvent(ptsUs, type) }
    }

    // ---- clip writing ---------------------------------------------------------------------

    /** Keeps the floating button blurred out of the video, following drags and rotation. */
    private fun updateButtonMask() {
        val r = renderer ?: return
        val enc = videoEncoder ?: return
        val circle = floating?.screenCircle()
        if (circle == null) {
            r.setMask(0f, 0f, 0f)
            return
        }
        // The mirrored screen is scaled to fit the (landscape) frame, centred.
        val dm = DisplayMetrics()
        @Suppress("DEPRECATION")
        getSystemService(DisplayManager::class.java).getDisplay(Display.DEFAULT_DISPLAY).getRealMetrics(dm)
        val scale = minOf(enc.width.toFloat() / dm.widthPixels, enc.height.toFloat() / dm.heightPixels)
        val offX = (enc.width - dm.widthPixels * scale) / 2
        val offY = (enc.height - dm.heightPixels * scale) / 2
        r.setMask(offX + circle[0] * scale, offY + circle[1] * scale, circle[2] * scale)
    }

    private fun onTick() {
        if (!running) return
        updateButtonMask()
        val now = nowUs()
        scheduler.poll(now)?.let { readyWindows += it }

        val due = readyWindows.filter { now >= it.endUs + WRITE_MARGIN_US }
        if (due.isNotEmpty()) {
            readyWindows -= due.toSet()
            for (w in due) {
                // Snapshot now (cheap, references only) so later trimming can't drop the footage.
                val snap = ring.snapshot(w.startUs, w.endUs) ?: continue
                writer.execute { writeSnapshot(snap, w) }
            }
        }

        // Keep enough history for the pre-roll and for any window still waiting to be written.
        var keepFrom = now - (preUs + postUs + 3_000_000L)
        scheduler.pendingStartUs?.let { keepFrom = minOf(keepFrom, it) }
        readyWindows.minOfOrNull { it.startUs }?.let { keepFrom = minOf(keepFrom, it) }
        ring.trim(maxOf(keepFrom - 1_000_000L, now - MAX_RETENTION_US))
    }

    /** Runs on the writer thread. */
    private fun writeSnapshot(snap: MediaRingBuffer.Snapshot, w: ClipScheduler.Window) {
        val dir = sessionDir ?: return
        val best = w.best
        val file = File(dir, String.format(Locale.US, "clip_%03d_%s.mp4", clipIndex.incrementAndGet(), best.name))
        if (!ClipWriter.write(file, snap)) {
            file.delete()
            return
        }
        repo.saveMeta(file, w.types, snap.durationUs / 1000)
        val n = clipCount.incrementAndGet()
        mainHandler.post {
            floating?.setCount(n)
            if (running) {
                val msg = "ได้แล้ว $n คลิป • ล่าสุด: ${best.title}"
                _state.value = _state.value.copy(clipCount = n, lastType = best, message = msg)
                notifyRecording(msg)
            }
        }
    }

    // ---- stop ------------------------------------------------------------------------------

    private fun stopCapture() {
        if (!running || stopping) return
        stopping = true
        running = false
        mainHandler.removeCallbacks(tick)
        floating?.hide()
        floating = null

        scheduler.flush(nowUs())?.let { readyWindows += it }
        val windows = readyWindows.toList()
        readyWindows.clear()

        val msg = "กำลังตัดต่อวิดีโอไฮไลท์…"
        _state.value = _state.value.copy(running = false, busy = true, message = msg)
        notifyRecording(msg, actions = false)

        val autoMerge = prefs.autoMerge
        val killsOnly = prefs.mergeKillsOnly
        val vertical = prefs.verticalStyle
        writer.execute {
            releaseCapture() // drains the encoders so the last seconds are in the buffer
            for (w in windows) {
                ring.snapshot(w.startUs, w.endUs)?.let { writeSnapshot(it, w) }
            }
            ring.clear()
            val count = clipCount.get()
            val dir = sessionDir
            val clips = dir?.let { repo.clips(it) }.orEmpty()
            val toMerge = if (killsOnly) clips.filter(repo::isKill) else clips
            val uri = if (autoMerge && dir != null && toMerge.isNotEmpty()) mergeToGallery(dir, toMerge, vertical) else null
            dir?.let { repo.deleteIfEmpty(it) }
            mainHandler.post { finish(count, toMerge.size, killsOnly, uri, autoMerge) }
        }
    }

    /** Joins the given clips of the session and stores them in the gallery. Runs on the writer thread. */
    private fun mergeToGallery(dir: File, clips: List<ClipRepository.Clip>, vertical: Boolean): Uri? {
        val files = clips.map { it.file }
        val tmp = File(cacheDir, "merge_${dir.name}.mp4")
        return try {
            if (!HighlightExport.build(files, tmp, vertical)) return null
            GallerySaver.saveVideo(this, tmp, "ROV_Highlight_${dir.name}.mp4")?.also { repo.markMerged(dir, it) }
        } finally {
            tmp.delete()
        }
    }

    private fun releaseCapture() {
        try { renderer?.release() } catch (e: Exception) { Log.w(TAG, "renderer", e) }
        renderer = null
        try { videoEncoder?.stop() } catch (e: Exception) { Log.w(TAG, "video", e) }
        videoEncoder = null
        try { audioCapture?.stop() } catch (e: Exception) { Log.w(TAG, "audio", e) }
        audioCapture = null
        analyzer?.close()
        analyzer = null
        projection?.let {
            it.unregisterCallback(projectionCallback)
            try { it.stop() } catch (e: Exception) { Log.w(TAG, "projection", e) }
        }
        projection = null
    }

    private fun finish(count: Int, merged: Int, killsOnly: Boolean, uri: Uri?, autoMerge: Boolean) {
        val what = if (killsOnly) "ช็อตฆ่า" else "ไฮไลท์"
        val text = when {
            count == 0 -> "รอบนี้ไม่พบช็อตไฮไลท์"
            autoMerge && killsOnly && merged == 0 -> "รอบนี้ไม่พบช็อตฆ่า (ได้ $count คลิปอื่น ดูในหน้าคลิปของฉัน)"
            uri != null -> "รวม$what $merged คลิปเป็นวิดีโอเดียวในอัลบั้ม \"${GallerySaver.ALBUM}\" แล้ว"
            autoMerge -> "ได้ $count คลิป แต่รวมวิดีโอไม่สำเร็จ — ลองกดรวมใหม่ในหน้าคลิป"
            else -> "ได้ $count คลิป — ดูได้ในหน้าคลิปของฉัน"
        }
        val open = if (uri != null) {
            Intent(Intent.ACTION_VIEW).setDataAndType(uri, "video/mp4").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        } else {
            Intent(this, ClipsActivity::class.java)
        }
        val pi = PendingIntent.getActivity(
            this, 3, open, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val done = NotificationCompat.Builder(this, CHANNEL_DONE)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("ROV Highlight")
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build()
        if (canNotify()) getSystemService(NotificationManager::class.java).notify(NOTIF_DONE_ID, done)

        _state.value = State(running = false, busy = false, clipCount = count, message = text)
        stopping = false
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun fail(message: String) {
        _state.value = State(message = message)
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        if (running) {
            running = false
            mainHandler.removeCallbacks(tick)
            floating?.hide()
            releaseCapture()
            _state.value = State(message = "หยุดอัดแล้ว")
        }
        writer.shutdown()
        super.onDestroy()
    }

    // ---- notifications ------------------------------------------------------------------------

    private fun canNotify() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED || android.os.Build.VERSION.SDK_INT < 33

    private fun notifyRecording(text: String, actions: Boolean = true) {
        if (canNotify()) {
            getSystemService(NotificationManager::class.java).notify(NOTIF_ID, buildNotification(text, actions))
        }
    }

    private fun buildNotification(text: String, actions: Boolean): Notification {
        val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), flags,
        )
        val b = NotificationCompat.Builder(this, CHANNEL_RECORDING)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("ROV Highlight")
            .setContentText(text)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(open)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
        if (actions) {
            val save = PendingIntent.getService(
                this, 1, Intent(this, RecorderService::class.java).setAction(ACTION_SAVE), flags,
            )
            val stop = PendingIntent.getService(
                this, 2, Intent(this, RecorderService::class.java).setAction(ACTION_STOP), flags,
            )
            b.addAction(0, "เซฟช็อตนี้", save)
            b.addAction(0, "หยุด & รวมคลิป", stop)
        }
        return b.build()
    }
}
