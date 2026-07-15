# Compute output
output "master_ip" { value = google_compute_instance.master.network_interface[0].network_ip }
