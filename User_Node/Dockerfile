# Use an official Node.js runtime as a base image
FROM node

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3002

# Define the command to run the application
CMD ["node", "index.js"]