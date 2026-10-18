package com.irisli.quzhan

import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.lang.ref.WeakReference
import java.util.concurrent.Executors

class QuzhanBridge(
    private val activity: MainActivity,
    private val webView: WebView,
    private val mediaBaseUrl: String,
) {
    private val stateStore = StateStore(activity)
    private val executor = Executors.newSingleThreadExecutor()
    @Volatile
    private var pendingScanExistingPaths: List<String> = emptyList()

    init {
        active = WeakReference(this)
        UpdateManager.cleanup(activity)
        executor.execute {
            MediaCleanup.cleanup(activity, stateStore.read())
        }
    }

    @JavascriptInterface
    fun mediaBaseUrl(): String = mediaBaseUrl

    @JavascriptInterface
    fun getState(): String = stateStore.read()

    @JavascriptInterface
    fun getAppInfo(): String = JSONObject()
        .put("version", BuildConfig.VERSION_NAME)
        .put("platform", "android")
        .put("tech", "Android WebView · Kotlin")
        .toString()

    @JavascriptInterface
    fun checkForUpdate() {
        executor.execute {
            deliverUpdateInfo(UpdateManager.check(activity))
        }
    }

    @JavascriptInterface
    fun installUpdate(updateJson: String) {
        executor.execute {
            val download = JSONObject(
                UpdateManager.download(activity, updateJson) { percent ->
                    deliverUpdateProgress(
                        JSONObject().put("percent", percent).toString(),
                    )
                },
            )
            if (download.optBoolean("ok")) {
                val launched = UpdateManager.launchInstaller(
                    activity,
                    download.optString("path"),
                )
                deliverUpdateResult(launched.toString())
            } else {
                deliverUpdateResult(download.toString())
            }
        }
    }

    @JavascriptInterface
    fun saveState(raw: String): Boolean = stateStore.write(raw)

    @JavascriptInterface
    fun flushState(raw: String): Boolean = stateStore.write(raw)

    @JavascriptInterface
    fun pickAudio(existingPathsJson: String) {
        val existing = mutableListOf<String>()
        try {
            val array = JSONArray(existingPathsJson)
            for (index in 0 until array.length()) {
                val value = array.optString(index)
                if (value.isNotBlank()) existing.add(value)
            }
        } catch (_: Exception) {
            // A malformed list only disables de-duplication for this import.
        }
        activity.runOnUiThread {
            activity.launchAudioPicker(existing)
        }
    }

    @JavascriptInterface
    fun pickBackground() {
        activity.runOnUiThread {
            activity.launchBackgroundPicker()
        }
    }

    @JavascriptInterface
    fun scanLocalMusic(existingPathsJson: String) {
        val existing = mutableListOf<String>()
        try {
            val array = JSONArray(existingPathsJson)
            for (index in 0 until array.length()) {
                val value = array.optString(index)
                if (value.isNotBlank()) existing.add(value)
            }
        } catch (_: Exception) {
            // A malformed list only disables de-duplication for this scan.
        }
        pendingScanExistingPaths = existing
        activity.runOnUiThread {
            if (activity.hasAudioReadPermission()) {
                startScan()
            } else {
                activity.requestAudioScanPermission()
            }
        }
    }

    fun onScanPermissionResult(granted: Boolean) {
        if (granted) {
            startScan()
        } else {
            deliverScan(
                JSONObject()
                    .put("items", JSONArray())
                    .put(
                        "errors",
                        JSONArray().put(
                            JSONObject()
                                .put("path", "")
                                .put("code", "PERMISSION_DENIED")
                                .put("message", "未获得本地音乐读取权限"),
                        ),
                    )
                    .put("skipped", 0)
                    .toString(),
            )
        }
    }

    @JavascriptInterface
    fun clearBackground(): Boolean {
        return try {
            MediaImporter.clearBackground(activity)
            true
        } catch (_: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun getCoverPalette(filePath: String): String {
        return MediaImporter.coverPalette(activity, filePath) ?: ""
    }

    @JavascriptInterface
    fun getCoverArtwork(filePath: String): String {
        val file = FileSafety.resolveWithin(File(activity.filesDir, "covers"), filePath)
        return if (file != null && file.isFile) file.absolutePath else ""
    }

    @JavascriptInterface
    fun cleanupCovers(): Int {
        return try {
            MediaCleanup.cleanup(activity, stateStore.read())
        } catch (_: Exception) {
            0
        }
    }

    @JavascriptInterface
    fun setPlaybackState(raw: String) {
        try {
            val payload = JSONObject(raw)
            val title = payload.optString("title").trim()
            if (title.isBlank()) {
                stopPlaybackService()
                return
            }
            PlaybackService.update(
                activity,
                title = title,
                artist = payload.optString("artist").trim(),
                coverPath = payload.optString("coverPath").trim(),
                playing = payload.optBoolean("playing", false),
            )
        } catch (_: Exception) {
            // Ignore malformed notification payloads from the renderer.
        }
    }

    @JavascriptInterface
    fun stopPlaybackService() {
        PlaybackService.stop(activity)
    }

    fun onAudioPicked(uris: List<Uri>, existingPaths: List<String>) {
        executor.execute {
            val result = MediaImporter.importAudio(activity, uris, existingPaths.toSet())
            deliverImport(result)
        }
    }

    fun onBackgroundPicked(uri: Uri?) {
        val result = if (uri == null) {
            JSONObject().put("ok", false).put("code", "CANCELLED").toString()
        } else {
            MediaImporter.importBackground(activity, uri)
        }
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeBackground(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    fun close() {
        executor.shutdownNow()
        if (active?.get() === this) active = null
    }

    private fun startScan() {
        val existing = pendingScanExistingPaths
        pendingScanExistingPaths = emptyList()
        executor.execute {
            val result = MediaImporter.scanLocalMusic(activity, existing.toSet())
            deliverScan(result)
            val items = try {
                JSONObject(result).optJSONArray("items") ?: JSONArray()
            } catch (_: Exception) {
                JSONArray()
            }
            val tracks = mutableListOf<Pair<String, String>>()
            for (index in 0 until items.length()) {
                val item = items.optJSONObject(index) ?: continue
                val id = item.optString("id")
                val path = item.optString("path")
                if (id.isNotBlank() && path.isNotBlank()) tracks.add(id to path)
            }
            if (tracks.isNotEmpty()) {
                MediaImporter.enrichTracks(activity, tracks) { batch ->
                    deliverTrackMetadata(batch)
                }
            }
        }
    }

    private fun deliverImport(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeImport(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverScan(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeScan(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverTrackMetadata(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeTrackMetadata(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverUpdateInfo(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeUpdateInfo(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverUpdateResult(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeUpdateResult(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverUpdateProgress(result: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanNativeUpdateProgress(${JSONObject.quote(result)})",
                null,
            )
        }
    }

    private fun deliverMediaAction(action: String) {
        webView.post {
            webView.evaluateJavascript(
                "window.QuzhanAndroidMediaAction(${JSONObject.quote(action)})",
                null,
            )
        }
    }

    companion object {
        @Volatile
        private var active: WeakReference<QuzhanBridge>? = null

        fun dispatchMediaAction(action: String) {
            active?.get()?.deliverMediaAction(action)
        }
    }
}
