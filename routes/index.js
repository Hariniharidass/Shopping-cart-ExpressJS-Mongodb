var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var path = require('path');
var Cart = require("../models/cart");
var multer = require('multer');
var Product = require('../models/product');
var Order = require('../models/order');



const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, path.join(__dirname, '../public/images/uploads/'));
    },
    filename: function (req, file, cb)
    {


        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) =>
{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
// limit to 5 MB
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


/* GET home page. */
router.get('/', function (req, res, next)
{
    //eval(require('locus'));
    if (req.query.search) {
        var noMatch;
        const search = new RegExp(escapeRegex(req.query.search), 'gi');
        var successMessage = req.flash('success')[0];
        Product.find({ "title": search }).lean().then((docs, err) =>
        {
            if (err) {
                console.log(err);
            } else {
                if (docs.length < 1) {
                    noMatch = "No products match that query, Please try again!";
                }
                var productChunks = [];
                var chunkSize = 3;
                for (var i = 0; i < docs.length; i += chunkSize) {
                    productChunks.push(docs.slice(i, i + chunkSize));
                }
                res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMessage: successMessage, noMessages: !successMessage, noMatch: noMatch, notNoMatch: !noMatch });
            }
        });
    } else {

        var successMessage = req.flash('success')[0];
        var noMatch = req.flash('success')[0];
        Product.find().lean().then(docs =>
        {
            var productChunks = [];
            var chunkSize = 3;
            for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
            }
            res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMessage: successMessage, noMessages: !successMessage, notNoMatch: !noMatch });
        });
    }
});



router.get('/addproduct', isLoggedIn, function (req, res, next)
{
    //eval(require('locus'));

    res.render('shop/addproduct', {
        title: 'Add products'
    });
});



router.post('/addproduct', isLoggedIn, upload.single('imagePath'), function (req, res, next)
{
    // eval(require('locus'));
    if (!req.file) {
        var error = "Error : Fill all fields in form";

    } else {
        var successMessage = req.flash('success')[0];
        var newProd = new Product();
        var str = req.file.path;
        var value = str.split('/')[8];
        var value1 = str.split('/')[9];
        var value2 = str.split('/')[10];
        var path = '/' + value + '/' + value1 + '/' + value2;
        newProd.imagePath = path;
        newProd.title = req.body.title;
        newProd.description = req.body.description;
        newProd.price = req.body.price;

        newProd.save(function (err, newProd)
        {
            if (err) return console.error(err);
        });
        /* res.render('shop/addproduct', {
            title: 'Add products',
            successMessage: successMessage,
            noMessages: !successMessage
        }); */
    }
    if (error)
        res.render('shop/addproduct', { error: error });
    else
        res.redirect('/');
});


router.post('/update', isLoggedIn, upload.single('imagePath'), function (req, res, next)
{
    console.log("************************************************");
    //console.log("----starsts-------" + req.body + "----------ends----------");
    //eval(require('locus'));
    var id = mongoose.Types.ObjectId(req.body._id);
    console.log("aaaaaaaaaaa------   " + id + "      ---------");
    if (!req.body.title || !req.body.description || !req.body.price || !req.file) {
        console.log("title" + !req.body.title);
        if (!req.body.title) {
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.title = req.body.dtitle;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log("no change in title " + updatedproduct);
                });
            });
        } else {
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.title = req.body.title;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log(" change in title " + updatedproduct);
                });
            });
        }
        console.log("descrip " + !req.body.description)
        if (!req.body.description) {
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.description = req.body.ddescription;
                console.log(req.body.ddescription);
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log("no change in descr " + updatedproduct);
                });
            });
        } else {
            console.log("here")
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.description = req.body.description;
                console.log(req.body.description);
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log(" change in descr " + updatedproduct);
                });
            });
        }
        console.log("price " + !req.body.price)
        if (!req.body.price) {
            console.log(req.body.dprice)
            Product.findById(id, function (err, product)
            {
                console.log(req.body.dprice)
                if (err) return console.error(err);
                console.log("no change in price " + req.body.dprice);
                product.price = req.body.dprice;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log("no change in price " + updatedproduct);
                });
            });
        } else {
            console.log(" inside else price ")
            console.log(req.body.price)
            Product.findById(id, function (err, product)
            {
                console.log(" inside else price product find " + product)
                console.log(req.body.price)

                if (err) return console.error(err);
                console.log("no change in price " + req.body.price);
                product.price = req.body.price;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log(" change in price " + updatedproduct);
                });
            });
        }
        if (!req.file) {
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.imagePath = req.body.dimagePath;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log("no change in path " + updatedproduct);
                });
            });
        } else {
            var str = req.file.path;
            console.log(str);
            var value = str.split('/')[8];
            var value1 = str.split('/')[9];
            var value2 = str.split('/')[10];
            var path = '/' + value + '/' + value1 + '/' + value2;
            var imagePath = path;
            console.log(imagePath + "******************************");
            Product.findById(id, function (err, product)
            {
                if (err) return console.error(err);
                product.imagePath = imagePath;
                product.save(function (err, updatedproduct)
                {
                    if (err) return console.error(err);
                    console.log(" change in path " + updatedproduct);
                });
            });
        }
    } else if (req.body.title && req.body.description && req.body.price && req.file) {
        var newProd = {};
        var str = req.file.path;
        var value = str.split('/')[8];
        var value1 = str.split('/')[9];
        var value2 = str.split('/')[10];
        var path = '/' + value + '/' + value1 + '/' + value2;
        newProd.imagePath = path;
        console.log(path + "++++++++++++++++++++++++++++++++++");
        newProd.title = req.body.title;
        newProd.description = req.body.description;
        newProd.price = req.body.price;
        Product.findByIdAndUpdate(id, newProd, { upsert: true }, function (err, doc)
        {
            if (err) return console.error(err);
        });
    }
    res.redirect('/user/profile');

});

router.get('/updateproduct', isLoggedIn, function (req, res, next)
{

    Product.find().lean().then(docs =>
    {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/updateproduct', { title: 'Update Product', products: productChunks });
    });

});


router.post('/updateproduct', isLoggedIn, function (req, res, next)
{
    var id = req.body._id;
    console.log(id);
    Product.findById(id, function (err, docs)
    {
        if (err) return console.error(err);

        res.render('shop/update', { product: docs, title: 'Update' });
    });

});
router.get('/deleteproduct', isLoggedIn, function (req, res, next)
{

    Product.find().lean().then((docs, err) =>
    {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/deleteproduct', { title: 'Delete Product', products: productChunks });
    });

});

router.post('/deleteproduct', function (req, res, next)
{
    var id = req.body._id;

    Product.findByIdAndRemove(id).lean().then((err, docs) =>
    {
        if (err) return console.error(err);

        res.redirect('/user/profile');

    });
    res.redirect('/');
});

router.get('/reduce/:id', function (req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');

});

router.get('/increase/:id', function (req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.increaseByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');

});

router.get('/remove/:id', function (req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');

});

router.get('/add-to-cart/:id', function (req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    console.log("here add")
    Product.findById(productId, function (err, product)
    {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/shopping-cart', function (req, res, next)
{
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res, next)
{
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});
router.post('/checkout', isLoggedIn, function (req, res, next)
{
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: Math.floor(Math.random() * 100)
    });
    order.save(function (err, result)
    {
        req.flash('success', 'Successfully bought product!');
        req.session.cart = null;
        res.redirect('/');
    });
    /*var stripe = require("stripe")(
        "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100, // lowest currency dollar- cents
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function (err, charge)
    {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function (err, result)
        {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/');
        });
    });*/
});

module.exports = router;

function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/login');
}

function escapeRegex(text)
{
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};