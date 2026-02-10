FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # Se necessário
EXPOSE 3000
CMD ["node", "dist/index.js"]