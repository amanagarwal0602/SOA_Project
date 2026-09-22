# SOA (Service-Oriented Architecture)

A microservices-based food ordering platform featuring a Java Spring Cloud / Spring Boot backend and a React frontend.

## Architecture & Structure

- **frontend/**: React Web Application (Tailwind CSS, Config-Overrides, Vercel ready)
- **backend/**: Java Spring Cloud Microservices
  - `api-gateway`: API Gateway service
  - `discovery-server`: Eureka Discovery Server
  - `cafe-service`: Cafe management service
  - `menu-service`: Menu catalog service
  - `order-service`: Order processing service
  - `user-service`: User management service
  - `common-lib`: Shared backend utilities & DTOs
