const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
});
const client = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");

const validate = require("validate.js");
const constraints = require("./constraints");

const getSession = async function(req, res)
{
    res.send({ data: { addressableId: "077f97630ad0d2b37f0452285ec36ae6" } });
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
    //TODO secondary index by login.username
};

const postUser = function(req, res)
{
    const validation = validate(req.body, constraints.user);
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    const { name, username, password } = req.body;

    const addressableId = crypto.randomBytes(16).toString("hex");

    try {
        client.put( { TableName: "Addressables",
            Item: { addressableId, login: { username, password, }, profile: { name }},
            ConditionExpression: "attribute_not_exists(login.username)",
        }, function (error, data) {
            if (error) {
                console.log(error);
                res.status(500).send({ error: "An error has occured!" });
            } else {
                res.send({ code: 200, message: "Success" });
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};


const getChannels = function(req, res)
{
    get(req, res, [ "channels" ]);
};

const getMessages = function(req, res)
{
    const addressableId = req.params.addressableId;
    const after = req.query.after | Date.now();
    const before = req.query.before | 0;
    const n = req.query.n | 100;

    const validation = validate({ addressableId, after, before, n },
        { addressableId: constraints.addressableId,
            before: constraints.number,
            n: constraints.number,});
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    // Leave sorting to client
    // /api/:addressableId/messages?n=50
    // /api/:addressableId/messages?after=531513513515&n=1
    // /api/:addressableId/messages?before=13151351351&n=10

    try {
        client.query( { TableName: "Addressables",
            Key: { addressableId },
            KeyConditionExpression: "addressableId = :addressableId && timestamp BETWEEN :before AND :after",
            ExpressionAttributeValues: {
                addressableId,
                before,
                after,
            },
            Limit: n,
            AttributesToGet: [
                "timestamp",
                "toAddressableId",
                "fromAddressableId",
                "message",
            ],
        }, function (error, data) {
            if (error) {
                console.log(error);
                res.status(500).send({ error: "An error has occured!" });
            } else {
                res.send({ code: 200, message: "Success", data: { messages: data.Items } });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
};

const postMessage = function(req, res)
{

};

const getProfile = function(req, res)
{
    get(req, res, [ "profile" ]);

};

function get(req, res, AttributesToGet)
{
    const addressableId = req.params.addressableId;

    const validation = validate.single(addressableId, constraints.addressableId);
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    try {
        client.get( { TableName: "Addressables",
            Key: { addressableId },
            AttributesToGet,
        }, function (error, data) {
            if (error) {
                console.log(error);
                res.status(500).send({ error: "An error has occured!" });
            } else {
                res.send({ code: 200, message: "Success", data: data.Item });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error has occured!" });
    }
}

module.exports = { getSession, postSession, postUser, getChannels, getMessages, postMessage, getProfile };
