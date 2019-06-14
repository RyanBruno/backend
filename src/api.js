const express = require('express');
const router = express.Router();

router.use(express.json());

router.get('/:channel/messages', (req, res) => {

    neo.getChannelMessages(req.session.username, req.params.channel).then((answer) => {
        res.send(answer);
    }).catch((error) => {
        // TODO Error in UI
        res.status(500);
        console.log(error);
    });

});

router.get('/user/', (req, res) => {

    neo.getUserInfo(req.session.username).then((response) => {
        res.send(response);
    }).catch((error) => {
        // TODO Error in UI
        res.status(500);
        console.log(error);
    });

});

module.exports = router;
