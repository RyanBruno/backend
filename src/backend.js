const express = require('express');

const mustacheExpress = require('mustache-express');

const session = require('express-session');
const redisStore = require('connect-redis')(session);

const http = require('http');
const https = require('https');

const api = require('./api');
const frontend = require('./frontend');

const app = express();

app.engine('mustache', mustacheExpress());
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/../views');


app.use('/style.css', express.static('views/style.css'));
app.use('/app.js', express.static('views/app.js'));

app.use(session({ store: new redisStore({ url: "redis://localhost:6379" }), secret: 'very secret secret', resave: false, saveUninitialized: false, }));

app.use(express.urlencoded({ extended: false }));
app.use('/api', api);
app.use('/', frontend);


http.createServer(app).listen(8080, () => {
    console.log('App listing: 8080');
});

/*
https.createServer(app).listen(8081, () => {
    console.log('Https App listing: 8081');
});*/
