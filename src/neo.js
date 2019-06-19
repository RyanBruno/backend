const neo4j = require('neo4j-driver').v1;

//const driver = neo4j.driver(process.env.NEO4J_HOSTNAME, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "ryan"));

const session = driver.session();

const createNode = async function(type, reqProperties) // TODO ON MATCH optional props
{
    var query = "MERGE (:" + type + " {";
    Object.keys(reqProperies).forEach((key) => {
        query += key + ": {" + key + "},";
    });
    query += "})";

    return await session.run(query, reqProperties);
};

const createRelationship = async function(firstType, firstProperties, relationship, secondType, secondProperties)
{
    var query = "MATCH (a:" + fistType + " {";
    Object.keys(firstProperties).forEach((key) => {
        query += key + ": {" + key + "},";
    });
    query = query.substring(0, query.length - 1);
    query += "}) MATCH (b:" + secondType + " {";
    Object.keys(secondProperies).forEach((key) => {
        query += key + ": {" + key + "},";
    });
    query = query.substring(0, query.length - 1);
    query += "}) CREATE (a) -[:" + relationship + "]-> (b)";

    return await session.run(query, { ...firstProperties, ...secondProperties }); // TODO fix
};

const findRelationship = async function(firstType, firstProperties = {}, relationship, secondType, secondProperties = {})
{
    var query = "MATCH (a:" + firstType + " {";
    Object.keys(firstProperties).forEach((key) => {
        query += key + ": {" + key + "},";
    });

    query = query.substring(0, query.length - 1);
    query += "}) MATCH (a) -[r:" + relationship + "]-> (b:" + secondType + " { ";
    Object.keys(secondProperties).forEach((key) => {
        query += key + ": {" + key + "},";
    });

    query = query.substring(0, query.length - 1);
    query += " }) RETURN a, r, b";

    var result = await session.run(query, { ...firstProperties, ...secondProperties });

    return result.records.map((r) => {return {a: r.get(0), r: r.get(1), b: r.get(2)}});
};

module.exports = { createNode, createRelationship, findRelationship };
