FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to avoid conflicts seen during dev
RUN npm install --legacy-peer-deps --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
