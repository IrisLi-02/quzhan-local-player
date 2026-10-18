package com.irisli.quzhan

import android.content.Context
import android.net.Uri
import java.io.BufferedOutputStream
import java.io.BufferedReader
import java.io.File
import java.io.FileInputStream
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.InetAddress
import java.net.ServerSocket
import java.net.Socket
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.util.concurrent.Executors

class MediaServer(private val context: Context) {
    private var serverSocket: ServerSocket? = null
    private val workers = Executors.newFixedThreadPool(4)
    private val token = ByteArray(24).also { SecureRandom().nextBytes(it) }
        .joinToString("") { "%02x".format(it) }

    @Volatile
    var port: Int = 0
        private set

    val baseUrl: String
        get() = "http://127.0.0.1:$port/$token"

    fun start(): Boolean {
        if (serverSocket != null) return true
        return try {
            val socket = ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"))
            serverSocket = socket
            port = socket.localPort
            Thread({
                while (!socket.isClosed) {
                    try {
                        val client = socket.accept()
                        workers.execute {
                            try {
                                handle(client)
                            } catch (_: Exception) {
                                // Browsers routinely cancel media requests while seeking or switching tracks.
                            }
                        }
                    } catch (_: Exception) {
                        if (!socket.isClosed) Thread.sleep(30)
                    }
                }
            }, "quzhan-media-server").apply {
                isDaemon = true
                start()
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    fun stop() {
        try {
            serverSocket?.close()
        } catch (_: Exception) {
            // The socket may already be closed.
        }
        serverSocket = null
        workers.shutdownNow()
    }

    private fun handle(socket: Socket) {
        socket.use { client ->
            client.soTimeout = 15_000
            val reader = BufferedReader(InputStreamReader(client.getInputStream(), StandardCharsets.ISO_8859_1))
            val requestLine = reader.readLine() ?: return
            val requestHeaders = mutableMapOf<String, String>()
            var headerLine: String?
            do {
                headerLine = reader.readLine()
                if (!headerLine.isNullOrEmpty()) {
                    val separator = headerLine.indexOf(':')
                    if (separator > 0) {
                        requestHeaders[headerLine.substring(0, separator).trim().lowercase()] =
                            headerLine.substring(separator + 1).trim()
                    }
                }
            } while (!headerLine.isNullOrEmpty())

            val parts = requestLine.split(' ')
            if (parts.size < 2) return
            val method = parts[0].uppercase()
            val target = parts[1]
            val request = target.substringBefore('?')
            val query = target.substringAfter('?', "")
            val output = BufferedOutputStream(client.getOutputStream())

            if (method == "OPTIONS") {
                writeEmpty(output, 204, method)
                return
            }
            if (method != "GET" && method != "HEAD") {
                writeEmpty(output, 405, method)
                return
            }

            val prefix = "/$token"
            if (request != prefix && !request.startsWith("$prefix/")) {
                writeEmpty(output, 404, method)
                return
            }
            val route = request.removePrefix(prefix).ifBlank { "/" }

            if (route == "/media") {
                val encodedPath = query.split('&')
                    .firstOrNull { it.substringBefore('=') == "path" }
                    ?.substringAfter('=', "")
                    ?.let { URLDecoder.decode(it, StandardCharsets.UTF_8.name()) }
                if (!encodedPath.isNullOrBlank() && encodedPath.startsWith("content://")) {
                    serveContent(
                        Uri.parse(encodedPath),
                        output,
                        method,
                        requestHeaders,
                    )
                    return
                }
                val file = FileSafety.resolveWithin(context.filesDir, encodedPath)
                if (file == null || !file.isFile || !FileSafety.isMediaFile(context.filesDir, file)) {
                    writeEmpty(output, 404, method)
                    return
                }
                serveFile(file, output, method, requestHeaders)
                return
            }

            val assetName = if (route == "/" || route == "/index.html") {
                "web/index.html"
            } else {
                val decoded = URLDecoder.decode(route.trimStart('/'), StandardCharsets.UTF_8.name())
                if (decoded.contains("..")) {
                    writeEmpty(output, 404, method)
                    return
                }
                "web/$decoded"
            }
            val bytes = try {
                context.assets.open(assetName).use { it.readBytes() }
            } catch (_: Exception) {
                writeEmpty(output, 404, method)
                return
            }
            val responseHeaders = buildString {
                append("HTTP/1.1 200 OK\r\n")
                append("Content-Type: ${mimeType(assetName)}\r\n")
                append("Content-Length: ${bytes.size}\r\n")
                append("Cache-Control: no-store\r\n")
                append("Access-Control-Allow-Origin: *\r\n")
                append("X-Content-Type-Options: nosniff\r\n")
                append("Connection: close\r\n\r\n")
            }
            output.write(responseHeaders.toByteArray(StandardCharsets.ISO_8859_1))
            if (method != "HEAD") output.write(bytes)
            output.flush()
        }
    }

    private fun serveFile(
        file: File,
        output: OutputStream,
        method: String,
        headers: Map<String, String>,
    ) {
        val rangeHeader = headers["range"]
        val length = file.length()
        var start = 0L
        var end = length - 1
        var partial = false
        if (!rangeHeader.isNullOrBlank() && rangeHeader.lowercase().startsWith("bytes=")) {
            val range = rangeHeader.removePrefix("bytes=").substringBefore(',')
            val startText = range.substringBefore('-').trim()
            val endText = range.substringAfter('-', "").trim()
            if (startText.isEmpty() && endText.isNotEmpty()) {
                val suffix = endText.toLongOrNull() ?: 0L
                if (suffix > 0) {
                    start = (length - suffix).coerceAtLeast(0)
                    partial = true
                }
            } else {
                start = startText.toLongOrNull() ?: 0L
                end = endText.toLongOrNull() ?: (length - 1)
                partial = true
            }
        }
        if (length <= 0 || start < 0 || start >= length || end < start) {
            writeEmpty(output, 416, method)
            return
        }
        end = end.coerceAtMost(length - 1)
        val contentLength = end - start + 1
        val header = buildString {
            if (partial) append("HTTP/1.1 206 Partial Content\r\n") else append("HTTP/1.1 200 OK\r\n")
            append("Content-Type: ${mimeType(file.name)}\r\n")
            append("Content-Length: $contentLength\r\n")
            append("Accept-Ranges: bytes\r\n")
            if (partial) append("Content-Range: bytes $start-$end/$length\r\n")
            append("Cache-Control: private, max-age=3600\r\n")
            append("Access-Control-Allow-Origin: *\r\n")
            append("Access-Control-Allow-Headers: Range\r\n")
            append("Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges\r\n")
            append("X-Content-Type-Options: nosniff\r\n")
            append("Connection: close\r\n\r\n")
        }
        output.write(header.toByteArray(StandardCharsets.ISO_8859_1))
        if (method != "HEAD") {
            FileInputStream(file).use { input ->
                input.channel.position(start)
                val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                var remaining = contentLength
                while (remaining > 0) {
                    val read = input.read(buffer, 0, minOf(buffer.size.toLong(), remaining).toInt())
                    if (read <= 0) break
                    output.write(buffer, 0, read)
                    remaining -= read
                }
            }
        }
        output.flush()
    }

    private fun serveContent(
        uri: Uri,
        output: OutputStream,
        method: String,
        headers: Map<String, String>,
    ) {
        val descriptor = try {
            context.contentResolver.openAssetFileDescriptor(uri, "r")
        } catch (_: Exception) {
            null
        }
        if (descriptor == null) {
            writeEmpty(output, 404, method)
            return
        }
        descriptor.use { asset ->
            val length = asset.length
            if (length <= 0) {
                writeEmpty(output, 404, method)
                return
            }
            val rangeHeader = headers["range"]
            var start = 0L
            var end = length - 1
            var partial = false
            if (!rangeHeader.isNullOrBlank() && rangeHeader.lowercase().startsWith("bytes=")) {
                val range = rangeHeader.removePrefix("bytes=").substringBefore(',')
                val startText = range.substringBefore('-').trim()
                val endText = range.substringAfter('-', "").trim()
                if (startText.isEmpty() && endText.isNotEmpty()) {
                    val suffix = endText.toLongOrNull() ?: 0L
                    if (suffix > 0) {
                        start = (length - suffix).coerceAtLeast(0)
                        partial = true
                    }
                } else {
                    start = startText.toLongOrNull() ?: 0L
                    end = endText.toLongOrNull() ?: (length - 1)
                    partial = true
                }
            }
            if (start < 0 || start >= length || end < start) {
                writeEmpty(output, 416, method)
                return
            }
            end = end.coerceAtMost(length - 1)
            val contentLength = end - start + 1
            val contentType = context.contentResolver.getType(uri) ?: "application/octet-stream"
            val header = buildString {
                if (partial) append("HTTP/1.1 206 Partial Content\r\n") else append("HTTP/1.1 200 OK\r\n")
                append("Content-Type: $contentType\r\n")
                append("Content-Length: $contentLength\r\n")
                append("Accept-Ranges: bytes\r\n")
                if (partial) append("Content-Range: bytes $start-$end/$length\r\n")
                append("Cache-Control: private, max-age=3600\r\n")
                append("Access-Control-Allow-Origin: *\r\n")
                append("Access-Control-Allow-Headers: Range\r\n")
                append("Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges\r\n")
                append("X-Content-Type-Options: nosniff\r\n")
                append("Connection: close\r\n\r\n")
            }
            output.write(header.toByteArray(StandardCharsets.ISO_8859_1))
            if (method != "HEAD") {
                asset.createInputStream().use { input ->
                    var remainingSkip = start
                    while (remainingSkip > 0) {
                        val skipped = input.skip(remainingSkip)
                        if (skipped > 0) {
                            remainingSkip -= skipped
                        } else if (input.read() < 0) {
                            break
                        } else {
                            remainingSkip -= 1
                        }
                    }
                    val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                    var remaining = contentLength
                    while (remaining > 0) {
                        val read = input.read(buffer, 0, minOf(buffer.size.toLong(), remaining).toInt())
                        if (read <= 0) break
                        output.write(buffer, 0, read)
                        remaining -= read
                    }
                }
            }
            output.flush()
        }
    }

    private fun writeEmpty(output: OutputStream, status: Int, method: String) {
        val reason = when (status) {
            204 -> "No Content"
            405 -> "Method Not Allowed"
            404 -> "Not Found"
            416 -> "Range Not Satisfiable"
            else -> "Error"
        }
        val headers = "HTTP/1.1 $status $reason\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
        output.write(headers.toByteArray(StandardCharsets.ISO_8859_1))
        output.flush()
    }

    private fun mimeType(name: String): String = when (FileSafety.extensionOf(name)) {
        ".html" -> "text/html; charset=utf-8"
        ".css" -> "text/css; charset=utf-8"
        ".js" -> "application/javascript; charset=utf-8"
        ".json" -> "application/json; charset=utf-8"
        ".svg" -> "image/svg+xml"
        ".mp3" -> "audio/mpeg"
        ".flac" -> "audio/flac"
        ".m4a" -> "audio/mp4"
        ".aac" -> "audio/aac"
        ".wav" -> "audio/wav"
        ".ogg", ".oga", ".opus" -> "audio/ogg"
        ".webm" -> "audio/webm"
        ".jpg", ".jpeg" -> "image/jpeg"
        ".png" -> "image/png"
        ".webp" -> "image/webp"
        ".gif" -> "image/gif"
        ".bmp" -> "image/bmp"
        ".avif" -> "image/avif"
        else -> "application/octet-stream"
    }
}
