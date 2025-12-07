FROM nginx:alpine

COPY . /usr/share/nginx/html/

CMD sh -c "echo \"window.ENV = { API_BASE_URL: '$API_BASE_URL' };\" > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"