//packages
const express = require("express");
const app = express();
const paymentRoute = require('./routes/paymentRoute');
require('./controllers/passport-auth');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require("body-parser");
const pg = require("pg");

const port = 3000;
let loggedIn = false;
let user_data=[];
let name ='user';
let availability = 'Enter code above to check availability';
let hours = 0;
let login_data = 'Password';
let register_data = 'Make sure Both passwords match';

function isLoggedIn(req, res, next){
    req.user ? next() : res.sendStatus(401);
}

//passport
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

app.use(passport.initialize());
app.use(passport.session());

//database initialization
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "campus-ride",
    password: "gm@123098",
    port: 5433,
});
db.connect();

//app.use()
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/payment',paymentRoute);


//app.get()
app.get('/', (req,res)=>{
    res.render('landing.ejs');
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
}));

app.get('/auth/google/failure',isLoggedIn, (req, res)=>{
    res.send("Something went wrong");
});

app.get('/auth/protected',isLoggedIn, (req, res)=>{
    let name = req.user.displayName;
    console.log(req.user);
    res.send(`Hello ${name}`);
});

app.use('/auth/logout', (req, res)=>{
    req.session.destroy();
    res.send('See you again');
});

app.get('/about', (req, res)=>{
    res.render('about.ejs');
});

app.get('/payment', (req,res)=>{
    res.render('payment.ejs', {data: availability});
});

app.get('/editprofile', (req,res)=>{
    if(loggedIn == true){
        res.render('editprofile.ejs', {username:user_data.username});
    }else{
        res.redirect('/login');
    }
});

app.get('/home', (req,res)=>{
    if(loggedIn == true){
        res.render('home.ejs', {name:name});
    }else{
        res.redirect('/login');
    }
});

app.get('/location', (req,res)=>{
    res.render('location.ejs');
});

app.get('/login', (req,res)=>{
    res.render('login.ejs', {data:login_data});
});

app.get('/register', (req,res)=>{
    res.render('register.ejs', {data: register_data});
});

app.get('/resetpass', (req,res)=>{
    if(loggedIn == true){
        res.render('resetpass.ejs');
    }else{
        res.render('login.ejs');
    }
});

app.use('/auth/logout', (req, res)=>{
    req.session.destroy();
    res.send('See you again');
});


// app.post()
app.post('/login', async(req, res)=>{
    const data = req.body;
    const result = await db.query('select * from customers where email = $1', [data.email]);
    if(result.rows.length === 0){
        login_data = 'User does not exist, please register';
        res.redirect('/login');
    }
    else if(result.rows[0].password !== data.password){
        login_data = 'Incorrect password, please try again';
        res.render('login.ejs', {data: login_data});
    }else{

        loggedIn = true;
        
        user_data = result.rows[0];
        name = user_data.name;
        res.redirect('/home');
    }
});

app.post('/register', async(req, res)=>{
    user_data = req.body;
    name = user_data.name;

    if(user_data.repeat_password !== user_data.password){
        register_data = 'Passwords dont match, try again';
        res.render('registercopy.ejs', {data: register_data});
    }else{

        loggedIn = true;
        await db.query('insert into customers (name, username, password, email) values ($1, $2, $3, $4)', 
        [user_data.name, user_data.username, user_data.password, user_data.email]);
        
        res.redirect('/home');
    }
});

app.post('/editprofile', async(req, res) => {
    let data = req.body;
    await db.query('update customers set name = $1, email = $2, password = $3 where username = $4', 
        [data.name, data.email, data.password, user_data.username]);

    res.redirect('/home');
})

app.post('/payment', async(req, res)=>{
    const data = req.body.id;
    const result = await db.query('select * from cycles where codes = $1', [data]);
    if(result.rows.length === 0){
        availability = 'Invalid code!'
    }else{
        availability = result.rows[0].availability;
    }
    res.render('payment.ejs', {data: availability});
})



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});