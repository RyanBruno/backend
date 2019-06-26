const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: "not-important",
    secretAccessKey: "not-important",  
    region: "local",
    endpoint: "http://localhost:8000",
});

var client = new AWS.DynamoDB.DocumentClient();

const validate = require("validate.js");
const constraints = require("./constraints");

const doc = require("./document/dynamodb");

const postUser = function(req, res)
{
    const validation = validate(req.body, constraints.user);
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    const { name, username, password } = req.body;

    try {
        client.put( { TableName: "Addresssable",
            // TODO make id
            Item: { addressableId: username, login: { username, password, }, profile: { name }},
            ConditionExpression: "attribute_not_exists(login.username)",
        }, function (err, data) {
            if (err) {
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
    const addressableId = req.params.addressableId;

    const validation = validate.single(addressableId, constraints.addressableId);
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    try {
        client.get( { TableName: "Addresssable",
            Key: { addressableId },
            AttributesToGet: "channels",
        }, function (err, data) {
            if (err) {
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
};

const getMessages = function(req, res)
{};

const postMessage = function(req, res)
{};

const getProfile = function(req, res)
{

    const addressableId = req.params.addressableId;

    const validation = validate.single(addressableId, constraints.addressableId);
    if (validation)
    {
        res.status(400).send({ code: 406, message: "Malformed input" });
        return;
    }

    try {
        client.get( { TableName: "Addresssable",
            Key: { addressableId },
            AttributesToGet: "profile",
        }, function (err, data) {
            if (err) {
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
};

module.exports = { postUser, getChannels, getMessages, postMessage };
