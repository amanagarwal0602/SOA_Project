# Multi-stage Docker build for React Frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build React production bundle with configurable backend URL
ARG REACT_APP_API_URL=https://soa-backend-470517179980.asia-south1.run.app/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Nginx web server for production
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 8080

CMD ["nginx", "-g", "daemon off;"]
