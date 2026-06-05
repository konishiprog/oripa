FROM node:20

WORKDIR /app

COPY . .

RUN npm install

CMD ["npx", "ts-node", "-P", "tsconfig.json", "main.ts"]