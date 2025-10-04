### Multi-stage: build Next.js and serve with nginx + node
FROM node:20-alpine AS builder
WORKDIR /app
# Copy only package.json to avoid using an out-of-sync package-lock.json in the repo
COPY package.json ./
# Install dependencies for build (uses package.json). If you want reproducible builds,
# regenerate and commit a valid package-lock.json locally and switch back to `npm ci`.
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
# Install nginx so we can run it alongside the Node process
RUN apk add --no-cache ca-certificates curl nginx

# Create app directory
WORKDIR /usr/share/nginx/html

# Copy built Next output (we'll run next start, so copy only static public assets and necessary files)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# start nginx and then start node server
CMD sh -c "nginx -g 'daemon off;' & npm start"
