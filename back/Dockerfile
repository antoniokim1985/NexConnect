# Dockerfile dentro de la carpeta "back"
FROM node:18

WORKDIR /myapp

COPY package.json .
RUN npm install

COPY ../ .
CMD ["npx", "nodemon", "src/index.js"]