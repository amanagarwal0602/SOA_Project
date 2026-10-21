# Skill 12: Infrastructure Setup & Deployment of Library & Food Delivery SOA System

## 1. Overview
This project adheres to the Service-Oriented Architecture (SOA) and Microservices specifications defined in the Course Workbook (`24SDCS03`):
- **Skill 1**: Food Delivery SOA System
- **Skill 2**: API Gateway Routing
- **Skill 3**: User Registration System with Validation
- **Skill 4**: Token-Based Authentication (JWT)
- **Skill 5**: Securing APIs with CORS
- **Skill 6**: Library Management Microservice (CRUD)
- **Skill 7**: Securing Library Service with JWT & Role-Based Access Control (RBAC)
- **Skill 8**: Service Discovery with Netflix Eureka
- **Skill 9**: Unit Testing for Payment Service
- **Skill 10**: Integration Testing of SOA Microservices
- **Skill 11**: Containerization with Docker & Docker Compose
- **Skill 12**: Infrastructure Setup & Cloud Deployment with Terraform

---

## 2. Running Locally (Fastest - Standalone Mode)

### Step 1: Start the Spring Boot SOA Backend
```bash
cd backend/soa-service
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.
- Pre-seeds sample menu items, admin user (`admin` / `admin`), demo user (`demo` / `demo`), coupons, reviews, and library books.
- H2 web console accessible at `http://localhost:8080/h2-console` (`jdbc:h2:file:./data/soadb`, user: `sa`, password: blank).

### Step 2: Start the React Frontend
```bash
cd frontend
npm install
npm start
```
The frontend starts on `http://localhost:3000` and automatically connects to `http://localhost:8080/api`.

---

## 3. Running with Netflix Eureka & Spring Cloud Gateway (Microservice Mode)

1. **Start Eureka Discovery Server**:
   ```bash
   cd backend/discovery-server
   mvn spring-boot:run
   ```
   Eureka dashboard is live at `http://localhost:8761`.

2. **Start SOA Service on port 8081**:
   ```bash
   cd backend/soa-service
   mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081 --eureka.client.register-with-eureka=true --eureka.client.fetch-registry=true"
   ```

3. **Start API Gateway on port 8080**:
   ```bash
   cd backend/api-gateway
   mvn spring-boot:run
   ```

---

## 4. Running with Docker Compose (Skill 11)
```bash
docker-compose up --build
```
Spins up:
- `discovery-server` on `http://localhost:8761`
- `api-gateway` on `http://localhost:8080`
- `soa-service` on `http://localhost:8081`

---

## 5. Infrastructure Deployment with Terraform (Skill 12)

### Option A: AWS Deployment
```bash
cd terraform
terraform init
terraform plan
terraform apply
```
Provisions VPC, security groups for Eureka (`8761`), Gateway (`8080`), and web services on AWS.

---

## 6. Deploying on Google Cloud Platform (GCP)

You have two simple ways to deploy everything to Google Cloud:

### Method 1: Google Compute Engine (VM) with Docker Compose (Recommended for Coursework & Labs)
This method runs all microservices (Eureka, API Gateway, SOA Backend, and React Frontend) together on a single GCP Ubuntu virtual machine with pre-opened firewall ports.

#### Step 1: Install & Authenticate Google Cloud CLI (gcloud)
If not already installed, download [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and run:
```bash
gcloud init
gcloud auth application-default login
```

#### Step 2: Provision Infrastructure using GCP Terraform (Skill 12)
```bash
cd terraform
terraform init
terraform plan -target=google_compute_instance.soa_vm -var="gcp_project_id=YOUR_GCP_PROJECT_ID"
terraform apply -target=google_compute_instance.soa_vm -var="gcp_project_id=YOUR_GCP_PROJECT_ID" -auto-approve
```
*Note: Terraform will output the VM's static Public IP (`vm_public_ip`).*

#### Step 3: Deploy the System on the VM
SSH into the newly created GCP VM:
```bash
gcloud compute ssh soa-microservices-vm --zone=asia-south1-a
```
Once inside the VM:
```bash
# Clone the repository
git clone https://github.com/Pushkal0606/SOA.git
cd SOA

# Build and start all containers (Eureka, Gateway, Backend, Frontend)
docker compose up -d --build
```

#### Step 4: Access Your Live Google Cloud System
- **Frontend App**: `http://<VM_PUBLIC_IP>` (or `http://<VM_PUBLIC_IP>:3000`)
- **Backend API**: `http://<VM_PUBLIC_IP>:5000/api`
- **API Gateway**: `http://<VM_PUBLIC_IP>:8080`
- **Eureka Dashboard**: `http://<VM_PUBLIC_IP>:8761`

---

### Method 2: Google Cloud Run (Serverless Deployment)

Google Cloud Run runs containers directly in a fully-managed serverless environment with automatic HTTPS and zero server management.

#### Step 1: Set GCP Project & Region
```bash
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud config set run/region asia-south1
```

#### Step 2: Build & Deploy Backend on Cloud Run
```bash
cd backend
gcloud run deploy soa-backend \
  --source . \
  --port 5000 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```
Cloud Run outputs your live backend HTTPS URL: `https://soa-backend-xxxxxx.a.run.app`.

#### Step 3: Deploy Frontend on Cloud Run
Set the backend URL and deploy:
```bash
cd ../frontend
gcloud run deploy soa-frontend \
  --source . \
  --port 80 \
  --set-env-vars REACT_APP_API_URL=https://soa-backend-xxxxxx.a.run.app/api \
  --allow-unauthenticated
```
Cloud Run outputs your live frontend HTTPS URL: `https://soa-frontend-xxxxxx.a.run.app`.
