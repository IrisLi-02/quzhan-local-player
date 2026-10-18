package com.irisli.quzhan

import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class EmbeddedLyricsTest {
    @get:Rule
    val temporaryFolder = TemporaryFolder()

    @Test
    fun readsId3v23UsltFrame() {
        val body = byteArrayOf(3) +
            "eng".toByteArray(Charsets.ISO_8859_1) +
            byteArrayOf(0) +
            "[00:03.20]第一句\n[00:08.40]第二句".toByteArray(Charsets.UTF_8)
        val frame = "USLT".toByteArray(Charsets.ISO_8859_1) +
            intBytes(body.size) +
            byteArrayOf(0, 0) +
            body
        val header = "ID3".toByteArray(Charsets.ISO_8859_1) +
            byteArrayOf(3, 0, 0) +
            syncSafeBytes(frame.size)
        val file = temporaryFolder.newFile("uslt.mp3")
        file.writeBytes(header + frame)

        assertEquals(
            "[00:03.20]第一句\n[00:08.40]第二句",
            EmbeddedLyrics.read(file),
        )
    }

    @Test
    fun readsVorbisCommentLyrics() {
        val lyrics = "[00:01.00]Vorbis lyric"
        val marker = "LYRICS=".toByteArray(Charsets.ISO_8859_1)
        val file = temporaryFolder.newFile("comment.flac")
        file.writeBytes(
            "fLaC".toByteArray(Charsets.ISO_8859_1) +
                marker +
                lyrics.toByteArray(Charsets.UTF_8) +
                byteArrayOf(0),
        )

        assertEquals(lyrics, EmbeddedLyrics.read(file))
    }

    private fun intBytes(value: Int): ByteArray {
        return byteArrayOf(
            ((value ushr 24) and 0xFF).toByte(),
            ((value ushr 16) and 0xFF).toByte(),
            ((value ushr 8) and 0xFF).toByte(),
            (value and 0xFF).toByte(),
        )
    }

    private fun syncSafeBytes(value: Int): ByteArray {
        return byteArrayOf(
            ((value ushr 21) and 0x7F).toByte(),
            ((value ushr 14) and 0x7F).toByte(),
            ((value ushr 7) and 0x7F).toByte(),
            (value and 0x7F).toByte(),
        )
    }
}
