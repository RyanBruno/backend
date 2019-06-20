/*var params = {
    TableName : "Messages",
    KeySchema: [
        { AttributeName: "messageId", KeyType: "HASH"},  //Partition key
        { AttributeName: "channel", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "messageId", AttributeType: "N" },
        { AttributeName: "channel", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};*/

const AWS = require('aws-sdk');
const AWSaccessKeyId = 'not-important';
const AWSsecretAccessKey = 'not-important';      
const AWSregion = 'local';
const AWSendpoint = 'http://localhost:8000' // This is required
AWS.config.update({
        accessKeyId: AWSaccessKeyId,
        secretAccessKey: AWSsecretAccessKey,  
        region: AWSregion,
        endpoint: AWSendpoint
});
const client = new AWS.DynamoDB.DocumentClient();

const put = async function(table, doc)
{
    return await new Promise((resolve, reject) => { 
        client.put({ TableName: table, Item: doc, }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const get = async function(table, key)
{
    return await new Promise((resolve, reject) => { 
        client.get({ TableName: table, Key: key, }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Item); // Map to object
            }
        });
    });
};

const query = async function(table, conditions)
{
    var keyConditions = {
    };

    Object.keys(conditions).forEach((key) => {
        keyConditions[key] = { ComparisonOperator: "EQ", AttributeValueList: [ conditions[key] ]};
    });

    return await new Promise((resolve, reject) => { 
        client.query({ TableName: table, KeyConditions: keyConditions, }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items); // Map to object
            }
        });
    });
};

module.exports = { put, get, query };
