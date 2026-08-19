$ErrorActionPreference = "Stop"

$path = "app\manager\session\page.tsx"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$oldPattern = '<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">\s*<ShuttleIcon className="w-8 h-8 text-white" />\s*</div>'

$newBlock = "<div className=`"w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-200 p-4`">`n            <img src=`"/logo-white.png`" alt=`"SierraBad`" className=`"w-full h-full object-contain`" />`n          </div>"

$regex = New-Object System.Text.RegularExpressions.Regex($oldPattern)
$match = $regex.Match($content)

if (-not $match.Success) {
    Write-Host "WARNING: pattern not found. No changes were made. File is unchanged." -ForegroundColor Yellow
    Write-Host "This can happen if the file was already edited manually. Send the current file content and I will adjust." -ForegroundColor Yellow
} else {
    $newContent = $content.Substring(0, $match.Index) + $newBlock + $content.Substring($match.Index + $match.Length)
    [System.IO.File]::WriteAllText($path, $newContent, $utf8NoBom)
    Write-Host "File updated successfully: app/manager/session/page.tsx" -ForegroundColor Green
    Write-Host "Hero icon now shows the Sierra logo instead of the generic shuttle icon." -ForegroundColor Cyan
}
