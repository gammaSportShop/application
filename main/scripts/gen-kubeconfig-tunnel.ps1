param([string]$ServerURL)
if (-not $ServerURL) { Write-Output "Usage: gen-kubeconfig-tunnel.ps1 https://your-tunnel-host[:port]"; exit 1 }
Copy-Item "$env:USERPROFILE\.kube\config" kubeconfig.ci -Force
$env:KUBECONFIG = "$(Get-Location)\kubeconfig.ci"
kubectl config use-context k3d-shop | Out-Null
kubectl config set-cluster k3d-shop --server=$ServerURL --insecure-skip-tls-verify=true | Out-Null
[Convert]::ToBase64String([IO.File]::ReadAllBytes("kubeconfig.ci")) | Tee-Object -FilePath kubeconfig.ci.b64
