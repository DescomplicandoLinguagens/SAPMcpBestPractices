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

# Garante que as variáveis de ambiente de porta estejam corretas
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Tente rodar via npm start em vez de chamar o node direto no dist
# Isso geralmente resolve caminhos de arquivos relativos
CMD ["npm", "run", "start"]