package com.irisli.quzhan

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.InputStream
import java.io.RandomAccessFile

object EmbeddedLyrics {
    private const val MAX_TAG_BYTES = 16 * 1024 * 1024
    private const val MAX_SCAN_BYTES = 8 * 1024 * 1024

    fun read(file: File): String {
        if (!file.isFile) return ""
        return try {
            val id3 = readId3(file)
            if (id3.isNotBlank()) id3 else readVorbisComment(file)
        } catch (_: Exception) {
            ""
        }
    }

    fun read(context: Context, uri: Uri): String {
        return try {
            val bytes = context.contentResolver.openInputStream(uri)?.use {
                readCapped(it, MAX_TAG_BYTES)
            } ?: return ""
            val id3 = readId3Bytes(bytes)
            if (id3.isNotBlank()) id3 else readVorbisComment(bytes)
        } catch (_: Exception) {
            ""
        }
    }

    private fun readId3(file: File): String {
        RandomAccessFile(file, "r").use { input ->
            val header = ByteArray(10)
            if (input.read(header) != header.size || header[0] != 'I'.code.toByte() ||
                header[1] != 'D'.code.toByte() || header[2] != '3'.code.toByte()
            ) {
                return ""
            }
            val version = header[3].toInt() and 0xFF
            val tagSize = syncSafe(header, 6)
            if (tagSize <= 0) return ""
            val bytes = ByteArray(minOf(tagSize, MAX_TAG_BYTES))
            input.seek(10)
            var read = 0
            while (read < bytes.size) {
                val count = input.read(bytes, read, bytes.size - read)
                if (count <= 0) break
                read += count
            }
            if (read <= 0) return ""
            return parseFrames(bytes.copyOf(read), version)
        }
    }

    private fun parseFrames(tag: ByteArray, version: Int): String {
        var offset = 0
        val headerSize = if (version == 2) 6 else 10
        while (offset + headerSize <= tag.size) {
            val idLength = if (version == 2) 3 else 4
            val id = String(tag, offset, idLength, Charsets.ISO_8859_1)
            if (id.all { it == '\u0000' }) break
            val frameSize = when (version) {
                2 -> bigEndian(tag, offset + 3, 3)
                4 -> syncSafe(tag, offset + 4)
                else -> bigEndian(tag, offset + 4, 4)
            }
            val bodyStart = offset + headerSize
            if (frameSize <= 0 || bodyStart + frameSize > tag.size) break
            if (id == "USLT" || id == "USL") {
                decodeUslt(tag.copyOfRange(bodyStart, bodyStart + frameSize))?.let {
                    if (it.isNotBlank()) return it.trim()
                }
            }
            offset = bodyStart + frameSize
        }
        return ""
    }

    private fun readId3Bytes(bytes: ByteArray): String {
        if (bytes.size < 10 || bytes[0] != 'I'.code.toByte() ||
            bytes[1] != 'D'.code.toByte() || bytes[2] != '3'.code.toByte()
        ) {
            return ""
        }
        val version = bytes[3].toInt() and 0xFF
        val tagSize = syncSafe(bytes, 6)
        if (tagSize <= 0) return ""
        val end = minOf(bytes.size, 10 + tagSize)
        if (end <= 10) return ""
        return parseFrames(bytes.copyOfRange(10, end), version)
    }

    private fun decodeUslt(body: ByteArray): String? {
        if (body.size < 5) return null
        val encoding = body[0].toInt() and 0xFF
        val textStart = 4 + descriptionTerminatorLength(body, 4, encoding)
        if (textStart >= body.size) return null
        return decodeText(body.copyOfRange(textStart, body.size), encoding)
            .trimEnd('\u0000', '\r', '\n')
    }

    private fun descriptionTerminatorLength(bytes: ByteArray, start: Int, encoding: Int): Int {
        if (encoding == 1 || encoding == 2) {
            var index = start
            while (index + 1 < bytes.size) {
                if (bytes[index] == 0.toByte() && bytes[index + 1] == 0.toByte()) {
                    return index - start + 2
                }
                index += 2
            }
            return bytes.size - start
        }
        for (index in start until bytes.size) {
            if (bytes[index] == 0.toByte()) return index - start + 1
        }
        return bytes.size - start
    }

    private fun decodeText(bytes: ByteArray, encoding: Int): String {
        val charset = when (encoding) {
            1 -> {
                if (bytes.size >= 2 && bytes[0] == 0xFF.toByte() && bytes[1] == 0xFE.toByte()) {
                    Charsets.UTF_16LE
                } else if (bytes.size >= 2 && bytes[0] == 0xFE.toByte() && bytes[1] == 0xFF.toByte()) {
                    Charsets.UTF_16BE
                } else {
                    Charsets.UTF_16LE
                }
            }
            2 -> Charsets.UTF_16BE
            3 -> Charsets.UTF_8
            else -> Charsets.ISO_8859_1
        }
        return String(bytes, charset)
    }

    private fun readVorbisComment(file: File): String {
        val bytes = RandomAccessFile(file, "r").use { input ->
            val size = minOf(input.length(), MAX_SCAN_BYTES.toLong()).toInt()
            val buffer = ByteArray(size)
            input.readFully(buffer)
            buffer
        }
        return readVorbisComment(bytes)
    }

    private fun readVorbisComment(bytes: ByteArray): String {
        val markers = listOf(
            "UNSYNCEDLYRICS=",
            "SYNCEDLYRICS=",
            "UNSYNCED LYRICS=",
            "LYRICS=",
        )
        for (marker in markers) {
            val index = indexOf(bytes, marker.toByteArray(Charsets.ISO_8859_1))
            if (index < 0) continue
            val start = index + marker.length
            val end = findVorbisValueEnd(bytes, start)
            val value = String(bytes.copyOfRange(start, end), Charsets.UTF_8)
                .trimEnd('\u0000', '\r', '\n')
                .trim()
            if (value.isNotEmpty()) return value
        }
        return ""
    }

    private fun readCapped(input: InputStream, limit: Int): ByteArray {
        val output = java.io.ByteArrayOutputStream()
        val buffer = ByteArray(64 * 1024)
        var total = 0
        while (total < limit) {
            val read = input.read(buffer, 0, minOf(buffer.size, limit - total))
            if (read <= 0) break
            output.write(buffer, 0, read)
            total += read
        }
        return output.toByteArray()
    }

    private fun findVorbisValueEnd(bytes: ByteArray, start: Int): Int {
        var index = start
        while (index < bytes.size) {
            if (bytes[index] == 0.toByte()) return index
            if (index + 4 < bytes.size) {
                val candidateLength =
                    (bytes[index].toInt() and 0xFF) or
                        ((bytes[index + 1].toInt() and 0xFF) shl 8) or
                        ((bytes[index + 2].toInt() and 0xFF) shl 16) or
                        ((bytes[index + 3].toInt() and 0xFF) shl 24)
                if (candidateLength in 1..1_000_000 && looksLikeCommentKey(bytes, index + 4)) {
                    return index
                }
            }
            index += 1
        }
        return bytes.size
    }

    private fun looksLikeCommentKey(bytes: ByteArray, start: Int): Boolean {
        var index = start
        var count = 0
        while (index < bytes.size && count < 80) {
            val value = bytes[index].toInt() and 0xFF
            if (value == '='.code) return count > 0
            val valid = value in 'A'.code..'Z'.code || value in '0'.code..'9'.code ||
                value == '_'.code || value == '-'.code
            if (!valid) return false
            index += 1
            count += 1
        }
        return false
    }

    private fun syncSafe(bytes: ByteArray, offset: Int): Int {
        if (offset + 4 > bytes.size) return 0
        return ((bytes[offset].toInt() and 0x7F) shl 21) or
            ((bytes[offset + 1].toInt() and 0x7F) shl 14) or
            ((bytes[offset + 2].toInt() and 0x7F) shl 7) or
            (bytes[offset + 3].toInt() and 0x7F)
    }

    private fun bigEndian(bytes: ByteArray, offset: Int, length: Int): Int {
        var value = 0
        for (index in 0 until length) {
            value = (value shl 8) or (bytes[offset + index].toInt() and 0xFF)
        }
        return value
    }

    private fun indexOf(haystack: ByteArray, needle: ByteArray): Int {
        if (needle.isEmpty() || haystack.size < needle.size) return -1
        for (index in 0..haystack.size - needle.size) {
            var matches = true
            for (offset in needle.indices) {
                if (haystack[index + offset] != needle[offset]) {
                    matches = false
                    break
                }
            }
            if (matches) return index
        }
        return -1
    }
}
