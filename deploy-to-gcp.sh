#!/usr/bin/env bash
set -e

echo "================================================================"
echo "      SOA Microservices - Google Cloud Platform Deployment"
echo "================================================================"
echo ""

read -p "Enter your Google Cloud Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo "[ERROR] Project ID cannot be empty."
    exit 1
fi

echo ""
echo "Select Deployment Target:"
echo "[1] Google Cloud Run (Serverless, Auto-HTTPS, Recommended & Free Tier)"
echo "[2] Google Compute Engine VM (Docker Compose with Eureka + Gateway + Frontend)"
echo ""
read -p "Choose option [1 or 2]: " TARGET

if [ "$TARGET" == "1" ]; then
    echo ""
    echo "[*] Setting GCP project to $PROJECT_ID..."
    gcloud config set project "$PROJECT_ID"
    gcloud config set run/region asia-south1

    echo ""
    echo "[*] Step 1/2: Deploying Spring Boot SOA Backend to Cloud Run..."
    cd backend
    BACKEND_URL=$(gcloud run deploy soa-backend --source . --port 5000 --allow-unauthenticated --memory 1Gi --cpu 1 --format="value(status.url)")
    cd ..

    echo "[SUCCESS] Backend deployed at: $BACKEND_URL"

    echo ""
    echo "[*] Step 2/2: Deploying React Frontend to Cloud Run..."
    cd frontend
    FRONTEND_URL=$(gcloud run deploy soa-frontend --source . --port 80 --set-env-vars REACT_APP_API_URL="$BACKEND_URL/api" --allow-unauthenticated --format="value(status.url)")
    cd ..

    echo ""
    echo "================================================================"
    echo "[DEPLOYMENT COMPLETE]"
    echo "Frontend URL : $FRONTEND_URL"
    echo "Backend URL  : $BACKEND_URL/api"
    echo "================================================================"
    exit 0
fi

if [ "$TARGET" == "2" ]; then
    echo ""
    echo "[*] Initializing Terraform for Google Cloud..."
    cd terraform
    terraform init
    echo ""
    echo "[*] Provisioning GCP Compute Engine VM, VPC, and Firewalls..."
    terraform apply -target=google_compute_instance.soa_vm -var="gcp_project_id=$PROJECT_ID" -auto-approve
    cd ..
    echo ""
    echo "[SUCCESS] VM Provisioned. Check output above for the public IP address!"
    exit 0
fi

echo "Invalid choice."
exit 1
