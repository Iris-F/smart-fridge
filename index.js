const dotenv = require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

dbUrl = process.env.DB_URL;

//require Model
const Product = require('./models/product');
//database connection
// dbUrl OR 'mongodb://localhost:27017/smartFridge'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true })); //For form data
app.use(express.json()); //For JSON Data
app.use(methodOverride('_method'))
//app.use(express.static(__dirname + '/public'));
//added the following line to send static files like css and js to the client
app.use("/public", express.static('./public/'));

const categories = ['fruit', 'vegetable', 'meat', 'seafood', 'bakery', 'beverages', 'dairy', 'frozen', 'other'];



app.get('/', (req, res) => {
    res.render('./home')
})

//routes for inventory items

//SHOW: show a list of all products
app.get('/products', async (req, res) => {
    const { category } = req.query;
    //if (category) {
    //   const products = await Product.find({ category })
    const products = await Product.find({})
    res.render('products/index', { products, categories, category })
    //   } else {
    //      const products = await Product.find({})
    //      res.render('products/index', { products, category: 'All' })
})


//NEW: show form for creating a new product

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})

//NEW: save the product in database with a POST method using an async function because this takes time
app.post('/products', async (req, res) => {
    try {
        const { expirydate, ...rest } = req.body; // Destructure expirydate from req.body
        const newProduct = new Product({
            ...rest,
            expirydate: expirydate ? new Date(expirydate) : null // Convert string to Date
        });
        await newProduct.save();
        console.log(req.body.expirydate);
        res.redirect('/products/');
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).send("An error occurred while saving the product.");
    }
});

//EDIT: show form for editing a product
app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories })
})

//EDIT: save changes to database
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect('/products/');
})

//DELETE: delete a product
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})


//routes for grocery list

//show grocery list

//show all products
app.get('/groceries', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('groceries/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('groceries/index', { products, category: 'All' })
    }
})

//show categories for adding a new shopping list item
app.get('/groceries/categories', (req, res) => {
    res.render('groceries/categories', { categories })
})

//show form for adding new items to shopping list

app.get('/groceries/new', async (req, res) => {
    const { category } = req.query;
    const products = await Product.find({ category })
    res.render('groceries/new', { products, category, categories })
})

//routes for users

//signup
app.get('/signup', (req, res) => {
    res.render('./users/signup')
})

//login
app.get('/login', (req, res) => {
    res.render('./users/login')
})


//event listener
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})