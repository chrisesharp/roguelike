FROM node:14
RUN adduser node root
WORKDIR /usr/src/app
RUN chown node:root /usr/src/app
COPY --chown=node:root package*.json ./
COPY --chown=node:root . .
USER node
RUN npm install
RUN npm run build
RUN chmod -R 775 /usr/src/app
RUN chown -R node:root /usr/src/app
EXPOSE 3000
CMD [ "npm", "start" ]
