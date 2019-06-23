const dynamo = require("../src/document/dynamodb");
const assert = require("assert");

describe("DynamoDB", function() {
    var client = {
        put: function(params, callback) {
            this.table = params.TableName;
            this.item = params.Item;

            callback(null, { success: true });
        },
        get: function(params, callback) {
            this.table = params.TableName;
            this.key = params.Key;

            callback(null, { Item: { success: true }});
        },
        query: function(params, callback) {
            this.table = params.TableName;
            this.conditions = params.KeyConditions;

            callback(null, { Items: { success: true }});
        },
    };

    beforeEach(function() {
        client.table = "";
        client.item = {};
        client.key = {};
        client.conditions = {};
    });

    describe("put", function() {
        it("should pass correct parameters to driver", async function() {
            dynamo.setClient(client);

            var item = { a: "a", b: true };
            var result = await dynamo.put("EXTABLE", item);

            assert(result.success, "Did not return correct result");
            assert.deepEqual(client.table, "EXTABLE",  "Did not pass correct table");
            assert.deepEqual(client.item, item,  "Did not pass correct item");
        });
    });

    describe("get", function() {
        it("should pass correct parameters to driver", async function() {
            dynamo.setClient(client);

            var key = { a: "a", b: true };
            var result = await dynamo.get("EXTABLE", key);

            assert(result.success, "Did not return correct result");
            assert.deepEqual(client.table, "EXTABLE",  "Did not pass correct table");
            assert.deepEqual(client.key, key,  "Did not pass correct key");
        });
    });

    describe("query", function() {
        it("should pass correct parameters to driver", async function() {
            dynamo.setClient(client);

            var conditions = { a: "a", b: true };
            var result = await dynamo.query("EXTABLE", conditions);

            assert(result.success, "Did not return correct result");
            assert.deepEqual(client.table, "EXTABLE",  "Did not pass correct table");

            var keyConditions = {
                a: { ComparisonOperator: "EQ", AttributeValueList: [ "a" ] },
                b: { ComparisonOperator: "EQ", AttributeValueList: [ true ] },
            };

            assert.deepEqual(client.conditions, keyConditions,  "Did not pass correct KeyConditions");
        });
    });
});
