FROM node:latest

WORKDIR /usr/src/playball

COPY . .
	
RUN npm install -g playball

CMD ["playball"]
