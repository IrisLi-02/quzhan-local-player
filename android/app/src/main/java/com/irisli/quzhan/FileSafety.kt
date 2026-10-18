package com.irisli.quzhan

import java.io.File

object FileSafety {
    private val MEDIA_FOLDERS = setOf("music", "covers", "backgrounds")

    fun resolveWithin(root: File, rawPath: String?): File? {
        if (rawPath.isNullOrBlank()) return null
        return try {
            val rootPath = root.canonicalFile
            val candidate = File(rawPath).canonicalFile
            val prefix = rootPath.path + File.separator
            if (candidate.path == rootPath.path || candidate.path.startsWith(prefix)) candidate else null
        } catch (_: Exception) {
            null
        }
    }

    fun extensionOf(name: String): String {
        val dot = name.lastIndexOf('.')
        return if (dot >= 0) name.substring(dot).lowercase() else ""
    }

    fun isMediaFile(root: File, candidate: File): Boolean {
        val safe = resolveWithin(root, candidate.path) ?: return false
        val rootPath = root.canonicalFile.path + File.separator
        val relative = safe.path.removePrefix(rootPath)
        val folder = relative.substringBefore(File.separator)
        return folder in MEDIA_FOLDERS
    }
}
