const validate = require("validate.js");
const constraints = require("./constraints");

const graph = require("./graph/neo4j");
const doc = require("./document/dynamodb");

const middleware = function(req, res, next)
{
    if (req.params.username !== req.session.username)
    {
        // Error res
        return;
    }
    next();
};

const postUser = async function(req, res)
{
    // Waiting on graph addion of option props
    const validation = validate(req.body, constraints.user);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }

    const { name, username, password } = req.body;

    try {
        await graph.createNode("User", { username }, { name, password });

        // TODO Check if already created

        res.send({ code: 200, message: "Success" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const getUserChannels = async function(req, res)
{
    const validation = validate.single(req.params.username, constraints.username);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }

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
    const validation = validate.single(req.params.username, constraints.username);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }

    try {
        const messages = await doc.query("UserMessages", { username: req.params.username });

        res.send(messages);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

module.exports = { middleware, postUser, getUserChannels, getUserMessages };
