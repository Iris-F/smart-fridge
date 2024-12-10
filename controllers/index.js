const login = async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/products');
    }
    else {
        res.redirect('/login')
    }

}

module.exports = { login }