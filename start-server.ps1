$port = 5000
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

Write-Host "Starting Mompie Pickle Web Server..."

# Try to find a free port
while ($port -lt 5050) {
    try {
        $testListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        $testListener.Start()
        $testListener.Stop()
        break
    } catch {
        $port++
    }
}

$url = "http://localhost:$port/"

# Launch default browser
try {
    Start-Process $url
} catch {
    Write-Host "Could not open browser automatically: $_"
}

Write-Host "=========================================="
Write-Host " Mompie Pickle is running at: $url"
Write-Host " Workspace: $root"
Write-Host " Press Ctrl+C in this terminal to stop."
Write-Host "=========================================="

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $relPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relPath)) {
                $relPath = "index.html"
            }

            # Decode URL
            $relPath = [System.Uri]::UnescapeDataString($relPath)
            $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relPath))

            if ($fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -Path $fullPath -PathType Leaf)) {
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
                $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $notFoundBytes.Length
                $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            }
            $response.OutputStream.Close()
        } catch {
            # Continue on client aborts or read errors
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
