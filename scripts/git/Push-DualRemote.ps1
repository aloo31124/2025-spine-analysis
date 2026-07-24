<#
.SYNOPSIS
Pushes every local branch and tag to GitHub, then mirrors them to GitLab.

.DESCRIPTION
GitHub (`origin`) is pushed first and treated as the source of truth. GitLab
(`gitlab`) is updated only after the GitHub push succeeds. The script does not
force-push or delete remote refs. After pushing, it verifies that every local
branch and tag exists at the same commit on both remotes.

.EXAMPLE
.\scripts\git\Push-DualRemote.ps1
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

function Get-GitOutput {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    $output = & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }

    return @($output)
}

function Assert-RemoteUrl {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [Parameter(Mandatory)]
        [string]$ExpectedUrl
    )

    $actualUrl = [string](Get-GitOutput -Arguments @('remote', 'get-url', $Name) | Select-Object -First 1)
    $actualUrl = $actualUrl.Trim()
    if ($actualUrl -ne $ExpectedUrl) {
        throw "Remote '$Name' points to '$actualUrl'; expected '$ExpectedUrl'. Run Configure-DualRemote.ps1 first."
    }
}

function Get-RefMap {
    param(
        [Parameter(Mandatory)]
        [string[]]$Lines
    )

    $map = @{}
    foreach ($line in $Lines) {
        if (-not $line) {
            continue
        }

        $parts = $line -split "`t", 2
        if ($parts.Count -eq 2 -and -not $parts[1].EndsWith('^{}')) {
            $map[$parts[1]] = $parts[0]
        }
    }

    return $map
}

function Assert-RemoteMatchesLocal {
    param(
        [Parameter(Mandatory)]
        [string]$Remote
    )

    $localLines = Get-GitOutput -Arguments @(
        'for-each-ref',
        '--format=%(objectname)%09%(refname)',
        'refs/heads',
        'refs/tags'
    )
    $remoteLines = Get-GitOutput -Arguments @('ls-remote', '--heads', '--tags', $Remote)
    $localRefs = Get-RefMap -Lines $localLines
    $remoteRefs = Get-RefMap -Lines $remoteLines

    $mismatches = foreach ($refName in $localRefs.Keys) {
        if (-not $remoteRefs.ContainsKey($refName)) {
            "$refName is missing"
        }
        elseif ($remoteRefs[$refName] -ne $localRefs[$refName]) {
            "$refName differs (local $($localRefs[$refName]), remote $($remoteRefs[$refName]))"
        }
    }

    if ($mismatches) {
        throw "Verification failed for '$Remote':`n$($mismatches -join "`n")"
    }

    Write-Host "Verified $($localRefs.Count) branch/tag refs on '$Remote'."
}

Invoke-Git -Arguments @('rev-parse', '--is-inside-work-tree')
Assert-RemoteUrl -Name 'origin' -ExpectedUrl $GitHubUrl
Assert-RemoteUrl -Name 'gitlab' -ExpectedUrl $GitLabUrl

Write-Host 'Pushing all branches and tags to GitHub (origin)...'
Invoke-Git -Arguments @('push', 'origin', '--all')
Invoke-Git -Arguments @('push', 'origin', '--tags')
Assert-RemoteMatchesLocal -Remote 'origin'

Write-Host ''
Write-Host 'Mirroring all branches and tags to GitLab (gitlab)...'
Invoke-Git -Arguments @('push', 'gitlab', '--all')
Invoke-Git -Arguments @('push', 'gitlab', '--tags')
Assert-RemoteMatchesLocal -Remote 'gitlab'

Write-Host ''
Write-Host 'Dual-remote push completed successfully.'
