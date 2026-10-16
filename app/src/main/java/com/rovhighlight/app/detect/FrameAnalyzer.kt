package com.rovhighlight.app.detect

import android.graphics.Bitmap
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.nio.ByteBuffer
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs

/**
 * Looks at downscaled screen frames: measures how much the picture moves and runs OCR
 * on the area where the game shows kill banners.
 */
class FrameAnalyzer(ocrEnabled: Boolean, private val listener: Listener) {

    interface Listener {
        fun onMotion(ptsUs: Long, motion: Double)
        fun onOcrHighlight(ptsUs: Long, type: HighlightType, text: String)
    }

    /** Set by the renderer while a frame is being handled; frames are skipped meanwhile. */
    val busy = AtomicBoolean(false)

    private val executor = Executors.newSingleThreadExecutor { r -> Thread(r, "FrameAnalyzer") }
    /** OCR callbacks may arrive after [close]; drop them instead of crashing. */
    private val callbackExecutor = Executor { r ->
        try {
            executor.execute(r)
        } catch (_: RejectedExecutionException) {
        }
    }
    private val recognizer: TextRecognizer? =
        if (ocrEnabled) TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS) else null
    private val ocrBusy = AtomicBoolean(false)
    @Volatile private var closed = false

    private var frame: Bitmap? = null
    private var pixels = IntArray(0)
    private var prevLuma: IntArray? = null

    /** Called on the render thread with an RGBA frame (top row first). */
    fun onFrame(buffer: ByteBuffer, width: Int, height: Int, ptsUs: Long) {
        if (closed) {
            busy.set(false)
            return
        }
        val bmp = frame?.takeIf { it.width == width && it.height == height }
            ?: Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).also { frame = it }
        bmp.copyPixelsFromBuffer(buffer)
        executor.execute {
            try {
                process(bmp, ptsUs)
            } catch (t: Throwable) {
                Log.w(TAG, "process", t)
            } finally {
                busy.set(false)
            }
        }
    }

    private fun process(bmp: Bitmap, ptsUs: Long) {
        val w = bmp.width
        val h = bmp.height
        if (pixels.size != w * h) pixels = IntArray(w * h)
        bmp.getPixels(pixels, 0, w, 0, 0, w, h)

        // Motion: mean luma difference on a coarse grid versus the previous frame.
        val cols = w / GRID_STEP
        val rows = h / GRID_STEP
        val luma = IntArray(cols * rows)
        var k = 0
        for (y in 0 until rows) {
            val row = (y * GRID_STEP + GRID_STEP / 2) * w
            for (x in 0 until cols) {
                val c = pixels[row + x * GRID_STEP + GRID_STEP / 2]
                luma[k++] = (((c shr 16) and 0xFF) * 299 + ((c shr 8) and 0xFF) * 587 + (c and 0xFF) * 114) / 1000
            }
        }
        val prev = prevLuma
        prevLuma = luma
        if (prev != null && prev.size == luma.size) {
            var sum = 0L
            for (i in luma.indices) sum += abs(luma[i] - prev[i])
            listener.onMotion(ptsUs, sum.toDouble() / luma.size)
        }

        // OCR on the upper-middle area: replays show "Double Kill" in a small bar at the top
        // centre, live games show a big banner a little lower. Upscaled because the bar text is small.
        val rec = recognizer ?: return
        if (closed || !ocrBusy.compareAndSet(false, true)) return
        val cw = (w * 0.60).toInt()
        val ch = (h * 0.42).toInt()
        val raw = Bitmap.createBitmap(bmp, (w * 0.20).toInt(), (h * 0.04).toInt(), cw, ch)
        val crop = Bitmap.createScaledBitmap(raw, cw * 2, ch * 2, true)
        if (crop !== raw) raw.recycle()
        rec.process(InputImage.fromBitmap(crop, 0))
            .addOnSuccessListener(callbackExecutor) { result ->
                val text = result.text
                if (text.isNotBlank()) {
                    KeywordMatcher.match(text)?.let { listener.onOcrHighlight(ptsUs, it, text) }
                }
            }
            .addOnFailureListener(callbackExecutor) { e -> Log.w(TAG, "ocr", e) }
            .addOnCompleteListener(callbackExecutor) {
                crop.recycle()
                ocrBusy.set(false)
            }
    }

    fun close() {
        closed = true
        executor.execute {
            recognizer?.close()
        }
        executor.shutdown()
    }

    companion object {
        private const val TAG = "FrameAnalyzer"
        private const val GRID_STEP = 10
    }
}
