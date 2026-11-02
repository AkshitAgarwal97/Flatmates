variable "tenancy_ocid" {
  type = string
}

variable "user_ocid" {
  type = string
}

variable "fingerprint" {
  type = string
}

variable "private_key_path" {
  type = string
}

variable "compartment_ocid" {
  type        = string
  description = "Usually the same as tenancy_ocid for a personal Always Free account."
}

variable "region" {
  type    = string
  default = "ap-mumbai-1"
}

variable "ssh_public_key" {
  type = string
}

variable "display_name" {
  type    = string
  default = "flatmates"
}

variable "shape" {
  type    = string
  default = "VM.Standard.A1.Flex"
}

variable "ocpus" {
  type    = number
  default = 4
}

variable "memory_gbs" {
  type    = number
  default = 24
}

variable "boot_volume_gbs" {
  type    = number
  default = 50
}

variable "ssh_ingress_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Lock this to your home IP/32 when you can."
}

variable "enable_instance_principal" {
  type    = bool
  default = true
}
