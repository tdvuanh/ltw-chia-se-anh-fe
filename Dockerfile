# syntax=docker/dockerfile:1

###############################################
# Build stage: build Vite app bằng pnpm
###############################################
FROM node:22-bookworm AS build
WORKDIR /app

# Bật pnpm qua corepack (khớp pnpm-lock.yaml lockfileVersion 9.0)
RUN corepack enable && corepack prepare pnpm@9 --activate

# Cài dependencies theo lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# URL API được nhúng lúc build (Vite chỉ đọc biến môi trường khi build)
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN pnpm run build

###############################################
# Runtime stage: phục vụ tĩnh bằng nginx
###############################################
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
