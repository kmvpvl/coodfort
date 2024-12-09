FROM node:22-alpine
RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY . .
RUN npm i
RUN npm run build
RUN npm install -g serve
RUN chown -R node /usr/src
USER node
EXPOSE ${PORT}
CMD ["serve", "-s", "build"]