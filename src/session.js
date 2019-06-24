const validate = require("validate.js");
const constraints = require("./constraints");

var graph = require("./graph/neo4j");

const setGraph = function(g)
{
    graph = g;
};

const getSession = async function(req, res)
{
    res.send({ username: "Username" });
    return;

    if (req.session.username === undefined)
    {
        res.status(401).send({ error: "No session found!" });
    } else {
        res.send({ username: req.session.username });
    }
};

const postSession = async function(req, res) 
{
    const { username, password } = req.body;
    
    const validation = validate(req.body, constraints.login);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }

    try {
        const user = await graph.findNode("User", { username });

        if (user.password === password)
        {
            req.session.username = username;
            res.send({ code: 200, message: "Success!" });
        } else 
        {
            res.status(400).send({ code: 406, message: "Invalid username and/or password!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

module.exports = { setGraph, getSession, postSession };
