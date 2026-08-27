# Node.js 20 LTS — satisfies PS Node.js tech stack requirement
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Railway injects service variables as Docker build-args — must be declared
# as ARG here and re-exported as ENV so Vite bakes them into the build
# (VITE_* vars are read at `npm run build` time, not at container runtime).
ARG VITE_API_BASE
ARG VITE_WS_BASE
ARG VITE_API_KEY
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_WS_BASE=$VITE_WS_BASE
ENV VITE_API_KEY=$VITE_API_KEY

RUN npm run build

# Serve built PWA via Node.js static server
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
