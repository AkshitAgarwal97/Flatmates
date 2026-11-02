output "public_ip" {
  value = oci_core_public_ip.reserved.ip_address
}

output "instance_ocid" {
  value = oci_core_instance.app.id
}

output "bucket" {
  value = oci_objectstorage_bucket.backups.name
}

output "namespace" {
  value = data.oci_objectstorage_namespace.ns.namespace
}

output "ssh" {
  value = "ssh -i ../secrets/id_ed25519 ubuntu@${oci_core_public_ip.reserved.ip_address}"
}

output "dns_records" {
  value = <<-EOT
    A    @      ${oci_core_public_ip.reserved.ip_address}
    A    www    ${oci_core_public_ip.reserved.ip_address}
  EOT
}
