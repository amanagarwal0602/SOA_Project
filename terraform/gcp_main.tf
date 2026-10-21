# Skill 12: Infrastructure Setup & Deployment on Google Cloud Platform (GCP)
# Terraform IaC Configuration for Deploying SOA Microservices to GCP Compute Engine

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "Your Google Cloud Project ID"
  type        = string
  default     = "your-gcp-project-id"
}

variable "gcp_region" {
  description = "GCP Region for deployment"
  type        = string
  default     = "asia-south1" # Mumbai, India (or us-central1)
}

variable "gcp_zone" {
  description = "GCP Zone for deployment"
  type        = string
  default     = "asia-south1-a"
}

variable "machine_type" {
  description = "Machine type for Compute Engine VM"
  type        = string
  default     = "e2-medium" # 2 vCPU, 4GB RAM (sufficient for all microservices)
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
}

# 1. Custom VPC Network
resource "google_compute_network" "soa_vpc" {
  name                    = "soa-microservices-vpc"
  auto_create_subnetworks = true
}

# 2. Firewall Rules to allow HTTP, Frontend, Backend, Gateway, and Eureka
resource "google_compute_firewall" "soa_firewall_rules" {
  name    = "soa-allow-services"
  network = google_compute_network.soa_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "3000", "5000", "8080", "8761"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["soa-server"]
}

# 3. Static Public IP Address
resource "google_compute_address" "soa_static_ip" {
  name = "soa-vm-static-ip"
}

# 4. Google Compute Engine VM Instance with Docker Pre-installed
resource "google_compute_instance" "soa_vm" {
  name         = "soa-microservices-vm"
  machine_type = var.machine_type
  zone         = var.gcp_zone
  tags         = ["soa-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30 # 30 GB SSD
    }
  }

  network_interface {
    network = google_compute_network.soa_vpc.name
    access_config {
      nat_ip = google_compute_address.soa_static_ip.address
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    set -e
    apt-get update
    apt-get install -y ca-certificates curl gnupg lsb-release git

    # Install Docker & Docker Compose
    mkdir -m 0755 -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Outputs
output "vm_public_ip" {
  description = "Public IP Address of the SOA Google Cloud VM"
  value       = google_compute_address.soa_static_ip.address
}

output "frontend_url" {
  description = "URL to access the React Frontend"
  value       = "http://${google_compute_address.soa_static_ip.address}"
}

output "backend_api_url" {
  description = "URL to access the Spring Boot SOA API"
  value       = "http://${google_compute_address.soa_static_ip.address}:5000/api"
}

output "eureka_dashboard_url" {
  description = "URL to access the Netflix Eureka Dashboard"
  value       = "http://${google_compute_address.soa_static_ip.address}:8761"
}

output "api_gateway_url" {
  description = "URL to access the Spring Cloud API Gateway"
  value       = "http://${google_compute_address.soa_static_ip.address}:8080"
}
