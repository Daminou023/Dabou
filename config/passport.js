const passport = require('passport');
const localStrategy = require('passport-local');

import User from '../modules/users/model.user'

/*
passport.use(new localStrategy({
    usernameField: 'user[userName]',
    passwordField: 'user[password]'
    }, )
)*/


module.exports = function() {
    passport.serializeUser((user, done) => done(null, user.key))

    passport.deserializeUser((key, done) => {
        // find the user

        // 
    })
    require('./strategies/local.js')
}
    