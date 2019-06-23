const channel = require("../src/channel");
const assert = require("assert");

describe("Channel", function() {
    var req = { params: {channelName: "" }};
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

    var driver = {
        put: function(table, doc) {
            this.table = table;
            this.doc = doc;

            return table !== null;
        },
        query: function(table, conditions) {
            this.table = table;
            this.conditions = conditions;

            return { success: true };
        },
    };

    beforeEach(function() {
        res.statusCode = 200;
        res.sent = {};
        driver.table = "";
        driver.conditions = {};
        driver.doc = {};
    });

    describe("Middleware", function() {
    });

    describe("getChannelMessage", function() {

        it("should fail validating input (too short)", async function() {
            req.params.channelName = "";

            await channel.getChannelMessages(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (too long)", async function() {
            req.params.channelName = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";

            await channel.getChannelMessages(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (undefined)", async function() {
            req.params.channelName = undefined;

            await channel.getChannelMessages(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (null)", async function() {
            req.params.channelName = null;

            await channel.getChannelMessages(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });

        it("should fail validating input (symbols)", async function() {
            req.params.channelName = "Hello!";

            await channel.getChannelMessages(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
        });
        
        it("should pass correct paramters to db driver", async function() {

            channel.setDoc(driver);
            req.params.channelName = "ExampleChannel";
            
            await channel.getChannelMessages(req, res);

            assert.deepEqual(res.statusCode, 200, "Status code was not 200");
            assert.deepEqual(res.sent.success, true, "Did not send correct response");
            assert.deepEqual(driver.table, "ChannelMessages", "Did not pass correct table");
            assert.deepEqual(driver.conditions.channelName, "ExampleChannel", "Did not pass conditions correctly");
        
        });


    });

    describe("postChannelMessage", async function() {

        it("should fail validating input (too short)", async function() {
            req.params.username = "a";
            req.params.channelName = "a";
            req.params.message = "a";

            await channel.postChannelMessage(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert(res.sent.error.username !== undefined, "Did not invalidate username");
            assert(res.sent.error.channelName !== undefined, "Did not invalidate channelName");
            assert(res.sent.error.message !== undefined, "Did not invalidate message");
        });

        it("should fail validating input (too long)", async function() {
            req.params.username = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";
            req.params.channelName = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";

            await channel.postChannelMessage(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert(res.sent.error.username !== undefined, "Did not invalidate username");
            assert(res.sent.error.channelName !== undefined, "Did not invalidate channelName");
        });

        it("should fail validating input (undefined)", async function() {
            req.params.username = undefined;
            req.params.channelName = undefined;
            req.params.message = undefined;

            await channel.postChannelMessage(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert(res.sent.error.username !== undefined, "Did not invalidate username");
            assert(res.sent.error.channelName !== undefined, "Did not invalidate channelName");
            assert(res.sent.error.message !== undefined, "Did not invalidate message");
        });

        it("should fail validating input (null)", async function() {
            req.params.username = null;
            req.params.channelName = null;
            req.params.message = null;

            await channel.postChannelMessage(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert(res.sent.error.username !== undefined, "Did not invalidate username");
            assert(res.sent.error.channelName !== undefined, "Did not invalidate channelName");
            assert(res.sent.error.message !== undefined, "Did not invalidate message");
        });

        it("should fail validating input (symbols)", async function() {
            req.params.username = "Hello!";
            req.params.channelName = "Hello!";
            //req.params.message = "<>[]";

            await channel.postChannelMessage(req, res);
            
            assert.deepEqual(res.statusCode, 400, "Status code was not 400");
            assert(res.sent.error.username !== undefined, "Did not invalidate username");
            assert(res.sent.error.channelName !== undefined, "Did not invalidate channelName");
        });

        it("should pass correct paramters to db driver", async function() {
            req.body = { username: "Username", message: "A message!" };
            req.params.channelName = "ExampleChannel";

            await channel.postChannelMessage(req, res);

            assert.deepEqual(res.statusCode, 200, "Status code was not 200");
            assert.deepEqual(res.sent.code, 200, "Did not send correct response");
            assert.deepEqual(driver.table, "ChannelMessages", "Did not pass correct table");
            assert.deepEqual(driver.doc.channelName, "ExampleChannel", "Did not pass conditions correctly");
            assert.deepEqual(driver.doc.username, "Username", "Did not pass conditions correctly");
            assert.deepEqual(driver.doc.message, "A message!", "Did not pass conditions correctly");
        });
    });
});

