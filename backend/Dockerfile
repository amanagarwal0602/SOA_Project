# Skill 11: Containerization of Microservices System
# Multi-stage Docker build for Spring Boot SOA Backend

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy POMs and source code
COPY pom.xml pom.xml
COPY common-lib common-lib
COPY discovery-server discovery-server
COPY api-gateway api-gateway
COPY soa-service soa-service

# Package all microservices
RUN mvn clean package -DskipTests

# Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/discovery-server/target/discovery-server-1.0.0-SNAPSHOT.jar discovery-server.jar
COPY --from=build /app/api-gateway/target/api-gateway-1.0.0-SNAPSHOT.jar api-gateway.jar
COPY --from=build /app/soa-service/target/soa-service-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 5000 8080 8081 8761
VOLUME /app/data

ENTRYPOINT ["java", "-jar", "app.jar"]
