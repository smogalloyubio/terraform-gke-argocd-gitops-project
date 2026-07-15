module "network" {
  source      = "./modules/network"
  network_name = var.network_name
  subnet_name  = var.subnet_name
  region       = var.region
}

module "compute" {
  source       = "./modules/compute"
  master_name  = var.master_name
  worker_names = var.worker_names
  machine_type = var.machine_type
  image        = var.image
  network      = module.network.network_name
  subnet       = module.network.subnet_name
  zone         = var.zone
}

module "firewall" {
  source  = "./modules/firewall"
  network = module.network.network_name
}
