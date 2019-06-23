const session = require("../src/session");
const assert = require("assert");

describe("Session", function() {
    var req = { body: {}, session: { username: "" }};
    var res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        send: function(obj) {
            this.sent = obj;
            return this;
        },
    };

    beforeEach(function() {
        res.statusCode = 200;
        res.sent = {};
        req.session = {};
    });

    describe("getSession", function() {
        it("should respond with session username", async function() {
            req.session.username = "EXUSERNAME";
            await session.getSession(req, res);

            assert.deepEqual(res.statusCode, 200, "Status code was not 200");
            assert.deepEqual(res.sent.username, "EXUSERNAME", "Did not return correct username");
        });
    });

    describe("postSession", function() {
        var graph = {
            findNode: function(type, properties) {
                this.type = type;
                this.properties = properties;

                return { username: properties.username, password: "EXPASSWORD" };
            }
        };

        beforeEach(function() {
            graph.type = "";
            graph.properties = {};
        });

        it("should fail validating input (too short)", async function() {
            req.body.username = "";
            req.body.password = "";

            await session.postSession(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (too long)", async function() {
            req.body.username = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";
            req.body.password = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";

            await session.postSession(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (undefined)", async function() {
            req.body.username = undefined;
            req.body.password = undefined;

            await session.postSession(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (null)", async function() {
            req.body.username = null;
            req.body.password = null;

            await session.postSession(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (symbols)", async function() {
            req.body.username = "Hello!";
            req.body.password = "Hello!";

            await session.postSession(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should login correctly", async function() {
            req.body.username = "EXUSERNAME";
            req.body.password = "EXPASSWORD";
            session.setGraph(graph);

            await session.postSession(req, res);

            assert.deepEqual(res.statusCode, 200, "Status code was not 200");
            assert.deepEqual(res.sent.code, 200, "Sent status code was not 200");
            assert.deepEqual(req.session.username, "EXUSERNAME", "Did not correctly set session username");
        });

        it("should not login correctly", async function() {
            req.body.username = "EXUSERNAME";
            req.body.password = "WRONGPASSWORD";
            session.setGraph(graph);

            await session.postSession(req, res);

            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert.deepEqual(res.sent.code, 406, "Sent status code was not 406");
            assert(req.session.username !== "EXUSERNAME", "Set session username dispite failed login");
        });
    });
});
