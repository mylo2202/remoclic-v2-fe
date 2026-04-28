# Stage 1: Build the Angular application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application in production mode
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build-stage to the Nginx html directory
# Note: The output path dist/remoclic-v2/browser matches the standard Angular 17+ setup
COPY --from=build-stage /app/dist/remoclic-v2/browser /usr/share/nginx/html

# Copy the custom Nginx configuration template
# The official Nginx image will replace ${BACKEND_URL} and put it in /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Only substitute BACKEND_URL in templates to avoid breaking Nginx variables like $uri
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
