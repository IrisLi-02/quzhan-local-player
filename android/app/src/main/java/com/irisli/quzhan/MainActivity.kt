package com.irisli.quzhan

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView
    private lateinit var mediaServer: MediaServer
    private var bridge: QuzhanBridge? = null
    private var pendingExistingPaths: List<String> = emptyList()

    private val audioPicker = registerForActivityResult(
        ActivityResultContracts.OpenMultipleDocuments(),
    ) { uris ->
        val selected = uris ?: emptyList()
        selected.forEach { uri ->
            try {
                contentResolver.takePersistableUriPermission(
                    uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION,
                )
            } catch (_: SecurityException) {
                // Some providers grant only a session-scoped URI.
            }
        }
        bridge?.onAudioPicked(selected, pendingExistingPaths)
        pendingExistingPaths = emptyList()
    }

    private val backgroundPicker = registerForActivityResult(
        ActivityResultContracts.OpenDocument(),
    ) { uri ->
        bridge?.onBackgroundPicked(uri)
    }

    private val scanPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        bridge?.onScanPermissionResult(granted)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(7, 10, 15)
        window.navigationBarColor = Color.rgb(7, 10, 15)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        mediaServer = MediaServer(this)
        if (!mediaServer.start()) {
            showStartupError()
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 41)
        }

        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(7, 10, 15))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowContentAccess = false
            settings.allowFileAccess = false
            settings.mediaPlaybackRequiresUserGesture = false
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.userAgentString = "${settings.userAgentString} QuzhanAndroid/${BuildConfig.VERSION_NAME}"
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.rgb(7, 10, 15))
            addView(
                webView,
                FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                ),
            )
        }
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout(),
            )
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest,
            ): Boolean {
                val uri = request.url
                if (uri.host == "127.0.0.1" && uri.port == mediaServer.port) return false
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    true
                } catch (_: Exception) {
                    true
                }
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                if (BuildConfig.DEBUG) {
                    Log.d("QuzhanWeb", "${message.message()} @ ${message.lineNumber()}")
                }
                return true
            }
        }

        bridge = QuzhanBridge(this, webView, mediaServer.baseUrl)
        webView.addJavascriptInterface(bridge!!, "QuzhanAndroid")
        setContentView(root)
        webView.loadUrl("${mediaServer.baseUrl}/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(BACK_SCRIPT) { result ->
                    if (result?.contains("handled") != true) moveTaskToBack(true)
                }
            }
        })
    }

    fun launchAudioPicker(existingPaths: List<String>) {
        pendingExistingPaths = existingPaths
        audioPicker.launch(
            arrayOf(
                "audio/*",
                "application/ogg",
                "application/octet-stream",
                "text/plain",
                "application/x-subrip",
            ),
        )
    }

    fun launchBackgroundPicker() {
        backgroundPicker.launch(arrayOf("image/*"))
    }

    fun hasAudioReadPermission(): Boolean {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_AUDIO
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
        return ContextCompat.checkSelfPermission(this, permission) ==
            PackageManager.PERMISSION_GRANTED
    }

    fun requestAudioScanPermission() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_AUDIO
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
        scanPermission.launch(permission)
    }

    override fun onDestroy() {
        PlaybackService.stop(this)
        bridge?.close()
        bridge = null
        if (::webView.isInitialized) {
            webView.removeJavascriptInterface("QuzhanAndroid")
            webView.destroy()
        }
        if (::mediaServer.isInitialized) mediaServer.stop()
        super.onDestroy()
    }

    private fun showStartupError() {
        val view = TextView(this).apply {
            text = "曲栈无法启动本地媒体服务。请重新启动应用。"
            setTextColor(Color.rgb(241, 232, 219))
            setBackgroundColor(Color.rgb(7, 10, 15))
            textSize = 16f
            setPadding(48, 96, 48, 48)
        }
        setContentView(view)
    }

    companion object {
        private const val BACK_SCRIPT = """
            (function () {
              const settings = document.getElementById('settingsBackdrop');
              if (settings && !settings.hidden) {
                document.getElementById('settingsCloseButton')?.click();
                return 'handled';
              }
              const closeDialog = document.getElementById('closeDialog');
              if (closeDialog && !closeDialog.hidden) {
                document.getElementById('closeDialogCancel')?.click();
                return 'handled';
              }
              const confirmDialog = document.getElementById('confirmDialog');
              if (confirmDialog && !confirmDialog.hidden) {
                document.getElementById('confirmCancel')?.click();
                return 'handled';
              }
              const shell = document.getElementById('appShell');
              if (shell && !shell.classList.contains('queue-collapsed')) {
                document.getElementById('queueCollapseButton')?.click();
                return 'handled';
              }
              return 'exit';
            })()
        """
    }
}
