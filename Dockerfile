FROM node:14
RUN adduser node root
WORKDIR /usr/src/app
RUN chown node:root /usr/src/app
COPY --chown=node:root package*.json ./
COPY --chown=node:root . .
USER node
ENV NO_UPDATE_NOTIFIER true
RUN npm install
RUN npm run build
RUN mkdir -p /usr/src/app/.cache
RUN chmod -R 775 /usr/src/app/.cache
RUN chown -R node:root /usr/src/app/.cache
RUN chmod -R 775 /usr/src/app/dist
RUN chown -R node:root /usr/src/app/dist
EXPOSE 3000
CMD [ "npm", "start" ]
