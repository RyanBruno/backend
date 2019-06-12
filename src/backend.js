const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const redisStore = require('connect-redis')(session);

const http = require('http');
const https = require('https');

const neo = require('./neo');
const validation = require('./validation');

const app = express();

app.engine('mustache', mustacheExpress());
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/../views');

app.use('/style.css', express.static('views/style.css'));
app.use('/app.js', express.static('views/app.js'));
app.use(session({ store: new redisStore({ url: "redis://localhost:6379" }), secret: 'very secret secret', resave: false, saveUninitialized: false, }));
app.use(express.urlencoded({ extended: false }));

app.get('/signup', (req, res) => {
    res.render('signup.html');
});

/* {'name': , 'username': , 'password': } */
app.post('/signup', (req, res) => {
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

app.get('/login', (req, res) => {
    if (req.session.username != undefined) 
    {
        res.render('login.html', { error: false, message: 'Logged in as ' + req.session.username });
        return;
    }
    res.render('login.html');
});

app.post('/login', (req, res) => {
    var { username, password } = req.body;
    // TODO input validation

    neo.verifyLogin(username, password).then((success) => {
        if (success)
        {
            //res.redirect('ui');
            req.session.username = username;
            res.render('login.html', { error: false, message: 'Success!' })
        } else 
        {
            res.render('login.html', { error: true, message: 'Invalid username and/or password!' });
        }
    }).catch((error) => {
        console.log(error);
        res.render('login.html', { error: true, message: 'An error has occured!' });
    });
});

app.get('/ui', (req, res) => {
    var username = req.session.username;

    if (username === undefined)
    {
        res.render('login.html', { error: true, message: 'Please login' });
        return;
    }

    neo.getUserChannelTag(username).then((result) => {
        console.log(result);
        res.render('ui.html', result);
    }).catch((error) => {
        console.log(error);
        res.render('login.html', { error: true, message: 'An error has occured!' });
    });
});

app.get('/api/:channel/messages', (req, res) => {

    neo.getChannelMessages(req.session.username, req.params.channel).then((answer) => {
        // TODO JSON
    }).catch((error) => {
        // TODO Error in UI
        console.log(error);
    });

});

http.createServer(app).listen(8080, () => {
    console.log('App listing: 8080');
});

/*
https.createServer(app).listen(8081, () => {
    console.log('Https App listing: 8081');
});*/
