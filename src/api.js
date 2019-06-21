const graph = require("./graph/neo4j");
const doc = require("./document/dynamodb");

const getSession = async function(req, res)
{
    res.send({ username: "Username" });
    return;
/*
    if (req.session.username === undefined)
    {
        res.status(401).send({ error: "No session found!" });
    } else {
        res.send({ username: req.session.username });
    }*/
};

const postSession = async function(req, res) 
{
    const { username, password } = req.body;

    // TODO Validaton framework
    /*if (validation.validateUsername(username) || validation.validatePassword(password))
    {
        res.status(400).send({ error: "Malformed username and/or password" });
        return;
    }*/

    try {
        const user = await graph.findNode("User", { username });

        if (user.password === password)
        {
            req.session.username = username;
            res.send({ code: 200, message: "Success!" });
        } else 
        {
            res.send({ code: 406, message: "Invalid username and/or password!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const getChannelMessages = async function(req, res) 
{
    // Document
    // Validate channelName

    try {
        var result = await doc.query("Messages", { channelName: req.params.channelName });

        res.send(result); // Fix
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const postChannelMessage = async function(req, res)
{
    var { username, message } = req.body;
    var channelName = req.params.channelName;
    
    // TODO Validaton framework
    /*if (validation.validateUsername(username) || validation.validateMessage(message))
    {
        res.status(400).send({ error: "Malformed message!" });
        return;
    }*/

    // TODO Create timestamp

    try {
        var result = await doc.put("Messages", { username, /*timestamp, */channelName, message });
        if (result)
        {
            res.send({ code: 200, message: "Success!" });
        } else
        {
            res.status(500).send({ error: "An error has occured!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const getUserChannels = async function(req, res)
{
    // Validate username
    // Make sure is logged in
    try {
        const relationship = await graph.findRelationship("User", { username: "Username" }, "IN", "Channel");

        res.send(relationship.map((r) => r.b.properties));
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const getUserMessages = async function(req, res)
{
    // Validate username
    try {
        const messages = await doc.query("Messages", { username: req.params.username });

        res.send(messages);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

module.exports = { getSession, postSession, getChannelMessages, postChannelMessage, getUserChannels, getUserMessages };
