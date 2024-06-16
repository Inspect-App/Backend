# Use a specific Node.js version
FROM node:21.7.3-slim

# Install pnpm and procps (for ps command)
RUN apt-get update -y && \
    apt-get install -y procps openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package management files first and install dependencies
COPY package.json package-lock.json* ./

RUN npm ci

# Install Prisma CLI
RUN npm install prisma @prisma/client

# Copy remaining application files
COPY . .

# Set build-time argument for the NestJS port
ARG NESTJS_PORT=3200

# Expose the NestJS port
EXPOSE $NESTJS_PORT

# Run the development server and prisma migrate deploy
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && npx prisma generate --schema=./prisma/schema.prisma && npm run start:dev"]
