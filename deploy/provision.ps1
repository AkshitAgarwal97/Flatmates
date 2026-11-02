# Create Always Free Ampere VM, reserved IP, VCN, and backup bucket.
# Prerequisites: Terraform, deploy/secrets/oci.tfvars, deploy/secrets/id_ed25519
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$tfvars = Join-Path $root "deploy\secrets\oci.tfvars"
$key = Join-Path $root "deploy\secrets\id_ed25519"
$pub = "$key.pub"
if (-not (Test-Path $tfvars)) {
  throw "Missing $tfvars. Copy deploy/oci.tfvars.example and fill OCI API values."
}
if (-not (Test-Path $key)) {
  throw "Missing $key. Generate with ssh-keygen."
}

$varsText = Get-Content $tfvars -Raw
if ($varsText -match "REPLACE_WITH_") {
  throw "Fill tenancy_ocid, user_ocid, and compartment_ocid in $tfvars (console Profile + Tenancy details)."
}

$tf = Get-Command terraform -ErrorAction SilentlyContinue
if (-not $tf) {
  throw "Terraform is not installed. Install from https://developer.hashicorp.com/terraform/install"
}

$pubKey = (Get-Content $pub -Raw).Trim()
if ($varsText -notmatch "ssh-ed25519") {
  Add-Content $tfvars "`nssh_public_key = `"$pubKey`"`n"
}

Set-Location (Join-Path $root "deploy\terraform")
Copy-Item $tfvars ".\terraform.tfvars" -Force
terraform init -upgrade
terraform apply -auto-approve -var-file=".\terraform.tfvars"
if ($LASTEXITCODE -ne 0) { throw "terraform apply failed with exit $LASTEXITCODE" }

$ip = terraform output -raw public_ip
$ns = terraform output -raw namespace
$bucket = terraform output -raw bucket
$out = Join-Path $root "deploy\secrets\instance.env"
@"
PUBLIC_IP=$ip
OCI_NAMESPACE=$ns
OCI_BACKUP_BUCKET=$bucket
SSH_USER=ubuntu
SSH_KEY=$key
"@ | Set-Content -Encoding ascii $out

$appEnv = Join-Path $root "deploy\secrets\app.env"
$app = Get-Content $appEnv -Raw
if ($app -notmatch "OCI_NAMESPACE=") {
  Add-Content $appEnv "OCI_NAMESPACE=$ns"
  Add-Content $appEnv "OCI_BACKUP_BUCKET=$bucket"
}

Write-Host ""
Write-Host "Reserved IP: $ip"
Write-Host "Point DNS A records for @ and www to $ip then run deploy/cutover.ps1"
Write-Host "SSH: ssh -i $key ubuntu@$ip"
