param(
    [string]$Owner,
    [string]$Repository,
    [string]$Branch = "main",
    [string]$Path = "main/k8s",
    [switch]$Personal
)

if (-not $env:GITHUB_TOKEN) {
    Write-Error "GITHUB_TOKEN is not set"
    exit 1
}

if (-not $Owner -or -not $Repository) {
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        Write-Error "Cannot determine git remote origin. Provide -Owner and -Repository."
        exit 1
    }
    if ($remote -match "[:/]([^/:]+)/([^/]+?)(?:\.git)?$") {
        if (-not $Owner) { $Owner = $Matches[1] }
        if (-not $Repository) { $Repository = $Matches[2] }
    } else {
        Write-Error "Unrecognized remote format. Provide -Owner and -Repository."
        exit 1
    }
}

$argsList = @("bootstrap","github","--owner",$Owner,"--repository",$Repository,"--branch",$Branch,"--path",$Path,"--token-auth")
if ($Personal) { $argsList += "--personal" }

flux @argsList


