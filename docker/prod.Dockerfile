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

COPY init_db.sh /docker-entrypoint-initdb.d/

# Ensure the prisma directory and its contents are copied
COPY prisma/ ./prisma/

CMD ["tail", "-f", "/dev/null"]

# # Generate Prisma client
# RUN pnpm prisma generate --schema=./prisma/schema.prisma

# # Build the NestJS application
# RUN pnpm run build

# # Expose the NestJS port specified in the environment variable
# EXPOSE $NESTJS_PORT

# # Command to run the application in production mode
# CMD ["sh", "-c", "pnpm run prisma:migrate:prod --schema=./prisma/schema.prisma && pnpm run prisma:push --schema=./prisma/schema.prisma && pnpm run start:prod"]
