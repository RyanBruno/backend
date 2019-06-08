FROM node

COPY . /home/node/app
WORKDIR /home/node/app
RUN npm install .

ENV NEO4J_HOSTNAME bolt://142.93.48.219:7687
ENV NEO4J_USERNAME neo4j
ENV NEO4J_PASSWORD ryan

EXPOSE 8080
