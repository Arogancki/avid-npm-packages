#
# <%= projectName %> : <%= componentVersion%>
#

FROM node:argon

# Make application folders
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# install app dependencies

COPY module/package.json /usr/src/app

RUN npm install

# Bindle app

COPY ./module /usr/src/app

CMD ["npm", "start"]