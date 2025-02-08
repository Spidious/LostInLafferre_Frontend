# Use Node.js LTS version
FROM node:18-alpine

# Install git and nodemon
RUN apk add --no-cache git \
    && npm install -g nodemon

# Set working directory
WORKDIR /app

RUN ping 1.1.1.1 -c 1 && ping github.com -c 1
# Clone the repository and checkout dev branch
RUN git clone -b main https://github.com/Spidious/LostInLafferre_Frontend.git .

# Move into the correct folder inside the repository
WORKDIR /app/lost_in_laff

# Install dependencies
RUN npm install

# Build the app (required for production start)
RUN npm run build

# Expose the port
EXPOSE 3000

# Set mode argument (default: remote)
ARG MODE=remote
ENV MODE=$MODE

# Start the app based on mode
CMD ["/bin/sh", "-c", \
    "if [ \"$MODE\" = \"local\" ]; then \
        npm run dev; \
    else \
        cd /app/lost_in_laff && npm install && npm run build && nodemon --watch . --ext js,json,css,tsx,ts --exec 'npm run dev' & while true; do git fetch origin main && git reset --hard origin/main; sleep 15; done; \
    fi"]
