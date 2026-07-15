resource "google_compute_instance" "master" {
  name         = var.master_name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["k3s", "master"]

  boot_disk {
    initialize_params { image = var.image }
  }

  network_interface {
    network    = var.network
    subnetwork = var.subnet
    access_config {} # Public IP for master
  }

  metadata_startup_script = "curl -sfL https://get.k3s.io | sh -"
}

resource "google_compute_instance" "worker" {
  count        = length(var.worker_names)
  name         = var.worker_names[count.index]
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["k3s", "worker"]

  boot_disk {
    initialize_params { image = var.image }
  }

  network_interface {
    network    = var.network
    subnetwork = var.subnet
    # No access_config means no public IP
  }

  metadata_startup_script = "curl -sfL https://get.k3s.io | K3S_URL=https://${google_compute_instance.master.network_interface[0].network_ip}:6443 K3S_TOKEN=mysecret sh -"
}
