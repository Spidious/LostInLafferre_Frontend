# Use Node.js LTS version
FROM node:18-alpine

# Install git and nodemon
RUN apk add --no-cache git \
    && npm install -g nodemon

# Set working directory
WORKDIR /app

# Clone the repository and checkout dev branch
RUN git clone -b dev https://github.com/Spidious/LostInLafferre_Frontend.git .

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 3000

# Poll for updates and start the app
CMD ["/bin/sh", "-c", "while true; do git fetch origin dev && git reset --hard origin/dev && npm install && nodemon --watch . --exec 'npm run start'; sleep 60; done"]
