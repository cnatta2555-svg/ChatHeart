package com.rovhighlight.app.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.projection.MediaProjectionConfig
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.rovhighlight.app.data.Prefs
import com.rovhighlight.app.databinding.ActivityMainBinding
import com.rovhighlight.app.service.RecorderService
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var b: ActivityMainBinding
    private lateinit var prefs: Prefs

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { checkOverlayThenCapture() }

    private val overlayLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { requestCapture() }

    private val captureLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val data = result.data
            if (result.resultCode == RESULT_OK && data != null) {
                RecorderService.start(this, result.resultCode, data)
                launchRov()
            } else {
                Toast.makeText(this, "ยกเลิกการอัดหน้าจอ", Toast.LENGTH_SHORT).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        supportActionBar?.hide()
        b = ActivityMainBinding.inflate(layoutInflater)
        setContentView(b.root)
        prefs = Prefs(this)

        b.btnStart.setOnClickListener { requestPermissions() }
        b.btnSave.setOnClickListener { RecorderService.send(this, RecorderService.ACTION_SAVE) }
        b.btnStop.setOnClickListener { RecorderService.send(this, RecorderService.ACTION_STOP) }
        b.btnClips.setOnClickListener { startActivity(Intent(this, ClipsActivity::class.java)) }
        bindSettings()

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                RecorderService.state.collect { s ->
                    b.statusTitle.text = when {
                        s.running -> "● กำลังจับไฮไลท์ (${s.clipCount} คลิป)"
                        s.busy -> "กำลังรวมคลิป…"
                        else -> "พร้อมใช้งาน"
                    }
                    if (s.message.isNotEmpty()) b.statusText.text = s.message
                    b.progress.isVisible = s.busy
                    b.btnStart.isVisible = !s.running && !s.busy
                    b.btnSave.isVisible = s.running
                    b.btnStop.isVisible = s.running
                }
            }
        }
    }

    private fun bindSettings() {
        b.swOcr.isChecked = prefs.ocrEnabled
        b.swFight.isChecked = prefs.fightEnabled
        b.swAudio.isChecked = prefs.audioEnabled
        b.swFloating.isChecked = prefs.floatingButton
        b.swMerge.isChecked = prefs.autoMerge
        b.swKillsOnly.isChecked = prefs.mergeKillsOnly
        b.swVertical.isChecked = prefs.verticalStyle
        b.swHq.isChecked = prefs.highQuality
        b.sliderSensitivity.value = prefs.sensitivity.toFloat()
        updateSensitivityLabel(prefs.sensitivity)

        b.swOcr.setOnCheckedChangeListener { _, v -> prefs.ocrEnabled = v }
        b.swFight.setOnCheckedChangeListener { _, v -> prefs.fightEnabled = v }
        b.swAudio.setOnCheckedChangeListener { _, v -> prefs.audioEnabled = v }
        b.swFloating.setOnCheckedChangeListener { _, v -> prefs.floatingButton = v }
        b.swMerge.setOnCheckedChangeListener { _, v -> prefs.autoMerge = v }
        b.swKillsOnly.setOnCheckedChangeListener { _, v -> prefs.mergeKillsOnly = v }
        b.swVertical.setOnCheckedChangeListener { _, v -> prefs.verticalStyle = v }
        b.swHq.setOnCheckedChangeListener { _, v -> prefs.highQuality = v }
        b.sliderSensitivity.addOnChangeListener { _, value, _ ->
            prefs.sensitivity = value.toInt()
            updateSensitivityLabel(value.toInt())
        }
    }

    private fun updateSensitivityLabel(v: Int) {
        val word = arrayOf("น้อยมาก", "น้อย", "ปานกลาง", "มาก", "มากที่สุด")[v.coerceIn(1, 5) - 1]
        b.sensitivityLabel.text = "ความไวในการจับไฟต์: $word"
    }

    private fun requestPermissions() {
        val needed = buildList {
            if (Build.VERSION.SDK_INT >= 33) add(Manifest.permission.POST_NOTIFICATIONS)
            if (prefs.audioEnabled) add(Manifest.permission.RECORD_AUDIO)
        }.filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (needed.isEmpty()) checkOverlayThenCapture() else permissionLauncher.launch(needed.toTypedArray())
    }

    private fun checkOverlayThenCapture() {
        if (!prefs.floatingButton || Settings.canDrawOverlays(this)) {
            requestCapture()
            return
        }
        MaterialAlertDialogBuilder(this)
            .setTitle("อนุญาตปุ่มลอย")
            .setMessage("ปุ่มลอยใช้กดเซฟช็อตเองระหว่างดู replay\nให้เปิด “แสดงทับแอปอื่น” สำหรับ ROV Highlight แล้วกดย้อนกลับ")
            .setPositiveButton("ไปตั้งค่า") { _, _ ->
                overlayLauncher.launch(
                    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")),
                )
            }
            .setNegativeButton("ข้าม") { _, _ -> requestCapture() }
            .show()
    }

    private fun requestCapture() {
        val mpm = getSystemService(MediaProjectionManager::class.java)
        val intent = if (Build.VERSION.SDK_INT >= 34) {
            // Ask for the whole screen directly (the game runs in another app).
            mpm.createScreenCaptureIntent(MediaProjectionConfig.createConfigForDefaultDisplay())
        } else {
            mpm.createScreenCaptureIntent()
        }
        captureLauncher.launch(intent)
    }

    private fun launchRov() {
        val launch = packageManager.getLaunchIntentForPackage(ROV_PACKAGE)
        if (launch != null) {
            startActivity(launch)
        } else {
            Toast.makeText(this, "เริ่มแล้ว — สลับไปเปิด ROV ได้เลย", Toast.LENGTH_LONG).show()
            moveTaskToBack(true)
        }
    }

    companion object {
        private const val ROV_PACKAGE = "com.garena.game.kgth"
    }
}
