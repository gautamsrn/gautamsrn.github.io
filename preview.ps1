$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Support the installed Ruby even in a terminal opened before installation.
if (-not (Get-Command ruby -ErrorAction SilentlyContinue)) {
    if (Test-Path 'C:\Ruby33-x64\bin\ruby.exe') {
        $env:Path = 'C:\Ruby33-x64\bin;' + $env:Path
    } else {
        throw 'Ruby was not found. Install Ruby with DevKit, then reopen PowerShell.'
    }
}

& bundle check
if ($LASTEXITCODE -ne 0) {
    throw 'Dependencies are missing. Run bundle install, then try again.'
}

Write-Host 'Private preview: http://127.0.0.1:4000 (Ctrl+C to stop)'
& bundle exec jekyll serve --drafts --host 127.0.0.1 --port 4000
exit $LASTEXITCODE
