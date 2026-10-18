package com.irisli.quzhan

import android.content.ContentResolver
import android.content.ContentUris
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.OpenableColumns
import android.provider.MediaStore
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.util.UUID

object MediaImporter {
    private val AUDIO_EXTENSIONS = setOf(
        ".mp3", ".flac", ".m4a", ".m4b", ".aac", ".wav",
        ".ogg", ".oga", ".opus", ".webm",
    )
    private val IMAGE_EXTENSIONS = setOf(
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif",
    )

    fun importAudio(
        context: Context,
        uris: List<Uri>,
        existingPaths: Set<String>,
    ): String {
        if (uris.isEmpty()) {
            return JSONObject()
                .put("items", JSONArray())
                .put("errors", JSONArray())
                .put("skipped", 0)
                .toString()
        }
        val resolver = context.contentResolver
        val items = JSONArray()
        val errors = JSONArray()
        var skipped = 0

        val sidecars = mutableMapOf<String, String>()
        val audioUris = mutableListOf<Pair<Uri, String>>()
        for (uri in uris) {
            val name = displayName(resolver, uri) ?: "audio"
            val extension = extensionFor(resolver, uri, name)
            if (extension == ".lrc") {
                val text = readText(resolver, uri)
                if (!text.isNullOrBlank()) {
                    sidecars[baseName(name).lowercase()] = text
                }
            } else if (extension in AUDIO_EXTENSIONS) {
                audioUris.add(uri to name)
            }
        }

        val seenTargets = existingPaths.map { it.lowercase() }.toMutableSet()
        for ((uri, name) in audioUris) {
            try {
                val key = uri.toString()
                if (seenTargets.contains(key.lowercase())) {
                    skipped += 1
                    continue
                }
                seenTargets.add(key.lowercase())

                val metadata = readMetadata(context, uri)
                val fallbackTitle = baseName(name).ifBlank { "audio" }
                val coverPath = saveEmbeddedCover(context, metadata.picture)
                val sidecar = sidecars[baseName(name).lowercase()]
                val embedded = if (sidecar.isNullOrBlank()) {
                    EmbeddedLyrics.read(context, uri)
                } else {
                    ""
                }
                val lyrics = sidecar ?: embedded
                val item = JSONObject()
                    .put("id", UUID.randomUUID().toString())
                    .put("path", key)
                    .put("fileName", name)
                    .put("title", clean(metadata.title, fallbackTitle))
                    .put("artist", clean(metadata.artist, "未知艺术家"))
                    .put("album", clean(metadata.album, ""))
                    .put("duration", metadata.durationMs / 1000.0)
                    .put("coverPath", coverPath)
                    .put("lyrics", lyrics)
                    .put(
                        "lyricsSource",
                        when {
                            !sidecar.isNullOrBlank() -> "sidecar"
                            embedded.isNotBlank() -> "embedded"
                            else -> ""
                        },
                    )
                    .put("played", false)
                    .put("addedAt", System.currentTimeMillis())
                    .put("size", fileSize(resolver, uri))
                    .put("missing", false)
                items.put(item)
            } catch (error: Exception) {
                errors.put(
                    JSONObject()
                        .put("path", name)
                        .put("code", "IMPORT_FAILED")
                        .put("message", error.message ?: "导入失败"),
                )
            }
        }

        if (items.length() == 0 && errors.length() == 0 && skipped == 0) {
            errors.put(
                JSONObject()
                    .put("path", "")
                    .put("code", "NO_AUDIO_FILES")
                    .put("message", "没有找到可导入的音频文件"),
            )
        }
        return JSONObject()
            .put("items", items)
            .put("errors", errors)
            .put("skipped", skipped)
            .toString()
    }

    fun scanLocalMusic(context: Context, existingPaths: Set<String>): String {
        val resolver = context.contentResolver
        val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.MIME_TYPE,
        )
        val items = JSONArray()
        val errors = JSONArray()
        val existing = existingPaths.map { it.lowercase() }.toMutableSet()
        var skipped = 0
        var scanned = 0

        try {
            resolver.query(
                collection,
                projection,
                "${MediaStore.Audio.Media.IS_MUSIC} != 0",
                null,
                "${MediaStore.Audio.Media.DATE_ADDED} ASC",
            )?.use { cursor ->
                val idIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val nameIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
                val titleIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val durationIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val sizeIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val mimeIndex = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)

                while (cursor.moveToNext()) {
                    scanned += 1
                    val id = cursor.getLong(idIndex)
                    val uri = ContentUris.withAppendedId(collection, id)
                    val key = uri.toString()
                    if (existing.contains(key.lowercase())) {
                        skipped += 1
                        continue
                    }
                    val mime = cursor.getString(mimeIndex) ?: ""
                    val title = clean(cursor.getString(titleIndex) ?: "", "未命名歌曲")
                    var name = cursor.getString(nameIndex) ?: title
                    var extension = FileSafety.extensionOf(name)
                    if (extension !in AUDIO_EXTENSIONS) {
                        extension = extensionForMime(mime)
                    }
                    if (extension !in AUDIO_EXTENSIONS) continue
                    if (FileSafety.extensionOf(name).isEmpty()) name += extension

                    existing.add(key.lowercase())
                    items.put(
                        JSONObject()
                            .put("id", UUID.randomUUID().toString())
                            .put("path", key)
                            .put("fileName", name)
                            .put("title", title.ifBlank { baseName(name) })
                            .put("artist", clean(cursor.getString(artistIndex) ?: "", "未知艺术家"))
                            .put("album", clean(cursor.getString(albumIndex) ?: "", ""))
                            .put("duration", (cursor.getLong(durationIndex) / 1000.0))
                            .put("coverPath", "")
                            .put("lyrics", "")
                            .put("lyricsSource", "")
                            .put("played", false)
                            .put("addedAt", System.currentTimeMillis())
                            .put("size", cursor.getLong(sizeIndex))
                            .put("missing", false),
                    )
                }
            }
        } catch (error: Exception) {
            errors.put(
                JSONObject()
                    .put("path", "")
                    .put("code", "SCAN_FAILED")
                    .put("message", error.message ?: "扫描本地音乐失败"),
            )
        }

        if (items.length() == 0 && errors.length() == 0 && scanned == 0) {
            errors.put(
                JSONObject()
                    .put("path", "")
                    .put("code", "NO_AUDIO_FILES")
                    .put("message", "没有找到可导入的音频文件"),
            )
        }
        return JSONObject()
            .put("items", items)
            .put("errors", errors)
            .put("skipped", skipped)
            .put("scanned", scanned)
            .toString()
    }

    fun enrichTracks(
        context: Context,
        tracks: List<Pair<String, String>>,
        onBatch: (String) -> Unit,
    ) {
        val updates = mutableListOf<JSONObject>()
        for ((id, path) in tracks) {
            try {
                val uri = Uri.parse(path)
                val metadata = readMetadata(context, uri)
                val coverPath = saveEmbeddedCover(context, metadata.picture)
                val lyrics = EmbeddedLyrics.read(context, uri)
                val update = JSONObject()
                    .put("id", id)
                    .put("duration", metadata.durationMs / 1000.0)
                if (coverPath.isNotBlank()) update.put("coverPath", coverPath)
                if (lyrics.isNotBlank()) {
                    update.put("lyrics", lyrics)
                    update.put("lyricsSource", "embedded")
                }
                updates.add(update)
            } catch (_: Exception) {
                // A single unreadable track must not stop metadata enrichment for the library.
            }
            if (updates.size >= 6) {
                onBatch(jsonArray(updates).toString())
                updates.clear()
            }
        }
        if (updates.isNotEmpty()) onBatch(jsonArray(updates).toString())
    }

    fun importBackground(context: Context, uri: Uri): String {
        val resolver = context.contentResolver
        val name = displayName(resolver, uri) ?: "background"
        val extension = extensionFor(resolver, uri, name)
        if (extension !in IMAGE_EXTENSIONS) {
            return JSONObject()
                .put("ok", false)
                .put("code", "UNSUPPORTED_IMAGE")
                .toString()
        }
        return try {
            val copied = copyWithHash(resolver, uri, context.filesDir, "backgrounds", extension)
            val target = copied.first
            target.parentFile?.listFiles()?.forEach { old ->
                if (old.isFile && old.canonicalPath != target.canonicalPath) {
                    old.delete()
                }
            }
            JSONObject().put("ok", true).put("path", target.absolutePath).toString()
        } catch (error: Exception) {
            JSONObject()
                .put("ok", false)
                .put("code", "IMPORT_FAILED")
                .put("message", error.message ?: "导入失败")
                .toString()
        }
    }

    fun clearBackground(context: Context) {
        File(context.filesDir, "backgrounds").listFiles()?.forEach { it.delete() }
    }

    fun coverPalette(context: Context, path: String): String? {
        val file = FileSafety.resolveWithin(File(context.filesDir, "covers"), path) ?: return null
        if (!file.isFile) return null
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(file.absolutePath, bounds)
        var sample = 1
        while (bounds.outWidth / sample > 48 || bounds.outHeight / sample > 48) sample *= 2
        val bitmap = BitmapFactory.decodeFile(
            file.absolutePath,
            BitmapFactory.Options().apply { inSampleSize = sample },
        ) ?: return null
        var xWeight = 0.0
        var yWeight = 0.0
        var saturationSum = 0.0
        var lightnessSum = 0.0
        var count = 0
        val hsv = FloatArray(3)
        for (y in 0 until bitmap.height step 2) {
            for (x in 0 until bitmap.width step 2) {
                Color.colorToHSV(bitmap.getPixel(x, y), hsv)
                val weight = hsv[1].toDouble() * (0.35 + hsv[2])
                val radians = Math.toRadians(hsv[0].toDouble())
                xWeight += Math.cos(radians) * weight
                yWeight += Math.sin(radians) * weight
                saturationSum += hsv[1]
                lightnessSum += hsv[2] * 0.72 + hsv[1] * 0.08
                count += 1
            }
        }
        bitmap.recycle()
        if (count == 0) return null
        val hue = ((Math.toDegrees(Math.atan2(yWeight, xWeight)) + 360) % 360)
        return JSONObject()
            .put("hue", hue)
            .put("saturation", saturationSum / count)
            .put("lightness", (lightnessSum / count).coerceIn(0.0, 0.9))
            .toString()
    }

    private data class Metadata(
        val title: String,
        val artist: String,
        val album: String,
        val durationMs: Long,
        val picture: ByteArray?,
    )

    private fun readMetadata(context: Context, uri: Uri): Metadata {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(context, uri)
            Metadata(
                title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE) ?: "",
                artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
                    ?: retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUMARTIST)
                    ?: "",
                album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM) ?: "",
                durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                    ?.toLongOrNull() ?: 0L,
                picture = retriever.embeddedPicture,
            )
        } finally {
            retriever.release()
        }
    }

    private fun saveEmbeddedCover(context: Context, picture: ByteArray?): String {
        if (picture == null || picture.isEmpty()) return ""
        val directory = File(context.filesDir, "covers").apply { mkdirs() }
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(picture, 0, picture.size, bounds)
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return ""
        var sample = 1
        while (bounds.outWidth / sample > 1280 || bounds.outHeight / sample > 1280) sample *= 2
        var bitmap = BitmapFactory.decodeByteArray(
            picture,
            0,
            picture.size,
            BitmapFactory.Options().apply { inSampleSize = sample },
        ) ?: return ""
        val longest = maxOf(bitmap.width, bitmap.height)
        if (longest > 640) {
            val scale = 640f / longest
            val next = Bitmap.createScaledBitmap(
                bitmap,
                maxOf(1, (bitmap.width * scale).toInt()),
                maxOf(1, (bitmap.height * scale).toInt()),
                true,
            )
            if (next !== bitmap) bitmap.recycle()
            bitmap = next
        }
        val output = java.io.ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 82, output)
        bitmap.recycle()
        val bytes = output.toByteArray()
        val hash = sha256(bytes).take(24)
        val target = File(directory, "cover-$hash-opt.jpg")
        if (!target.isFile) {
            FileOutputStream(target).use { it.write(bytes) }
        }
        return target.absolutePath
    }

    private fun copyWithHash(
        resolver: ContentResolver,
        uri: Uri,
        filesDir: File,
        folder: String,
        extension: String,
    ): Pair<File, String> {
        val directory = File(filesDir, folder).apply { mkdirs() }
        val temporary = File(directory, ".import-${UUID.randomUUID()}.tmp")
        val digest = MessageDigest.getInstance("SHA-256")
        resolver.openInputStream(uri)?.use { input ->
            FileOutputStream(temporary).use { output ->
                val buffer = ByteArray(128 * 1024)
                while (true) {
                    val read = input.read(buffer)
                    if (read <= 0) break
                    digest.update(buffer, 0, read)
                    output.write(buffer, 0, read)
                }
                output.fd.sync()
            }
        } ?: throw IllegalStateException("无法读取所选文件")
        if (temporary.length() == 0L) {
            temporary.delete()
            throw IllegalStateException("所选文件为空")
        }
        val hash = digest.digest().joinToString("") { "%02x".format(it) }
        val safeExtension = extension.takeIf { it in AUDIO_EXTENSIONS + IMAGE_EXTENSIONS } ?: ""
        val target = File(directory, "$hash$safeExtension")
        if (target.isFile) {
            temporary.delete()
        } else if (!temporary.renameTo(target)) {
            temporary.copyTo(target, overwrite = true)
            temporary.delete()
        }
        return target to hash
    }

    private fun extensionFor(resolver: ContentResolver, uri: Uri, name: String): String {
        val fromName = FileSafety.extensionOf(name)
        if (fromName.isNotEmpty()) return fromName
        return extensionForMime(resolver.getType(uri)?.lowercase() ?: "")
    }

    private fun extensionForMime(mimeType: String): String {
        return when (mimeType) {
            "audio/mpeg" -> ".mp3"
            "audio/flac", "audio/x-flac" -> ".flac"
            "audio/mp4", "audio/x-m4a" -> ".m4a"
            "audio/aac" -> ".aac"
            "audio/wav", "audio/x-wav" -> ".wav"
            "audio/ogg", "application/ogg" -> ".ogg"
            "audio/opus" -> ".opus"
            "audio/webm" -> ".webm"
            "image/jpeg" -> ".jpg"
            "image/png" -> ".png"
            "image/webp" -> ".webp"
            "image/gif" -> ".gif"
            "image/bmp" -> ".bmp"
            "image/avif" -> ".avif"
            "text/plain" -> ".lrc"
            else -> ""
        }
    }

    private fun displayName(resolver: ContentResolver, uri: Uri): String? {
        return try {
            resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use {
                if (it.moveToFirst()) it.getString(0) else null
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun fileSize(resolver: ContentResolver, uri: Uri): Long {
        return try {
            resolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use {
                if (it.moveToFirst() && !it.isNull(0)) it.getLong(0) else 0L
            } ?: 0L
        } catch (_: Exception) {
            0L
        }
    }

    private fun jsonArray(values: List<JSONObject>): JSONArray {
        return JSONArray().apply {
            values.forEach { put(it) }
        }
    }

    private fun readText(resolver: ContentResolver, uri: Uri): String? {
        return try {
            resolver.openInputStream(uri)?.use { input ->
                val buffer = java.io.ByteArrayOutputStream()
                val chunk = ByteArray(64 * 1024)
                var total = 0
                while (total < 4 * 1024 * 1024) {
                    val read = input.read(chunk)
                    if (read <= 0) break
                    buffer.write(chunk, 0, read)
                    total += read
                }
                String(buffer.toByteArray(), Charsets.UTF_8)
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun baseName(name: String): String {
        val extension = FileSafety.extensionOf(name)
        return if (extension.isEmpty()) name else name.dropLast(extension.length)
    }

    private fun clean(value: String, fallback: String): String {
        val cleaned = value.replace("\u0000", "").trim()
        return if (cleaned.isBlank() || cleaned.equals("<unknown>", ignoreCase = true)) {
            fallback
        } else {
            cleaned
        }
    }

    private fun sha256(bytes: ByteArray): String {
        return MessageDigest.getInstance("SHA-256").digest(bytes)
            .joinToString("") { "%02x".format(it) }
    }
}
