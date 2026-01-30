#Download the base image from the docker hub
FROM oven/bun:latest

#work inside the app dir in the container
WORKDIR /app

# install curl for healthcheck
RUN apt-get update \
 && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*

#copy the package files
COPY package.json bun.lock ./

#install the dependecies
RUN bun install --production

#copy prisma schema for generation
COPY prisma ./prisma/

#Generate prisma client
RUN bunx prisma generate

#copy rest of the application
COPY . .

#expose port
EXPOSE 5000

#health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD curl -f http://localhost:5000/health || exit 1

#start the application
CMD [ "bun","run","index.ts" ]