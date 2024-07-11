const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

require('dotenv').config();

const app = express();

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionConfig));

// Passport configuration
const strategy = new Auth0Strategy(
    {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
}
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Auth0 routes
app.get(
    '/login',
    passport.authenticate('auth0', {
        scope: 'openid email profile',
    }),
(req, res) => {
    res.redirect('/');
}
);

app.get('/callback', (req, res, next) => {
    passport.authenticate('auth0', (err, user, info) => {
    if (err) {
        return next(err);
    }
    if (!user) {
        return res.redirect('/login');
    }
    req.logIn(user, (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/dashboard');
    });
    })(req, res, next);
});

app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.send(`<h1>Hello, ${req.user.nickname}</h1>`);
});

app.get('/', (req, res) => {
    res.send('<h1>Home Page</h1>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
