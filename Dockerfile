FROM node:8

WORKDIR /src
#COPY ./src .
#COPY ./.env .
EXPOSE 3000
CMD npm i && npm start
