const dotenv = require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const userRoutes = require('./routes/userRoutes')

dbUrl = process.env.DB_URL;

//require Models
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
app.use(session({ secret: 'notagoodsecret', resave: true, saveUninitialized: true }))
//app.use(express.static(__dirname + '/public'));
//added the following line to send static files like css and js to the client
app.use("/public", express.static('./public/'));

const categories = ['fruit', 'vegetable', 'meat', 'seafood', 'bakery', 'beverages', 'dairy', 'frozen', 'other'];


app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.render('./home')
})

//PRODUCTS / INVENTORY ITEMS routes for inventory items

//SHOW: show a list of all inventory items
app.get('/products', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const { category } = Product;
    const products = await Product.find({})
    res.render('products/index', { products, categories, category })

})

//NEW: show form for adding an existing product to the inventory list

app.get('/products/addtolist', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const products = await Product.find({})
    res.render('products/addtolist', { products, categories })
})

//NEW: show form for creating a new product

app.get('/products/new', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const products = await Product.find({})
    res.render('products/new', { products, categories })
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
        console.log("Saving new product!");
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


//ADMIN page

//SHOW: show a list of all products in database
app.get('/products/admin', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const { category } = Product;
    const products = await Product.find({})
    res.render('products/admin', { products, categories, category })

})

//DELETE: delete a product (only available for admin)
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products/admin');
})



//routes for grocery list

//SHOW: show all available inventory items (=products)
app.get('/groceries', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const { category } = Product;
    const products = await Product.find({})
    res.render('groceries/index', { products, categories, category })
})

//SHOW: show categories for adding a new shopping list item
app.get('/groceries/categories', (req, res) => {
    res.render('groceries/categories', { categories })
})

//SHOW: show form for adding new items to shopping list

app.get('/groceries/new', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const { category } = req.query;
    const products = await Product.find({ category })
    res.render('groceries/new', { products, category, categories })
})




//SEARCH route

app.get('/products/search', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/users/login')
    }
    const { itemname } = req.query;
    if (!itemname) {
        return res.render('products/new', { categories });
    }
    try {
        const products = await Product.find({ $text: { $search: itemname } })
        res.render('products', { products, categories });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occured while searching for intenvtory items.")
    }
})






//event listener
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})