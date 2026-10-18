package com.irisli.quzhan

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.media.app.NotificationCompat.MediaStyle
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import java.io.File

class PlaybackService : Service() {
    private lateinit var session: MediaSessionCompat
    private var foregroundStarted = false

    override fun onCreate() {
        super.onCreate()
        createChannel()
        session = MediaSessionCompat(this, "QuzhanPlayback").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() = QuzhanBridge.dispatchMediaAction("toggle")
                override fun onPause() = QuzhanBridge.dispatchMediaAction("toggle")
                override fun onSkipToNext() = QuzhanBridge.dispatchMediaAction("next")
                override fun onSkipToPrevious() = QuzhanBridge.dispatchMediaAction("previous")
                override fun onStop() = stopSelf()
            })
            isActive = true
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_PREVIOUS -> QuzhanBridge.dispatchMediaAction("previous")
            ACTION_NEXT -> QuzhanBridge.dispatchMediaAction("next")
            ACTION_TOGGLE -> QuzhanBridge.dispatchMediaAction("toggle")
            ACTION_UPDATE, ACTION_START -> render(intent)
            else -> Unit
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        session.isActive = false
        session.release()
        if (foregroundStarted) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            foregroundStarted = false
        }
        super.onDestroy()
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    private fun render(intent: Intent) {
        val title = intent.getStringExtra(EXTRA_TITLE) ?: getString(R.string.app_name)
        val artist = intent.getStringExtra(EXTRA_ARTIST) ?: ""
        val coverPath = intent.getStringExtra(EXTRA_COVER) ?: ""
        val playing = intent.getBooleanExtra(EXTRA_PLAYING, false)
        val cover = loadCover(coverPath)

        val metadata = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, -1)
            .apply {
                if (cover != null) putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, cover)
            }
            .build()
        session.setMetadata(metadata)
        session.setPlaybackState(
            PlaybackStateCompat.Builder()
                .setActions(
                    PlaybackStateCompat.ACTION_PLAY or
                        PlaybackStateCompat.ACTION_PAUSE or
                        PlaybackStateCompat.ACTION_PLAY_PAUSE or
                        PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                        PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                        PlaybackStateCompat.ACTION_STOP,
                )
                .setState(
                    if (playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED,
                    0L,
                    if (playing) 1f else 0f,
                )
                .build(),
        )

        val toggleIntent = serviceIntent(ACTION_TOGGLE, 10)
        val previousIntent = serviceIntent(ACTION_PREVIOUS, 11)
        val nextIntent = serviceIntent(ACTION_NEXT, 12)
        val stopIntent = serviceIntent(ACTION_STOP, 13)
        val contentIntent = PendingIntent.getActivity(
            this,
            20,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(artist)
            .setContentIntent(contentIntent)
            .setLargeIcon(cover)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(playing)
            .addAction(
                android.R.drawable.ic_media_previous,
                getString(R.string.notification_previous),
                previousIntent,
            )
            .addAction(
                if (playing) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play,
                getString(if (playing) R.string.notification_pause else R.string.notification_play),
                toggleIntent,
            )
            .addAction(
                android.R.drawable.ic_media_next,
                getString(R.string.notification_next),
                nextIntent,
            )
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                getString(R.string.notification_stop),
                stopIntent,
            )
            .setStyle(
                MediaStyle()
                    .setMediaSession(session.sessionToken)
                    .setShowActionsInCompactView(0, 1, 2),
            )
            .build()

        if (!foregroundStarted) {
            startForeground(NOTIFICATION_ID, notification)
            foregroundStarted = true
        } else {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(NOTIFICATION_ID, notification)
        }
    }

    private fun serviceIntent(action: String, requestCode: Int): PendingIntent {
        return PendingIntent.getService(
            this,
            requestCode,
            Intent(this, PlaybackService::class.java).setAction(action),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun loadCover(path: String): Bitmap? {
        val file = FileSafety.resolveWithin(File(filesDir, "covers"), path) ?: return null
        if (!file.isFile) return null
        return try {
            BitmapFactory.decodeFile(file.absolutePath)
        } catch (_: Exception) {
            null
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = getString(R.string.notification_channel_description)
            setShowBadge(false)
        }
        manager.createNotificationChannel(channel)
    }

    companion object {
        private const val CHANNEL_ID = "quzhan-playback"
        private const val NOTIFICATION_ID = 4102
        private const val ACTION_START = "com.irisli.quzhan.START"
        private const val ACTION_UPDATE = "com.irisli.quzhan.UPDATE"
        private const val ACTION_STOP = "com.irisli.quzhan.STOP"
        private const val ACTION_TOGGLE = "com.irisli.quzhan.TOGGLE"
        private const val ACTION_PREVIOUS = "com.irisli.quzhan.PREVIOUS"
        private const val ACTION_NEXT = "com.irisli.quzhan.NEXT"
        private const val EXTRA_TITLE = "title"
        private const val EXTRA_ARTIST = "artist"
        private const val EXTRA_COVER = "cover"
        private const val EXTRA_PLAYING = "playing"

        fun update(
            context: Context,
            title: String,
            artist: String,
            coverPath: String,
            playing: Boolean,
        ) {
            val intent = Intent(context, PlaybackService::class.java)
                .setAction(if (playing) ACTION_START else ACTION_UPDATE)
                .putExtra(EXTRA_TITLE, title)
                .putExtra(EXTRA_ARTIST, artist)
                .putExtra(EXTRA_COVER, coverPath)
                .putExtra(EXTRA_PLAYING, playing)
            try {
                ContextCompat.startForegroundService(context, intent)
            } catch (_: Exception) {
                // The app can still play while the notification is unavailable.
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, PlaybackService::class.java))
        }
    }
}
