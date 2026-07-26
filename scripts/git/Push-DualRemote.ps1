<#
.SYNOPSIS
Pushes local main first to GitHub, then mirrors every local branch and tag to GitLab.

.DESCRIPTION
GitHub (`origin`) is pushed first and treated as the source of truth. The
script explicitly pushes `main`, rather than depending on the checked-out
branch, so the primary branch is always updated. GitLab (`gitlab`) is updated
only after the GitHub push succeeds. The script does not force-push or delete
remote refs. After pushing, it verifies that every published branch and tag
exists at the same commit on both remotes.

Local-only scratch branches (see -ExcludeBranch) are never published. Those
branches hold pre-rewrite history that was purged from `main`, so pushing them
would restore the removed content on both remotes and can be rejected outright
by GitHub secret scanning -- which used to abort the run before GitLab was
mirrored at all.

.EXAMPLE
.\scripts\git\Push-DualRemote.ps1
#>

[CmdletBinding()]
param(
    [string]$GitHubUrl = 'https://github.com/aloo31124/2025-spine-analysis.git',
    [string]$GitLabUrl = 'https://gitlab.com/aloo31124/2025-spine-analysis.git',
    [string[]]$ExcludeBranch = @('backup/*', 'backup-*', 'temp_delete')
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

function Get-PublishableBranch {
    $branches = Get-GitOutput -Arguments @(
        'for-each-ref',
        '--format=%(refname:short)',
        'refs/heads'
    )

    return @($branches | Where-Object {
        $branch = $_
        $branch -and -not ($ExcludeBranch | Where-Object { $branch -like $_ })
    })
}

function Assert-RemoteMatchesLocal {
    param(
        [Parameter(Mandatory)]
        [string]$Remote,

        [Parameter(Mandatory)]
        [AllowEmptyCollection()]
        [string[]]$Branches
    )

    $localLines = Get-GitOutput -Arguments (
        @(
            'for-each-ref',
            '--format=%(objectname)%09%(refname)',
            'refs/tags'
        ) + ($Branches | ForEach-Object { "refs/heads/$_" })
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

& git show-ref --verify --quiet refs/heads/main
if ($LASTEXITCODE -ne 0) {
    throw 'Local main does not exist. Run Configure-DualRemote.ps1 before pushing.'
}

$branches = Get-PublishableBranch
if ($branches -notcontains 'main') {
    throw 'Local main is excluded from publishing; check -ExcludeBranch.'
}

# main first, so the primary branch lands even if a feature branch is rejected.
$refspecs = @('main:main') + @($branches | Where-Object { $_ -ne 'main' } | ForEach-Object { "${_}:${_}" })
Write-Host "Publishing $($branches.Count) branch(es): $($branches -join ', ')"

Write-Host 'Pushing main to GitHub (origin)...'
Invoke-Git -Arguments @('push', 'origin', 'main:main')
Write-Host 'Pushing remaining branches and tags to GitHub (origin)...'
Invoke-Git -Arguments (@('push', 'origin') + $refspecs)
Invoke-Git -Arguments @('push', 'origin', '--tags')
Assert-RemoteMatchesLocal -Remote 'origin' -Branches $branches

Write-Host ''
Write-Host 'Mirroring branches and tags to GitLab (gitlab)...'
Invoke-Git -Arguments (@('push', 'gitlab') + $refspecs)
Invoke-Git -Arguments @('push', 'gitlab', '--tags')
Assert-RemoteMatchesLocal -Remote 'gitlab' -Branches $branches

Write-Host ''
Write-Host 'Dual-remote push completed successfully.'
