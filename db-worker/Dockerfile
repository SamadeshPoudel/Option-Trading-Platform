#Download the base image from the docker hub
FROM oven/bun:latest

#work inside the app dir in the container
WORKDIR /app

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

#start the application
CMD [ "bun","run","index.ts" ]