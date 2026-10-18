package com.irisli.quzhan

import android.content.Context
import org.json.JSONObject
import java.io.File

object MediaCleanup {
    fun cleanup(context: Context, stateJson: String): Int {
        val queue = try {
            JSONObject(stateJson).optJSONArray("queue")
        } catch (_: Exception) {
            null
        } ?: return 0

        val keepCovers = mutableSetOf<String>()
        val keepMusic = mutableSetOf<String>()
        for (index in 0 until queue.length()) {
            val item = queue.optJSONObject(index) ?: continue
            val cover = item.optString("coverPath")
            if (cover.isNotBlank()) {
                FileSafety.resolveWithin(File(context.filesDir, "covers"), cover)
                    ?.let { keepCovers.add(it.canonicalPath) }
            }
            val path = item.optString("path")
            if (path.isNotBlank() && !path.startsWith("content://")) {
                FileSafety.resolveWithin(File(context.filesDir, "music"), path)
                    ?.let { keepMusic.add(it.canonicalPath) }
            }
        }

        var removed = 0
        removed += removeUnreferenced(File(context.filesDir, "covers"), keepCovers)
        removed += removeUnreferenced(File(context.filesDir, "music"), keepMusic)
        return removed
    }

    private fun removeUnreferenced(directory: File, keep: Set<String>): Int {
        var removed = 0
        directory.listFiles()?.forEach { file ->
            if (!file.isFile || file.canonicalPath in keep) return@forEach
            if (file.delete()) removed += 1
        }
        if (directory.isDirectory && directory.listFiles()?.isEmpty() == true) {
            directory.delete()
        }
        return removed
    }
}
