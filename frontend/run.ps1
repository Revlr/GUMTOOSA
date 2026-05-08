$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Python = Join-Path $RepoRoot "backend\.venv\Scripts\python.exe"

if (!(Test-Path $Python)) {
  $Python = "python"
}

Push-Location $RepoRoot
try {
  & $Python frontend\server.py
}
finally {
  Pop-Location
}
