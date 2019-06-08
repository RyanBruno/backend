const express = require('express');
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express');
const http = require('http');
const https = require('https');

const neo = require('./neo');

const app = express();

app.engine('mustache', mustacheExpress());
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/../views');

app.use('/style.css', express.static('views/style.css'));
app.use(express.urlencoded({ extended: false }));

app.get('/signup', (req, res) => {
    res.render('signup.html');
});

/* {'name': , 'username': , 'password': } */
app.post('/signup', async (req, res) => {
    var { name, username, password } = req.body;

    // TODO Size validations
    if (name.match("[^A-Za-z\-' ']"))
    {
        res.render('signup.html', { error: true, message: 'Name must only contain uppercase and lowercase letters, spaces and hyphen' });
        return;
    }

    if (username.match("[^A-Za-z0-9]"))
    {
        res.render('signup.html', { error: true, message: 'Username must only contain uppercase and lowercase letters and numbers' });
        return;
    }

    if (password.match("[^A-Za-z0-9!@#$%^&*<>,.~[]"))
    {
        res.render('signup.html', { error: true, message: 'Password must only contain uppercase and lowercase letters, numbers, and !@#$%^&*<>,.~[]' });
        return;
    }

    //TODO Hash password

    // Check if exsists
    const tx = neo.beginTx();
    try {
        const result = await tx.run("MATCH (n:User {username : {usernameParam} }) RETURN n", {usernameParam: username});
        if (result.records.length != 0) 
        {
            res.render('signup.html', { error: true, message: 'Username already exists!' });
            return;
        }
        const insert = await tx.run("MERGE (n:User {username: {usernameParam}}) ON CREATE SET n.name = {nameParam} ON CREATE SET n.password = {passwordParam}", {usernameParam: username, nameParam: name, passwordParam: password});
        
        await tx.commit();
        console.log("UserCreated: { %s, %s, %s }", name, username, password);

    } catch (error)
    {
        console.log(error);
        res.render('signup.html', { error: true, message: 'An error has occured!' });
        return;
    }

    res.redirect('login?message="Account created! Login."');
});

app.get('/login', (req, res) => {
    res.render('login.html');
});

app.post('/login', async (req, res) => {
    var { username, password } = req.body;
    // TODO input validation

    const tx = neo.beginTx();
    const result = await tx.run("MATCH (n:User {username : {usernameParam} }) RETURN n", {usernameParam: username});
    tx.commit();
    
    if (result.records.length != 0 && results.records[0].get().properties.password == password)
    {
        res.render('login.html', { error: true, message: 'Success!' })
        // Login successful
    } else 
    {
        res.render('login.html', { error: true, message: 'Invalid username and/or password!' });
    }
});

app.get('/ui', async (req, res) => {
    
});

http.createServer(app).listen(8080, () => {
    console.log('App listing: 8080');
});

/*
https.createServer(app).listen(8081, () => {
    console.log('Https App listing: 8081');
});*/
