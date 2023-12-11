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

const port = process.env.PORT || 3000;
let loggedIn = false;
let user_data=[];
let logout = 'Logout';
let name ='user';
let availability = 'Enter code above to check availability';
let login_data = 'Password';
let register_data = 'Make sure Both passwords match';
// let payment_success = false;
let cycle_code = '';

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
    user: process.env.USERNAME,
    host: process.env.HOSTNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 5432,
});
db.connect();

//app.use()
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/payment',paymentRoute);


//app.get()
app.get('/', (req,res)=>{
    if(loggedIn == false){
        logout = 'Login';
    }else{
        logout = 'Logout';
    }
    res.render('landing.ejs', {data: logout});
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
    name = req.user.displayName;
    user_data.name = name;
    user_data.email = req.user.email;
    user_data.username = name;
    user_data.password = '1234';
    console.log(user_data);

    loggedIn = true;
    res.redirect('/home');

});

app.get('/about', (req, res)=>{
    if(loggedIn == false)   logout = 'Login';
    else    logout = 'Logout';
    res.render('about.ejs', {data: logout});
});

app.get('/payment', (req,res)=>{
    res.render('payment.ejs', {data: availability});
});

app.get('/editprofile', (req,res)=>{

        res.render('editprofile.ejs', {username:user_data.username});
    
});

app.get('/home', (req,res)=>{

        res.render('home.ejs', {name:name});
   
});

app.get('/location', (req,res)=>{
    if(loggedIn == false)   logout = 'Login';
    else    logout = 'Logout';
    res.render('location.ejs', {data: logout});
});

app.get('/login', (req,res)=>{

        res.render('login.ejs', {data:login_data});

});

app.get('/register', (req,res)=>{

        res.render('register.ejs', {data: register_data});  

});

app.get('/resetpass', (req,res)=>{

        res.render('resetpass.ejs');
   
});

app.get('/return',(req,res)=>{

        res.render('return.ejs');
   
    
})

app.use('/auth/logout', async (req, res) => {
   
        req.session.destroy();
        loggedIn = false;
        res.render('logout.ejs');

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
    const location = req.body.location_selector;
    const temp = true
    const result = await db.query('SELECT * FROM cycles WHERE location = $1 AND availability = $2', [location, 1]);

    if(result.rows.length === 0){
        availability = 'No Cycles found!'
    }else{
        availability = result.rows[0].codes;
        cycle_code = result.rows[0].codes;
    }
    res.render('payment.ejs', {data: availability});
})

app.post('/payment/success', async(req, res)=>{
    const result = await db.query('UPDATE cycles SET availability = $1 where codes = $2', [0, cycle_code]);
})

app.post('/return', async(req, res)=>{
    const result = await db.query('UPDATE cycles SET availability = $1 where codes = $2', [1, req.body.code]);
    res.redirect('/home');
})

  

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

