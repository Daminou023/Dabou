var passport = require('passport');

module.exports = function() {
    passport.serializeUser((user, done) => done(null, user.key))

    passport.deserializeUser((key, done) => {
        // find the user

        // 
    })
    require('./strategies/local.js')
}
    