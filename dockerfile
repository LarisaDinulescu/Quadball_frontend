# Lightweight Node.js image 
FROM node:20-alpine

# create app directory
WORKDIR /app

# install app dependencies
COPY package*.json ./
RUN npm install

# copy the project files into the container
COPY . .

# expose the port the app runs on
EXPOSE 3000

CMD ["npm", "start"]