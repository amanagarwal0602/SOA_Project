# Skill 12: Infrastructure Setup & Deployment of SOA System
# Terraform Infrastructure as Code (IaC) configuration for deploying microservices

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# VPC Configuration
resource "aws_vpc" "soa_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "soa-microservices-vpc"
    Environment = var.environment
  }
}

# Public Subnet
resource "aws_subnet" "soa_public_subnet" {
  vpc_id                  = aws_vpc.soa_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "soa-public-subnet"
  }
}

# Security Group for SOA Microservices (Eureka :8761, Gateway :8080, Service :8081)
resource "aws_security_group" "soa_sg" {
  name        = "soa-security-group"
  description = "Allow inbound HTTP, API Gateway, and Eureka traffic"
  vpc_id      = aws_vpc.soa_vpc.id

  ingress {
    description = "HTTP Public"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "React Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "API Gateway"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Eureka Discovery Server"
    from_port   = 8761
    to_port     = 8761
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "soa-microservices-sg"
  }
}

output "api_gateway_endpoint" {
  description = "API Gateway Endpoint"
  value       = "http://${aws_vpc.soa_vpc.id}.ap-south-1.compute.amazonaws.com:8080"
}

output "eureka_dashboard_url" {
  description = "Netflix Eureka Server Dashboard"
  value       = "http://${aws_vpc.soa_vpc.id}.ap-south-1.compute.amazonaws.com:8761"
}
