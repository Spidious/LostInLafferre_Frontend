# Use Node.js LTS version
FROM node:18-alpine

# Install git and nodemon
RUN apk add --no-cache git \
    && npm install -g nodemon

# Set working directory
WORKDIR /app

# Clone the repository and checkout dev branch
RUN git clone -b dev https://github.com/Spidious/LostInLafferre_Frontend.git .

# Move into the correct folder inside the repository
WORKDIR /app/lost_in_laff

# Install dependencies
RUN npm install

# Build the app (required for production start)
RUN npm run build

# Expose the port
EXPOSE 3000

# Poll for updates and start the app
CMD ["/bin/sh", "-c", "cd /app/lost_in_laff && npm install && npm run build && nodemon --watch . --ext js,json,css,tsx,ts --exec 'npm run dev' & while true; do git pull origin dev; sleep 60; done"]
