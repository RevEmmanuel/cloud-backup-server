FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN tsc

# Copy the necessary files for production build
COPY package*.json ./
COPY tsconfig.json ./
COPY dist/* ./dist/

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/app.js" ]
