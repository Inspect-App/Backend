# Use a specific Node.js version
FROM node:21.7.3-slim

# Install pnpm, procps, openssl, and ffmpeg
RUN npm install -g pnpm \
    && apt-get clean \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends procps openssl ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package management files first and install dependencies
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

RUN pnpm add prisma

# Copy remaining application files
COPY . .

COPY init_db.sh /docker-entrypoint-initdb.d/

# Expose the NestJS port specified in the environment variable
EXPOSE $NESTJS_PORT

# Verify ffmpeg and ffprobe installation
RUN ffmpeg -version && ffprobe -version

# Run the development server and prisma migrate deploy
CMD ["sh", "-c", "pnpm prisma generate && pnpm run start:dev && pnpm run prisma migrate deploy"]
