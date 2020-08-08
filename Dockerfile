FROM node:14-alpine

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN yarn install --network-timeout 100000

ADD . /usr/src/app

RUN yarn build-ts

CMD [ "yarn", "start" ]