FROM node:11.6.0-alpine

ENV DB_HOST=host.docker.internal

# Create a directly for the conatiner
WORKDIR /usr/src/app

# Copy package.json file to the WORKDIR
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all other files/directories to the WORKDIR
COPY . .

RUN npm run build
RUN npm run migrate:revert
RUN npm run migrate

EXPOSE 6000

EXPOSE 9200

# command to run when instantiate an image
CMD ["npm","start"]