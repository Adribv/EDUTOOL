# Use an official Node.js runtime as a base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json (for npm install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose the port
EXPOSE 5000

# Start your app
CMD ["node", "server.js"]