package com.irisli.quzhan

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class StateStore(context: Context) {
    private val stateFile = File(context.filesDir, "library.json")
    private val defaultState = JSONObject()
        .put("version", 2)
        .put("queue", org.json.JSONArray())
        .put("queueOpen", false)
        .toString()

    @Synchronized
    fun read(): String {
        if (!stateFile.isFile) return defaultState
        return try {
            JSONObject(stateFile.readText(Charsets.UTF_8)).toString()
        } catch (_: Exception) {
            defaultState
        }
    }

    @Synchronized
    fun write(raw: String): Boolean {
        if (raw.isBlank()) return false
        return try {
            JSONObject(raw)
            val temporary = File(stateFile.parentFile, "${stateFile.name}.tmp")
            FileOutputStream(temporary).use { output ->
                output.write(raw.toByteArray(Charsets.UTF_8))
                output.fd.sync()
            }
            if (stateFile.exists() && !stateFile.delete()) return false
            temporary.renameTo(stateFile)
        } catch (_: Exception) {
            false
        }
    }
}
