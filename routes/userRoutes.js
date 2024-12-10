const { Router } = require('express');
const User = require('../models/user');

const methodOverride = require('method-override')

const router = Router();

//SHOW: show signup page
router.get('/signup', (req, res) => {
    res.render('./users/signup')
})

// SIGN UP USER
router.post('/signup', async (req, res) => {
    const { password, username } = req.body;
    // const hash = await bcrypt.hash(password, 12);
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/products')
})

//SHOW: show login page
router.get('/login', (req, res) => {
    res.render('./users/login')
})

//LOGGING IN

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/products');
    }
    else {
        res.redirect('/login')
    }

})

// LOG OUT
router.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/')
})


//SHOW: show all users
router.get('/users', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    const { username } = User;
    const users = await User.find({})
    res.render('users/index', { users })

})

//DELETE: delete a user
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await User.findByIdAndDelete(id);
    res.redirect('/users');
})


module.exports = router;