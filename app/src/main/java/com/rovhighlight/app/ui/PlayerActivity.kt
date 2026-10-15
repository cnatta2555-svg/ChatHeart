package com.rovhighlight.app.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.MediaController
import androidx.appcompat.app.AppCompatActivity
import com.rovhighlight.app.databinding.ActivityPlayerBinding

class PlayerActivity : AppCompatActivity() {

    private lateinit var b: ActivityPlayerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivityPlayerBinding.inflate(layoutInflater)
        setContentView(b.root)
        val path = intent.getStringExtra(EXTRA_PATH) ?: return finish()
        val controller = MediaController(this)
        controller.setAnchorView(b.video)
        b.video.setMediaController(controller)
        b.video.setVideoPath(path)
        b.video.setOnPreparedListener { controller.show(2000) }
        b.video.start()
    }

    override fun onPause() {
        super.onPause()
        b.video.pause()
    }

    companion object {
        private const val EXTRA_PATH = "path"

        fun intent(context: Context, path: String) =
            Intent(context, PlayerActivity::class.java).putExtra(EXTRA_PATH, path)
    }
}
