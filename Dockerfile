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
# Copy the build output
COPY --from=build-stage /app/dist/remoclic-v2/browser /usr/share/nginx/html

# Copy the custom Nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Expose port 80
EXPOSE 80

# Manual substitution at runtime to ensure it works on any platform (Render/K8s/etc.)
# We use a shell to run envsubst on our template and output it to the final Nginx config location
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
