FROM node:latest

COPY package*.json ./

RUN npm install
RUN npm install -g typescript

# Copy the necessary files for production build
COPY package*.json ./
COPY tsconfig.json ./
COPY dist/* ./dist/

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/app.js" ]
