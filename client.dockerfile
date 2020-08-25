FROM node:14.2.0-alpine3.11 as build
WORKDIR /app

COPY ./src/wms-ide-frontend/ClientApp ./
COPY ./src/wms-ide-frontend/ClientApp/package.json .
RUN npm install -g @angular/cli@7.1.1
RUN npm install

RUN ng build --prod

FROM nginx as runtime
COPY --from=build /app/dist /usr/share/nginx/html