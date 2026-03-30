FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Use a production-grade HTTP server
FROM node:18-alpine
RUN npm install -g serve

WORKDIR /app

# Copy built application from previous stage
COPY --from=0 /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
