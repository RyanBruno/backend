const neo = require("../src/graph/neo4j");
const assert = require("assert");

describe("Neo4j", function() {
    describe("findNode", function() {
        it("should pass correct parameters to driver", async function() {
            var properties = { example: "...", more: true };

            var session = {
                query: "",
                properties: {},
                run: function(query, properties) {
                    this.query = query;
                    this.properties = properties;

                    return { records: [ { get: function(i) {return { properties: {success: true} };}}] };
                }
            };
            neo.setSession(session);
            const result = await neo.findNode("EXAMPLETYPE", properties);

            assert(result.success, "Did not return correct result");
            assert.deepEqual(session.query, "MATCH (a:EXAMPLETYPE { example: {example}, more: {more} }) RETURN a",  "Did not pass correct query");

        });
    });
});
