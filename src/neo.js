const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(process.env.NEO4J_HOSTNAME, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));

const session = driver.session();

exports.beginTx = function() {
    return session.beginTransaction();
};


