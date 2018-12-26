var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

module.exports = function() {
    passport.use(new LocalStrategy((username, password, done) => {
        // Find the user by his username

        // If no user

        // if the password is incorrect

        // return done(null, user)
        })
    )
}