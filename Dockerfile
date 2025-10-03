FROM node:latest

ARG LANG=C.UTF-8
ARG LC_ALL=C.UTF-8

ENV LANG=${LANG}
ENV LC_ALL=${LC_ALL}

WORKDIR /usr/src/playball

COPY . .
	
RUN npm install -g playball

CMD ["playball"]
