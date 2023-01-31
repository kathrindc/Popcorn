FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN yarn install 
EXPOSE 9090
CMD ["node", "/app/index.js"]