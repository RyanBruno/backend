const neo4j = require('neo4j-driver').v1;

//const driver = neo4j.driver(process.env.NEO4J_HOSTNAME, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "ryan"));

const session = driver.session();

const beginTx = function() 
{
    return session.beginTransaction();
};

const checkThenMergeUser = async function(username, name, password) 
{
    const tx = beginTx();

    const result = await tx.run("MATCH (n:User {username : {usernameParam} }) RETURN n", {usernameParam: username});
    if (result.records.length != 0) 
    {
        return false;
    }

    const insert = await tx.run("MERGE (n:User {username: {usernameParam}})" + 
                                "ON CREATE SET n.name = {nameParam}" +
                                "ON CREATE SET n.password = {passwordParam}", 
                                { usernameParam: username, nameParam: name, passwordParam: password });
    
    await tx.commit();
    console.log("UserCreated: { %s, %s, %s }", name, username, password);

    return true;
};

const verifyLogin = async function(username, password) 
{
    const tx = beginTx();
    const result = await tx.run("MATCH (n:User {username : {usernameParam} }) RETURN n", {usernameParam: username});
    tx.commit();
    
    return result.records.length != 0 && result.records[0].get(0).properties.password == password;
};

const getUserInfo = async function(username) 
{
    const tx = beginTx();
    const result = await tx.run("MATCH (u:User {username: {usernameParam}})" + 
                                "OPTIONAL MATCH (u) --> (c:Channel)" +
                                "OPTIONAL MATCH (u) --> (t:Tag)" +
                                "RETURN u, c, t", 
                                { usernameParam: username });
    tx.commit();
    var userInfo = { };

    result.records.forEach((record) => {
        if (record.get(0) !== null)
        {
            userInfo.username = record.get(0).properties.username;
            userInfo.name = record.get(0).properties.name;
        }
        

        if (record.get(1) !== null)
        {
            var channel = {
                address: record.get(1).properties.address,
                nickname: record.get(1).properties.nickname,
            };
            if (userInfo.channelList === undefined)
            {
                userInfo.channelList = [];
            }
            userInfo.channelList.push(channel);
        }

        if (record.get(2) !== null)
        {
            var tag = {
                name: record.get(2).properties.name,
                color: record.get(2).properties.color,
            };
            if (userInfo.tagList === undefined)
            {
                userInfo.tagList = [];
            }
            userInfo.tagList.push(tag);
        }
    });


    // Throw error if user is not found

    return userInfo;
};

const getChannelMessages = async function(username, channel)
{

    const tx = beginTx();
    const result = await tx.run("MATCH (u:User {username: {usernameParam}})" + 
                                "MATCH (u) --> (c:Channel {nickname: {nicknameParam})" +
                                "MATCH (c) --> (m:Message)" +
                                "RETURN m", 
                                { usernameParam: username, nicknameParam});
    tx.commit();

    var answer = [ ];

    result.records.forEach((record) => {
        if (record.get(0) !== null)
        {
            answer.push(record.get(0).properties);
        }
    });

    return answer;
};

module.exports = { beginTx, checkThenMergeUser, verifyLogin, getUserInfo, getChannelMessages };
