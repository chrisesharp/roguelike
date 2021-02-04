FROM node:12
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000 8080
CMD [ "npm", "start" ]
USER node