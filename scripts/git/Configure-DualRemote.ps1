<#
.SYNOPSIS
Configures GitHub as the primary remote and GitLab as the secondary mirror.

.DESCRIPTION
The script is safe to run repeatedly. It keeps GitHub as `origin` (the default
fetch/push remote), keeps GitLab as `gitlab`, and ensures a local `main` branch
exists and tracks `origin/main`. This also repairs clones that only have a
working branch (for example `work`), which otherwise makes `git push origin
main` fail because there is no local `main` ref to push.

.EXAMPLE
.\scripts\git\Configure-DualRemote.ps1
#>

[CmdletBinding()]
param(
    [string]$GitHubUrl = 'https://github.com/aloo31124/2025-spine-analysis.git',
    [string]$GitLabUrl = 'https://gitlab.com/aloo31124/2025-spine-analysis.git'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-Git {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

function Get-RemoteUrl {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $url = & git remote get-url $Name 2>$null
    if ($LASTEXITCODE -eq 0) {
        return $url.Trim()
    }

    return $null
}

Invoke-Git -Arguments @('rev-parse', '--is-inside-work-tree')

$originUrl = Get-RemoteUrl -Name 'origin'
$gitlabRemoteUrl = Get-RemoteUrl -Name 'gitlab'

# Preserve the existing GitLab remote name before assigning `origin` to GitHub.
if ($originUrl -eq $GitLabUrl -and -not $gitlabRemoteUrl) {
    Invoke-Git -Arguments @('remote', 'rename', 'origin', 'gitlab')
    $originUrl = $null
    $gitlabRemoteUrl = $GitLabUrl
}

if ($originUrl) {
    Invoke-Git -Arguments @('remote', 'set-url', 'origin', $GitHubUrl)
}
else {
    Invoke-Git -Arguments @('remote', 'add', 'origin', $GitHubUrl)
}

if ($gitlabRemoteUrl) {
    Invoke-Git -Arguments @('remote', 'set-url', 'gitlab', $GitLabUrl)
}
else {
    Invoke-Git -Arguments @('remote', 'add', 'gitlab', $GitLabUrl)
}

Invoke-Git -Arguments @('config', 'remote.pushDefault', 'origin')

Invoke-Git -Arguments @('fetch', 'origin', '--prune')

& git show-ref --verify --quiet refs/heads/main
if ($LASTEXITCODE -ne 0) {
    & git show-ref --verify --quiet refs/remotes/origin/main
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub remote '$GitHubUrl' does not contain a main branch, so local main cannot be created safely."
    }

    Invoke-Git -Arguments @('branch', '--track', 'main', 'origin/main')
}

Invoke-Git -Arguments @('branch', '--set-upstream-to=origin/main', 'main')

Write-Host ''
Write-Host 'Configured remotes:'
Invoke-Git -Arguments @('remote', '-v')
Write-Host ''
Write-Host 'Primary push remote: origin (GitHub)'
Write-Host 'Secondary mirror:    gitlab (GitLab)'
Write-Host 'Main upstream:       origin/main'
