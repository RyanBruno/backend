const validate = require("validate.js");
const constraints = require("./constraints");

const doc = require("./document/dynamodb");

const middleware = function(req, res, next)
{
    // Neo call
    next();
};

const getChannelMessages = async function(req, res) 
{
    const validation = validate.single(req.params.channelName, constraints.channelName);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }

    try {
        var result = await doc.query("ChannelMessages", { channelName: req.params.channelName });

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
    
    const validation = validate(req.body, constraints.message);
    if (validation)
    {
        res.status(400).send({ code: 406, error: validation });
        return;
    }
    // TODO Create timestamp

    try {
        var result = await doc.put("ChannelMessages", { username, /*timestamp, */channelName, message });
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

module.exports = { middleware, getChannelMessages, postChannelMessage };
