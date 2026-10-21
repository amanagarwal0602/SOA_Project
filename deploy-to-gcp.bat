@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo       SOA Microservices - Google Cloud Platform Deployment
echo ================================================================
echo.

set /p PROJECT_ID="Enter your Google Cloud Project ID: "
if "%PROJECT_ID%"=="" (
    echo [ERROR] Project ID cannot be empty.
    pause
    exit /b 1
)

echo.
echo Select Deployment Target:
echo [1] Google Cloud Run (Serverless, Auto-HTTPS, Recommended & Free Tier)
echo [2] Google Compute Engine VM (Docker Compose with Eureka + Gateway + Frontend)
echo.
set /p TARGET="Choose option [1 or 2]: "

if "%TARGET%"=="1" (
    echo.
    echo [*] Setting GCP project to %PROJECT_ID%...
    call gcloud config set project %PROJECT_ID%
    call gcloud config set run/region asia-south1

    echo.
    echo [*] Step 1/2: Deploying Spring Boot SOA Backend to Cloud Run...
    cd backend
    call gcloud run deploy soa-backend --source . --port 5000 --allow-unauthenticated --memory 1Gi --cpu 1 --format="value(status.url)" > backend_url.tmp
    set /p BACKEND_URL=<backend_url.tmp
    del backend_url.tmp
    cd ..

    echo [SUCCESS] Backend deployed at: !BACKEND_URL!

    echo.
    echo [*] Step 2/2: Deploying React Frontend to Cloud Run...
    cd frontend
    call gcloud run deploy soa-frontend --source . --port 80 --set-env-vars REACT_APP_API_URL=!BACKEND_URL!/api --allow-unauthenticated --format="value(status.url)" > frontend_url.tmp
    set /p FRONTEND_URL=<frontend_url.tmp
    del frontend_url.tmp
    cd ..

    echo.
    echo ================================================================
    echo [DEPLOYMENT COMPLETE]
    echo Frontend URL : !FRONTEND_URL!
    echo Backend URL  : !BACKEND_URL!/api
    echo ================================================================
    pause
    exit /b 0
)

if "%TARGET%"=="2" (
    echo.
    echo [*] Initializing Terraform for Google Cloud...
    cd terraform
    call terraform init
    echo.
    echo [*] Provisioning GCP Compute Engine VM, VPC, and Firewalls...
    call terraform apply -target=google_compute_instance.soa_vm -var="gcp_project_id=%PROJECT_ID%" -auto-approve
    cd ..
    echo.
    echo [SUCCESS] VM Provisioned. Check output above for the public IP address!
    pause
    exit /b 0
)

echo Invalid choice.
pause
