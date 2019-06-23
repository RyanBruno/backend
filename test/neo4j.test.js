const neo = require("../src/graph/neo4j");
const assert = require("assert");

describe("Neo4j", function() {
    var session = {
        run: function(query, properties) {
            this.query = query;
            this.properties = properties;

            return { records: [ { get: function(i) {return { i, properties: {success: true} };}}] };
        },
    };

    beforeEach(function() {
        session.query = "";
        session.properties = {};
    });

    describe("findNode", function() {
        it("should pass correct parameters to driver", async function() {
            var properties = { example: "...", more: true };

            neo.setSession(session);
            const result = await neo.findNode("EXAMPLETYPE", properties);

            assert(result.success, "Did not return correct result");
            assert.deepEqual(session.query, "MATCH (a:EXAMPLETYPE { example: {example}, more: {more} }) RETURN a",  "Did not pass correct query");
            assert.deepEqual(session.properties, properties,  "Did not pass correct properties");

        });
    });

    describe("createRelationship", function() {
        it("should pass correct parameters to driver", async function() {
            var properties1 = { example1: ".", more1: true };
            var properties2 = { example2: "..", more2: false };

            neo.setSession(session);
            await neo.createRelationship("EXAMPLETYPE1", properties1, "EXRELATIONSHIP", "EXAMPLETYPE2", properties2);

            assert.deepEqual(session.query, "MATCH (a:EXAMPLETYPE1 { example1: {example1}, more1: {more1} }) " +
                "MATCH (b:EXAMPLETYPE2 { example2: {example2}, more2: {more2} }) " +
                "CREATE (a) -[:EXRELATIONSHIP]-> (b)",  "Did not pass correct query");
            assert.deepEqual(session.properties, { ...properties1, ...properties2 },  "Did not pass correct properties");

        });
    });

    describe("findRelationship", function() {
        it("should pass correct parameters to driver", async function() {
            var properties1 = { example1: ".", more1: true };
            var properties2 = { example2: "..", more2: false };

            neo.setSession(session);
            await neo.findRelationship("EXAMPLETYPE1", properties1, "EXRELATIONSHIP", "EXAMPLETYPE2", properties2);

            assert.deepEqual(session.query, "MATCH (a:EXAMPLETYPE1 { example1: {example1}, more1: {more1} }) " +
                "MATCH (a) -[r:EXRELATIONSHIP]-> (b:EXAMPLETYPE2 { example2: {example2}, more2: {more2} }) " +
                "RETURN a, r, b",  "Did not pass correct query");
            assert.deepEqual(session.properties, { ...properties1, ...properties2 },  "Did not pass correct properties");

        });
    });
});
