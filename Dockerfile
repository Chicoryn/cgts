FROM node:17 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:17 AS deploy
ENV NODE_ENV production
RUN apt-get update && apt-get install -y gnugo
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/public ./public
COPY next.config.js next.config.js
