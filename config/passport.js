var User          = require('../modules/users/model.user')
var LocalStrategy = require('passport-local').Strategy;
var passport      = require('passport') 

// Server.js will load this passport.js configuration file
// Which in turn will load it's strategies configuration file

/**
 * Define how passport will handle user serailization.
 * - When user is authenticated, the user's ID is saved to the session.
 * - When user object is needed, passport uses to key to get it from the db
 */

 module.exports = function() {

     // When user is authenticated, the user's ID is saved to the session. 
    passport.serializeUser(function(user, done) {
        done(null, user.values.key)
    })

    // When user object is needed, passport uses to key to get it from the db
    passport.deserializeUser(function(key, done) {
        User.getByUserKey(key)
            .then(user => {
                done(null, user)
            })
            .catch(err => done(err))
    })
    
    require('./strategies/signup')
    require('./strategies/local')
}
