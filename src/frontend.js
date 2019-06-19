const express = require('express');

const validation = require('./validation');
const neo = require('./neo');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('signup.html');
});

/* {'name': , 'username': , 'password': } */
router.post('/signup', (req, res) => {
    var { name, username, password } = req.body;

    if (validation.validateName(name))
    {
        res.render('signup.html', { error: true, message: 'Name must only contain uppercase and lowercase letters, spaces and hyphen and be between 6-36 charaters' });
        return;
    }

    if (validation.validateUsername(username))
    {
        res.render('signup.html', { error: true, message: 'Username must only contain uppercase and lowercase letters and numbers and between 6-36 charaters' });
        return;
    }

    if (validation.validatePassword(password))
    {
        res.render('signup.html', { error: true, message: 'Password must only contain uppercase and lowercase letters, numbers, and !@#$%^&*<>,.~ and between 6-36 charaters' });
        return;
    }


    //TODO Hash password

    // Check if exsists

    neo.checkThenMergeUser(username, name, password).then((added) => {
        if (added) {
            res.redirect('login?message="Account created! Login."');
        } else {
            res.render('signup.html', { error: true, message: 'Username already exists!' });
        }
    }).catch((error) => {
        res.render('signup.html', { error: true, message: 'An error has occured!' });
        console.log(error);
    });


});

router.get('/login', (req, res) => {
    if (req.session.username != undefined) 
    {
        res.render('login.html', { error: false, message: 'Logged in as ' + req.session.username });
        return;
    }
    res.render('login.html');
});

router.post('/login', (req, res) => {
    var { username, password } = req.body;
    // TODO input validation

});

router.get('/ui', (req, res) => {
    res.render('ui.html', { username: req.session.username });
});

module.exports = router;
