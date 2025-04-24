var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { engine: expressHbs } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var app = express();

mongoose.connect('mongodb://localhost:27017/shopping')
    .then(() => {
        console.log("Connected correctly to server");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });

require('./config/passport');

// view engine
app.set('views', __dirname + '/views/');
app.set('view engine', '.hbs');
var hbs = require('handlebars');
hbs.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout', extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(require('handlebars'))
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
// middleware to check and return true/false based on authentication
// this result 'login' will be used in views
// these are global variable to access in views
app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRouter);
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;