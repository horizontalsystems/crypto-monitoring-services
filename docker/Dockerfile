FROM node:12-alpine

WORKDIR /app/cryptomon

# Install app dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
