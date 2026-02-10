# Altere de node:18-slim para node:22-slim
FROM node:22-slim

WORKDIR /app

# Instala dependências necessárias para compilação se houver pacotes nativos
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Agora o build deve funcionar com a flag experimental
RUN npm run build

EXPOSE 3000

# Verifique se o arquivo de saída é realmente dist/index.js
CMD ["node", "dist/index.js"]