import User from '../../modules/users/model.user'

var LocalStrategy = require('passport-local').Strategy;
var passport      = require('passport')

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
}, function(req, email, password, done) {

    // Create and register wont fire unless data is sent back
    process.nextTick(function() {

        // Create the user instance and check for errors
        let newUser = User.create(req.body)
        if (newUser.error) {
            return done(null, false, {error: newUser.error});
        }

        // Try to register the new user
        newUser.register()
            .then(registeredUser => {
                return done(null, registeredUser);
            })
            .catch(err =>{
                return done(err);
            }) 
    });

}));

module.exports = passport