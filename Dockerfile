FROM node:12

COPY [".", "/usr/src/"]

WORKDIR  /usr/src

RUN npm install

EXPOSE 5000

CMD ["node", "run", "start"]
