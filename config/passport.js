import passport from 'passport'
import User     from '../modules/users/model.user'

// Server.js will load this passport.js configuration file
// Which in turn will load it's strategies configuration file
const localStrategy = require('passport-local');

/**
 * Define how passport will handle user serailization.
 * - When user is authenticated, the user's ID is saved to the session.
 * - When user object is needed, passport uses to key to get it from the db
 */


 // When user is authenticated, the user's ID is saved to the session. 
passport.serializeUser(function(user, done) {
    done(null, user.key)
})

// When user object is needed, passport uses to key to get it from the db
passport.deserializeUser(function(key, done) {
    User.getByUseKey(key)
        .then(user => {
            done(null, user.outputValues)
        })
        .catch(err => done(err))
})

require('./strategies/local')