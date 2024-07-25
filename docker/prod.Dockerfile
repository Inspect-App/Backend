# Use a specific Node.js version
FROM node:21.7.3-slim

# Install pnpm and procps (for ps command)
RUN npm install -g pnpm && apt-get update -y && apt-get install -y procps openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package management files first and install only production dependencies
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --production

# Install Prisma CLI as a dev dependency separately
RUN pnpm add prisma --save-dev

# Copy remaining application files
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the NestJS application
RUN pnpm run build

# Expose the NestJS port specified in the environment variable
EXPOSE $NESTJS_PORT

# Command to run the application in production mode
CMD ["sh", "-c", "pnpm run prisma:migrate:prod && pnpm run prisma:push && pnpm run start:prod"]
