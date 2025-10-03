FROM node:latest

ARG LANG=C.UTF-8
ARG LC_ALL=C.UTF-8
ARG TZ=America/New_York

ENV LANG=${LANG}
ENV LC_ALL=${LC_ALL}
ENV TZ=${TZ}

WORKDIR /usr/src/playball

COPY . .
	
RUN npm install -g playball

CMD ["playball"]
