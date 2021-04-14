var express = require('express');
var router = express.Router();

var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();

router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res, next)
{
    Order.find({ user: req.user }).lean().exec(function (err, orders)
    {
        if (err) {
            return res.write('error');
        }
        var cart;
        orders.forEach(function (order)
        {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        //  console.log(user_order)
        res.render('user/profile', { title: "User Profile", orders: orders, user: req.user.email });
    });

});
router.get('/logout', isLoggedIn, function (req, res, next)
{
    req.logout();
    res.redirect('/');
});

// group routes to check if user is not logged in
router.use('/', notLoggedIn, function (req, res, next)
{
    next();
});
// Adding csrf token for user sessions
router.get('/register', function (req, res, next)
{
    var messages = req.flash('error');
    res.render('user/register', { title: "User Registration", csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/register', passport.authenticate('local.register', {

    failureRedirect: '/user/register',
    failureFlash: true
}), function (req, res, next)
{
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);

    } else {
        res.redirect('/user/profile');
    }
});


router.get('/login', function (req, res, next)
{
    var messages = req.flash('error');
    res.render('user/login', { title: "User Login", csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});
router.post('/login', passport.authenticate('local.login', {

    failureRedirect: '/user/login',
    failureFlash: true
}), function (req, res, next)
{
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next)
{
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}