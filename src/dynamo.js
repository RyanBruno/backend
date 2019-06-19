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

AWS.config.update({
});

const client = new AWS.DynamoDB.DocumentClient();

const pushMessage = async function(message) {
    /*Item: {
        "channel": channel,
        "timestamp": timestamp,
        "message": message,
        "channel": channel,
    },*/

    return await new Promise((resolve, reject) => { 
        client.put({ TableName: "Messages", Item: message, }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
