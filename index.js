import express from 'express';
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;


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
    res.render('home.ejs');
})
app.get('/login', (req,res)=>{
    res.render('login.ejs');
})

app.post('/login', async(req, res)=>{
    const data = req.body;
    
    const result = await db.query('select password from customers where email = $1', [data.email]);
    if(result.rows[0].password !== data.password){
        console.log('mismatch');
        // how to handle mistmatches



    }
    
    res.redirect('/login');
});

app.get('/register', (req,res)=>{
    res.render('registercopy.ejs');
})

app.post('/register', async(req, res)=>{
    const data = req.body;
    console.log(data);

    if(data.repeat_password !== data.password){
        console.log('Password mismatch');
    }
    await db.query('insert into customers (name, username, password, email) values ($1, $2, $3, $4)', 
    [data.name, data.username, data.password, data.email]);
    
    res.redirect('/register');
});

app.get('/payment', (req,res)=>{
    res.render('payment.ejs');
})

app.get('/location', (req,res)=>{
    res.render('location.ejs');
})
app.get('/resetpass', (req,res)=>{
    res.render('resetpass.ejs');
})
app.get('/editprofile', (req,res)=>{
    res.render('editprofile.ejs');
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
  