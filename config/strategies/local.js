import User from '../../modules/users/model.user'

var passport       = require('passport');
var LocalStrategy  = require('passport-local').Strategy;

// register the strategy using passport.use()
passport.use('local', new LocalStrategy( {passReqToCallback: true}, 
    function(req, username, password, done) {
        User.getByUsername(username)
            .then(user => {
                if (!user) return done(null, false, {message: 'Invalid username'})
                if (!user.authenticate(password)) return done(null, false,  {message: 'Invalid password'})
                return done(null, user);
            })
            .catch(err => {
                done(err);
            })
    })
)

module.exports = passport