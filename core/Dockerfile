FROM node:16 as base

RUN apt update && apt upgrade -y && \
   apt install -y bash bash-completion make curl wget git

RUN npm install -g @nestjs/cli

WORKDIR /app 

FROM base as second

COPY package.json yarn.lock /app/

RUN yarn

FROM second

COPY . /app

CMD [ "yarn", "start" ]

