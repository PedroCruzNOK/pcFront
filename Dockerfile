FROM node:14

COPY [".", "/usr/src/"]

WORKDIR  /usr/src

RUN npm install

EXPOSE 5000

CMD ["npm", "dev"]

