FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm prune --omit=dev
EXPOSE 8080
CMD ["npm","start"]
