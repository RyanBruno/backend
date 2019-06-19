const express = require('express');
const router = express.Router();

const validation = require('./validation');
const neo = require('./neo');

router.use(express.json());

router.get('/session', (req, res) => {
    res.send({ username: "Username" });
    return;

    if (req.session.username === undefined)
    {
        res.status(401).send({ error: "No session found!" })
    } else {
        res.send({ username: req.session.username });
    }
});

router.post('/session', async (req, res) => {
    const { username, password } = req.body;

    if (validation.validateUsername(username) || validation.validatePassword(password))
    {
        res.status(400).send({ error: "Malformed username and/or password" });
        return;
    }

    try {
        var success = await neo.verifyLogin(username, password);

        if (success)
        {
            req.session.username = username;
            res.send({ code: 200, message: 'Success!' })
        } else 
        {
            res.send({ code: 406, message: 'Invalid username and/or password!' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error has occured!' });
    }
});

router.get('/:channelName/message', async (req, res) => {
    // Document
});

router.post('/:channelName/message', async (req, res) => {
    // Post Document
});

router.get('/user/:username/channel', async (req, res) => {
    // Make sure is logged in
    try {
        const relationship = await neo.findRelationship("User", { username: "Username" }, "IN", "Channel");

        res.send(relationship.map((r) => r.b.properties));
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error has occured!' });
    }
});

module.exports = router;
