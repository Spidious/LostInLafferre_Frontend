# Use Node.js LTS version
FROM node:18-alpine

# Install git and nodemon
RUN apk add --no-cache git \
    && npm install -g nodemon

# Set working directory
WORKDIR /app

# Set mode argument (default: local)
ARG MODE=local
ENV MODE=$MODE

# Clone the repository and checkout dev branch

ARG BRANCH=main
ENV BRANCH=$BRANCH
RUN if [ "$MODE" = "remote" ]; then git clone -b ${BRANCH} https://github.com/Spidious/LostInLafferre_Frontend.git .; fi

# Move into the correct folder inside the repository
WORKDIR /app/lost_in_laff

# Expose the port
EXPOSE 3000

# Start the app based on mode
CMD ["/bin/sh", "-c", \
    "if [ \"$MODE\" = \"local\" ]; then \
        npm install && npm run build && nodemon --watch . --ext js,json,css,tsx,ts --exec 'npm run dev'; \
    else \
        cd /app/lost_in_laff && npm install && npm run build && nodemon --watch . --ext js,json,css,tsx,ts --exec 'npm run dev' & while true; do git fetch origin ${BRANCH} && git reset --hard origin/${BRANCH}; sleep 15; done; \
    fi"]
