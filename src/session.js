const validate = require("validate.js");
const constraints = require("./constraints");

const graph = require("./graph/neo4j");
const session = require("express-session");

const middleware = function(req, res, next)
{
    if (req.path.toLowerCase().startWith("/user") && req.params.username !== req.session.username)
    {
        // Error res
        return;
    } else if (req.path.toLowerCase().startWith("/channel"))
    {
        // Neo call
    }
    next();
};

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
            res.send({ code: 406, message: "Invalid username and/or password!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

module.exports = { session, middleware, getSession, postSession };
