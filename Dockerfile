FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY src ./src
COPY content ./content
COPY public ./public
RUN node scripts/build.mjs
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.mjs package.json ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
