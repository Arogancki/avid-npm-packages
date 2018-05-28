FROM node:8.11.1

RUN mkdir -p /code
ADD package.json /code

WORKDIR /code
RUN npm install

ADD . /code
ADD <%= tempDirPath %>/docker/build_dist/run.sh /code/run.sh

VOLUME ["/code/build/"]
CMD ["bash", "/code/run.sh"]