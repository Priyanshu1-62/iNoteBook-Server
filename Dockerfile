FROM node:22-alpine

WORKDIR /inotebook-server

COPY package.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]