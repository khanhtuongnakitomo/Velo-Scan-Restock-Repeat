# Starts the VELO website from the repository root.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/start.ps1
#
# This repository ships a frontend only (Vite on port 8443).
# The store hub, scanner API, database, and local AI described on the
# site are not implemented here, so there is no backend process to launch.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path 'node_modules')) {
  Write-Host 'Installing frontend dependencies...'
  pnpm install
}

Write-Host 'Frontend: http://localhost:8443'
Write-Host 'No backend in this repository. Starting the website only.'
pnpm dev
