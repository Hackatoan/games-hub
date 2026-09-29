FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
RUN chown -R node:node /app
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
