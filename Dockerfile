FROM node:18
WORKDIR /app
ADD package.json package.json
RUN npm install
CMD ["node", "./src/main.js", "serve"]
EXPOSE 8080
ADD src src
ADD .env .env