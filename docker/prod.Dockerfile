# Stage 1: Build the application
FROM node:21.7.3-slim as build

# Install pnpm and required dependencies
RUN npm install -g pnpm && apt-get update -y && apt-get install -y procps openssl

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm run build


# Stage 2: Production image
FROM node:21.7.3-slim

RUN npm install -g pnpm && apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

# Copy the build output and the necessary files
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/pnpm-lock.yaml* ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/prisma/seeds/cities/cities.json ./prisma/seeds/cities/cities.json

# Expose the application port
EXPOSE 3200

# Start the application
CMD ["node", "dist/src/main"]
