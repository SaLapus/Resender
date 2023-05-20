FROM node:18-alpine

WORKDIR /usr/app

COPY package.json tsconfig.json ./

RUN yarn global add typescript@5.0.3

RUN yarn install --prod

COPY ./assets ./assets/

COPY ./src ./src/

RUN npm run build

CMD [ "node", "js/index.js"]