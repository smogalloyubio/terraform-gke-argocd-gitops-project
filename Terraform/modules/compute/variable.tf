variable "master_name" { type = string }
variable "worker_names" { type = list(string) }
variable "machine_type" { type = string }
variable "image" { type = string }
variable "network" { type = string }
variable "subnet" { type = string }
variable "zone" { type = string }
