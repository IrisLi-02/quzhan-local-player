package com.irisli.quzhan

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class FileSafetyTest {
    @get:Rule
    val temporaryFolder = TemporaryFolder()

    @Test
    fun acceptsOnlyKnownMediaFolders() {
        val root = temporaryFolder.root
        val music = File(root, "music/song.wav").apply {
            parentFile?.mkdirs()
            writeBytes(byteArrayOf(1))
        }
        val state = File(root, "library.json").apply { writeText("{}") }

        assertTrue(FileSafety.isMediaFile(root, music))
        assertFalse(FileSafety.isMediaFile(root, state))
    }

    @Test
    fun rejectsPathsOutsideAppData() {
        val root = File(temporaryFolder.root, "app").apply { mkdirs() }
        val outside = temporaryFolder.newFile("outside.wav")

        assertFalse(FileSafety.isMediaFile(root, outside))
    }
}
