const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
});
const client = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");

const validate = require("validate.js");
const constraints = require("./constraints");
const _ = require("lodash");

const getSession = async function(req, res)
{
    if (req.session.addressableId === undefined)
    {
        res.status(401).send({ error: "No session found!" });
    } else {
        res.send({ username: req.session.addressableId });
    }
};

const postSession = async function(req, res)
{
    const input = _.pick(req.body, [ "username", "password" ]);

    if(validate(input, constraints.login))
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    client.query( { TableName: "Addressables",
        KeyConditionExpression: "login.username = :username",
        ExpressionAttributeValues: { ":username", input.username },
        Limit: 1,
    }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500).send({ error: "An error has occured!" });
        } else {
            // TODO none found
            if (data.Items[0].login.password === input.password)
            {
                req.session.addressableId = data.item.addressableId;
                res.send({ code: 200, message: "Success", data: { addressableId: data.Items[0].addressableId } });
            }
        }
    });
};

const postUser = function(req, res)
{
    const input = {
        addressableId: crypto.randomBytes(16).toString("hex"),
        login: {
            username: req.body.username,
            password: req.body.password,
        },
        profile: {
            name: req.body.username,
        },
    };

    if (validate(input, constraints.user))
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    client.put( { TableName: "Addressables",
        Item: input,
        ConditionExpression: "attribute_not_exists(login.username)",
    }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500).send({ error: "An error has occured!" });
        } else {
            res.send({ code: 200, message: "Success" });
        }
    });
};


const getChannels = function(req, res)
{
    get(req, res, [ "channels" ]);
};

const getMessages = function(req, res)
{
    var input = {
        addressableId: req.params.addressableId,
        after: req.query.after || "0",
    };

    var limit = _.toInteger(req.query.n || 50);

    if (validate({ limit, ...input }, constraints.getMessages))
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    input = _.mapKeys(input, (value, key) => ":" + key);

    client.query( { TableName: "Messages",
        KeyConditionExpression: "toAddressableId = :addressableId and #timestamp > :after",
        ExpressionAttributeNames: { "#timestamp": "timestamp" },
        ExpressionAttributeValues: input,
        Limit: limit,
    }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500).send({ error: "An error has occured!" });
        } else {
            res.send({ code: 200, message: "Success", data: { messages: data.Items } });
        }
    });
};

const postMessage = function(req, res)
{
    let input = _.pick(req.body, [ "toAddressableId", "fromAddressableId", "message" ]);
    input.timestamp = _.now();

    if (validate(input, constraints.message))
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    client.put( { TableName: "Messages",
        Item: input,
    }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500).send({ error: "An error has occured!" });
        } else {
            res.send({ code: 200, message: "Success" });
        }
    });
};

const getProfile = function(req, res)
{
    get(req, res, [ "profile" ]);

};

function get(req, res, AttributesToGet)
{
    const addressableId = req.params.addressableId;

    if (validate.single(addressableId, constraints.addressableId))
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

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
}

module.exports = { getSession, postSession, postUser, getChannels, getMessages, postMessage, getProfile };
