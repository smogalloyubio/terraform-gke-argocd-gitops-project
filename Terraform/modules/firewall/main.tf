resource "google_compute_firewall" "k3s_firewall" {
  name    = "k3s-allow-internal"
  network = var.network

  allow {
    protocol = "tcp"
    # K3s, Flannel, Kubelet ports + App ports
    ports    = ["6443", "8472", "10250", "2379", "2380", "51822", "51823", "8081", "8082", "8083"] 
  }
  
  allow {
    protocol = "udp"
    ports    = ["8472", "51822", "51823"]
  }

  source_tags = ["k3s"]
  target_tags = ["k3s"]
}
