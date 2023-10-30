import express from 'express';

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get('/', (req,res)=>{
    res.render('home.ejs');
})
app.get('/login', (req,res)=>{
    res.render('login.ejs');
})
app.get('/payment', (req,res)=>{
    res.render('payment.ejs');
})
app.get('/register', (req,res)=>{
    res.render('registercopy.ejs');
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
  