const neo4j = require("neo4j-driver").v1;

//const driver = neo4j.driver(process.env.NEO4J_HOSTNAME, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "ryan"));

var session = driver.session();

const setSession = function(sess)
{
    session = sess;
};

const createNode = async function(type, reqProperties, optionalProperties)
{
    var query = "MERGE (a:" + type;
    query += fillProperties(reqProperties);
    query += ")";

    Object.keys(optionalProperties).forEach((key) => {
        query += " ON CREATE SET a." + key + " = {" + key + "}";
    });

    // TODO return if created or not 
    return await session.run(query, { ...reqProperties, ...optionalProperties });
};

const findNode = async function(type, properties)
{
    var query = "MATCH (a:" + type;
    query += fillProperties(properties);
    query += ") RETURN a";

    var result = await session.run(query, properties);

    var node = { };

    result.records.forEach((record) => {
        node = record.get(0).properties;
    });

    return node;
};

const createRelationship = async function(firstType, firstProperties, relationship, secondType, secondProperties)
{
    var query = "MATCH (a:" + firstType;
    query += fillProperties(firstProperties);
    query += ") MATCH (b:" + secondType;
    query += fillProperties(secondProperties);
    query += ") CREATE (a) -[:" + relationship + "]-> (b)";

    return await session.run(query, { ...firstProperties, ...secondProperties }); // TODO fix
};

const findRelationship = async function(firstType, firstProperties = {}, relationship, secondType, secondProperties = {})
{
    var query = "MATCH (a:" + firstType;
    query += fillProperties(firstProperties);

    query += ") MATCH (a) -[r:" + relationship + "]-> (b:" + secondType;
    query += fillProperties(secondProperties);

    query += ") RETURN a, r, b";

    var result = await session.run(query, { ...firstProperties, ...secondProperties });

    return result.records.map((r) => {return {a: r.get(0), r: r.get(1), b: r.get(2)};});
};

function fillProperties(properties)
{
    if (Object.keys(properties).length === 0)
    {
        return "";
    }

    var query = "";
    Object.keys(properties).forEach((key) => {
        query += key + ": {" + key + "}, ";
    });
    query = query.substring(0, query.length - 2);

    return " { " + query + " }";
}

module.exports = { setSession, createNode, findNode, createRelationship, findRelationship };
