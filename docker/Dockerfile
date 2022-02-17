FROM nginx:1.17.6
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/rewrite.setting /etc/nginx/
COPY ./docker/portal.rewrite.setting /etc/nginx/
COPY ./build/files/ /usr/share/nginx/html/
COPY ./build/dist/ /usr/share/nginx/html/dist/

EXPOSE 80