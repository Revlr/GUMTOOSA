$ErrorActionPreference = "Stop"

$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (!(Test-Path $Python)) {
  throw "Virtual environment not found. Run: python -m venv backend\.venv"
}

Push-Location $BackendDir
try {
  & $Python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
}
finally {
  Pop-Location
}
