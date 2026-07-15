variable "network_name" {
  description = "Name of the VPC"
  default     = "k3s-vpc"
}

variable "subnet_name" {
  description = "Name of the subnet"
  default     = "k3s-subnet"
}

variable "region" {
  description = "GCP Region"
  default     = "us-central1"
}
