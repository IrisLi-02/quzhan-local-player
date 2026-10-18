package com.irisli.quzhan

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

object UpdateManager {
    private const val UPDATE_API_URL =
        "https://api.github.com/repos/IrisLi-02/quzhan-local-player/releases/latest"
    private const val APK_ASSET_PATTERN = """^Quzhan-Android-(.+?)(?:-debug)?\.apk$"""

    fun cleanup(context: Context) {
        File(context.filesDir, "updates").listFiles()?.forEach { it.delete() }
    }

    fun check(context: Context): String {
        return try {
            val release = fetchJson(UPDATE_API_URL) ?: return errorResult("网络请求失败")
            val assets = release.optJSONArray("assets")
            var asset: JSONObject? = null
            var latestVersion = ""
            if (assets != null) {
                for (index in 0 until assets.length()) {
                    val candidate = assets.optJSONObject(index) ?: continue
                    val match = Regex(APK_ASSET_PATTERN).find(candidate.optString("name"))
                    if (match != null) {
                        asset = candidate
                        latestVersion = match.groupValues[1]
                        break
                    }
                }
            }
            if (asset == null) {
                return JSONObject()
                    .put("ok", false)
                    .put("reason", "no_asset")
                    .put("currentVersion", currentVersion(context))
                    .toString()
            }
            val current = currentVersion(context)
            JSONObject()
                .put("ok", true)
                .put("currentVersion", current)
                .put("latestVersion", latestVersion)
                .put("available", compareVersions(latestVersion, current) > 0)
                .put("releaseName", release.optString("name"))
                .put("releaseNotes", release.optString("body"))
                .put("assetName", asset.optString("name"))
                .put("assetUrl", asset.optString("browser_download_url"))
                .put("assetSize", asset.optLong("size"))
                .put("digest", asset.optString("digest"))
                .toString()
        } catch (error: Exception) {
            errorResult(error.message ?: "无法检查更新")
        }
    }

    fun download(
        context: Context,
        updateJson: String,
        onProgress: (Int) -> Unit,
    ): String {
        return try {
            val update = JSONObject(updateJson)
            val assetName = update.optString("assetName")
            val assetUrl = URL(update.optString("assetUrl"))
            if (!assetName.matches(Regex(APK_ASSET_PATTERN)) ||
                assetUrl.protocol != "https" ||
                assetUrl.host !in setOf("github.com", "objects.githubusercontent.com")
            ) {
                return JSONObject()
                    .put("ok", false)
                    .put("code", "INVALID_PACKAGE")
                    .put("error", "更新包地址无效")
                    .toString()
            }
            val directory = File(context.filesDir, "updates").apply { mkdirs() }
            directory.listFiles()?.forEach { it.delete() }
            val target = File(directory, assetName)
            val connection = (assetUrl.openConnection() as HttpURLConnection).apply {
                connectTimeout = 15_000
                readTimeout = 30_000
                instanceFollowRedirects = true
                setRequestProperty("User-Agent", "Quzhan/${currentVersion(context)}")
            }
            if (connection.responseCode !in 200..299) {
                connection.disconnect()
                return JSONObject()
                    .put("ok", false)
                    .put("code", "DOWNLOAD_FAILED")
                    .put("error", "下载失败：HTTP ${connection.responseCode}")
                    .toString()
            }
            val total = connection.contentLengthLong.coerceAtLeast(0L)
            val digest = MessageDigest.getInstance("SHA-256")
            var downloaded = 0L
            var lastPercent = -1
            connection.inputStream.use { input ->
                FileOutputStream(target).use { output ->
                    val buffer = ByteArray(128 * 1024)
                    while (true) {
                        val read = input.read(buffer)
                        if (read <= 0) break
                        output.write(buffer, 0, read)
                        digest.update(buffer, 0, read)
                        downloaded += read
                        if (total > 0) {
                            val percent = ((downloaded * 100) / total).toInt().coerceIn(0, 100)
                            if (percent != lastPercent) {
                                lastPercent = percent
                                onProgress(percent)
                            }
                        }
                    }
                    output.fd.sync()
                }
            }
            connection.disconnect()
            val expectedDigest = update.optString("digest")
            if (expectedDigest.startsWith("sha256:")) {
                val actual = digest.digest().joinToString("") { "%02x".format(it) }
                if (!actual.equals(expectedDigest.removePrefix("sha256:"), ignoreCase = true)) {
                    target.delete()
                    return JSONObject()
                        .put("ok", false)
                        .put("code", "CHECKSUM_MISMATCH")
                        .put("error", "更新包校验失败")
                        .toString()
                }
            }
            val archive = packageArchiveInfo(context, target.absolutePath)
            if (archive == null || archive.packageName != context.packageName) {
                target.delete()
                return JSONObject()
                    .put("ok", false)
                    .put("code", "INVALID_PACKAGE")
                    .put("error", "更新包不是曲栈应用")
                    .toString()
            }
            if (compareVersions(archive.versionName ?: "", currentVersion(context)) <= 0) {
                target.delete()
                return JSONObject()
                    .put("ok", false)
                    .put("code", "INVALID_PACKAGE")
                    .put("error", "更新包版本不高于当前版本")
                    .toString()
            }
            if (!sameSignature(context, archive)) {
                target.delete()
                return JSONObject()
                    .put("ok", false)
                    .put("code", "SIGNATURE_MISMATCH")
                    .put("error", "更新包签名与当前版本不一致")
                    .toString()
            }
            JSONObject()
                .put("ok", true)
                .put("path", target.absolutePath)
                .put("versionName", archive.versionName ?: "")
                .toString()
        } catch (error: Exception) {
            JSONObject()
                .put("ok", false)
                .put("code", "DOWNLOAD_FAILED")
                .put("error", error.message ?: "下载更新失败")
                .toString()
        }
    }

    fun launchInstaller(context: Context, apkPath: String): JSONObject {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            try {
                context.startActivity(
                    Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:${context.packageName}"),
                    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                )
            } catch (_: Exception) {
                // The user can still grant the permission from system settings manually.
            }
            return JSONObject()
                .put("ok", false)
                .put("code", "INSTALL_PERMISSION_REQUIRED")
                .put("error", "请允许曲栈安装未知应用后重试")
        }
        val file = File(apkPath)
        if (!file.isFile) {
            return JSONObject()
                .put("ok", false)
                .put("code", "INVALID_PACKAGE")
                .put("error", "更新包不存在")
        }
        return try {
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file,
            )
            context.startActivity(
                Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, "application/vnd.android.package-archive")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                },
            )
            JSONObject().put("ok", true)
        } catch (error: Exception) {
            JSONObject()
                .put("ok", false)
                .put("code", "INSTALL_FAILED")
                .put("error", error.message ?: "无法启动系统安装器")
        }
    }

    internal fun compareVersions(left: String, right: String): Int {
        fun parse(value: String): Pair<List<Int>, String> {
            val normalized = value.trim().removePrefix("v")
            val base = normalized.substringBefore('-')
            val prerelease = normalized.substringAfter('-', "")
            val numbers = base.split('.').map { it.toIntOrNull() ?: 0 }.toMutableList()
            while (numbers.size < 3) numbers.add(0)
            return numbers to prerelease
        }
        val (leftNumbers, leftPre) = parse(left)
        val (rightNumbers, rightPre) = parse(right)
        for (index in 0 until maxOf(leftNumbers.size, rightNumbers.size)) {
            val difference = (leftNumbers.getOrNull(index) ?: 0) -
                (rightNumbers.getOrNull(index) ?: 0)
            if (difference != 0) return if (difference > 0) 1 else -1
        }
        if (leftPre.isEmpty() && rightPre.isNotEmpty()) return 1
        if (leftPre.isNotEmpty() && rightPre.isEmpty()) return -1
        if (leftPre.isEmpty() && rightPre.isEmpty()) return 0
        return leftPre.compareTo(rightPre, ignoreCase = true)
    }

    private fun currentVersion(context: Context): String {
        return try {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "0"
        } catch (_: Exception) {
            "0"
        }
    }

    private fun packageArchiveInfo(context: Context, path: String): PackageInfo? {
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            PackageManager.GET_SIGNING_CERTIFICATES
        } else {
            @Suppress("DEPRECATION")
            PackageManager.GET_SIGNATURES
        }
        @Suppress("DEPRECATION")
        return context.packageManager.getPackageArchiveInfo(path, flags)
    }

    private fun sameSignature(context: Context, archive: PackageInfo): Boolean {
        return try {
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageManager.GET_SIGNING_CERTIFICATES
            } else {
                @Suppress("DEPRECATION")
                PackageManager.GET_SIGNATURES
            }
            @Suppress("DEPRECATION")
            val installed = context.packageManager.getPackageInfo(context.packageName, flags)
            val installedDigest = signatureDigest(installed) ?: return false
            val archiveDigest = signatureDigest(archive) ?: return false
            installedDigest.contentEquals(archiveDigest)
        } catch (_: Exception) {
            false
        }
    }

    private fun signatureDigest(info: PackageInfo): ByteArray? {
        val signature = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            info.signingInfo?.apkContentsSigners?.firstOrNull()
        } else {
            @Suppress("DEPRECATION")
            info.signatures?.firstOrNull()
        } ?: return null
        return MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())
    }

    private fun fetchJson(url: String): JSONObject? {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15_000
            readTimeout = 20_000
            instanceFollowRedirects = true
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("User-Agent", "Quzhan-Android")
        }
        return try {
            if (connection.responseCode !in 200..299) return null
            connection.inputStream.bufferedReader(Charsets.UTF_8).use {
                JSONObject(it.readText())
            }
        } finally {
            connection.disconnect()
        }
    }

    private fun errorResult(message: String): String {
        return JSONObject()
            .put("ok", false)
            .put("error", message)
            .toString()
    }
}
