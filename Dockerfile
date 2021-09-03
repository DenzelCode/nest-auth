FROM node:latest

ENV PORT=3000
ENV TZ=America/New_York

WORKDIR /app
COPY package.json /app/
RUN yarn
COPY . /app/
COPY .docker.env /app/.env
CMD ["yarn", "run", "start"]
EXPOSE ${PORT}