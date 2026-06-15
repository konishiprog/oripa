FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--allowed-hosts", "oripamall.com,localhost,127.0.0.1,163.44.112.176"]