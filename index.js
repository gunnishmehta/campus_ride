const express = require("express");
const app = express();

const paymentRoute = require('./routes/paymentRoute');
require('dotenv').config();
const bodyParser = require("body-parser");
const pg = require("pg");

const port = 3000;

let loggedIn = false;
let user_data=[];
let name ='user';
let availability = 'Enter code above to check availability';
let hours = 0;
let password = 'Password';
let register_data = 'Make sure Both passwords match';

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "campus-ride",
    password: "gm@123098",
    port: 5433,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/payment',paymentRoute);
app.get('/', (req,res)=>{
    res.render('landing.ejs');
})
app.get('/login', (req,res)=>{
    res.render('login.ejs', {data:password});
})
app.get('/home', (req,res)=>{
    if(loggedIn === true){
        res.render('home.ejs', {name:name});
    }else{
        res.redirect('/');
    }
})

app.post('/login', async(req, res)=>{
    const data = req.body;  
    
    const result = await db.query('select * from customers where email = $1', [data.email]);
    if(result.rows[0].password !== data.password){
        password = 'Incorrect password, please try again';
        res.render('login.ejs', {data: password});
    }else{

        loggedIn = true;
        
        user_data = result.rows[0];
        name = user_data.name;
        res.redirect('/home');
    }
});

app.get('/register', (req,res)=>{
    res.render('registercopy.ejs', {data: register_data});
})

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

app.post('/editprofile', (req, res) => {
    res.redirect('/home');
})

app.get('/payment', (req,res)=>{
    if(loggedIn === true){
        res.render('payment.ejs', {hour:hours});
    }else{
        res.render('login.ejs');
    }
})

app.post('/payment', async(req, res)=>{
    res.render('payment.ejs', {hour:hours});
})

app.get('/location', (req,res)=>{
    res.render('location.ejs');
})
app.get('/resetpass', (req,res)=>{
    if(loggedIn === true){
        res.render('resetpass.ejs');
    }else{
        res.render('login.ejs');
    }
})
app.get('/editprofile', (req,res)=>{
    if(loggedIn === true){
        res.render('editprofile.ejs');
    }else{
        res.render('login.ejs');
    }
})

app.get('/availability', (req,res)=>{
    res.render('availability.ejs', {data: availability});
})

app.post('/availability', async(req, res)=>{
    const data = req.body.id;
    const result = await db.query('select * from cycles where codes = $1', [data]);
    if(result.rows.length === 0){
        availability = 'Invalid code!'
    }else{
        availability = result.rows[0].availability;
    }
    res.render('availability.ejs', {data: availability});
})


app.get('/landing', (req,res)=>{
    res.render('landing.ejs');
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});