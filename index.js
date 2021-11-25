var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var path = require("path");

mongoose.connect("mongodb+srv://Karthik:Karthik123@back-posture-alert-clus.avsj5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
    extended: true,
    useUnifiedTopology: true,
})); 

app.use(express.static(path.join(__dirname + "/public")));
app.set('view engine', 'ejs');

// AUTHENTICATION SCHEMA
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", UserSchema);

// AUTHENTICATION PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "E-Cubicle is the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// LANDING ROUTE
app.get("/landing", isLoggedIn, function(req, res) {
    res.render('landing');
});

// AUTHENTICATION ROUTES
app.get("/", function(req, res) {
    res.render('signup');
});

app.post("/", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            alert("Invalid credentials");
            return res.render('signup');
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/landing");
        });
    })
});

app.get("/login", function(req, res) {
    res.render('login');
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/landing",
        failureRedirect: "/login"
    }), function(req, res) {
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// PORT
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('The server has started');
});