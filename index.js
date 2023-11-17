import express from 'express';
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let loggedIn = false;
let user_data=[];
let name ='user';

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

app.get('/', (req,res)=>{
    res.render('home.ejs', {name:name});
})
app.get('/login', (req,res)=>{
    res.render('login.ejs');
})

app.post('/login', async(req, res)=>{
    const data = req.body;
    
    const result = await db.query('select * from customers where email = $1', [data.email]);
    if(result.rows[0].password !== data.password){
        console.log('mismatch');
        // how to handle mistmatches

    }
    loggedIn = true;

    user_data = result.rows[0];
    name = user_data.name;
    res.redirect('/');
});

app.get('/register', (req,res)=>{
    res.render('registercopy.ejs');
})

app.post('/register', async(req, res)=>{
    user_data = req.body;
    name = user_data.name;

    if(user_data.repeat_password !== user_data.password){
        console.log('Password mismatch');
    }
    loggedIn = true;
    await db.query('insert into customers (name, username, password, email) values ($1, $2, $3, $4)', 
    [user_data.name, user_data.username, user_data.password, user_data.email]);
    
    res.redirect('/');
});

app.get('/payment', (req,res)=>{
    res.render('payment.ejs');
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
    res.render('availability.ejs');
})


app.get('/landing', (req,res)=>{
    res.render('landing.ejs');
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
  