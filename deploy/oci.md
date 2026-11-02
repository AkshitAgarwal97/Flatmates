# Host Flatmates on Oracle Cloud Always Free

Site: `https://www.flatmates.co.in`  
Stack: one Ampere A1 VM, JSON DB + photos on disk, Object Storage backups, Nginx + Let’s Encrypt.

## What you still need to paste

Generated locally (gitignored, do not commit):

- `deploy/secrets/id_ed25519` / `.pub` — SSH key for the VM
- `deploy/secrets/app.env` — `JWT_SECRET` and `CRON_SECRET`
- `deploy/secrets/oci_api_key.pem` — API private key (fingerprint `7c:6c:8a:e1:ac:07:56:33:b4:8d:2d:a3:47:96:bd:71`)
- `deploy/secrets/oci.tfvars` — Terraform vars (OCIDs still need pasting)

You must add the three OCIDs in `deploy/secrets/oci.tfvars`:

1. Console → **Profile** (user OCID) and **Tenancy** (tenancy OCID). Compartment can be the tenancy OCID.
2. Confirm the API key in Identity → Users → API Keys matches the fingerprint above. If you uploaded a different key, replace the PEM and fingerprint.
3. Region: `ap-mumbai-1` (change to `ap-hyderabad-1` if Mumbai Ampere is out of capacity).
3. Optional in `deploy/secrets/app.env`: `RESEND_API_KEY`, `GOOGLE_MAPS_API_KEY`, AdSense, site verification.
4. DNS for `flatmates.co.in`: after provision, A records `@` and `www` to the reserved IP.

## Commands

```powershell
# 1. Create VCN, reserved IP, Ampere VM, backup bucket
.\deploy\provision.ps1

# 2. Build, upload, systemd, nginx
.\deploy\cutover.ps1

# 3. Point DNS at the printed IP, then TLS:
# ssh -i deploy/secrets/id_ed25519 ubuntu@IP sudo certbot --nginx -d www.flatmates.co.in -d flatmates.co.in
```

If `VM.Standard.A1.Flex` 4 OCPU / 24 GB is out of capacity, set `ocpus = 2` and `memory_gbs = 12` in `oci.tfvars` and re-run provision.

## Always-on

- `flatmates.service` restarts on crash and at boot
- Minute healthcheck restarts Node if `/` fails
- Daily `/api/cron` at 03:00 UTC
- Daily backup of `/var/lib/flatmates` to Object Storage (or `/var/backups/flatmates` if OCI CLI is missing)
- Reserved public IP so DNS does not change after a reboot
- Instance recovery action `RESTORE_INSTANCE`

Oracle Always Free has no SLA. Idle Ampere VMs can be reclaimed after about 7 days of near-zero CPU. Keep UptimeRobot (or similar) on `https://www.flatmates.co.in`. If the VM is reclaimed, `provision.ps1` + restore `data/latest.tgz` brings it back on the same IP.

Restore:

```bash
sudo /opt/flatmates/deploy/restore.sh
```
