FROM node:alpine

WORKDIR /application

COPY . .

CMD ["yarn", "start:prod"]
