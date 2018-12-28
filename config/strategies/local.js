var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

module.exports = function() {
    // register the strategy using passport.use()
    passport.use(new localStrategy( (username, password, done) => {
        User.getByUsername(username)
            .then(user => {
                if (!user) return done(null, false, {message: 'unknown user'})
                if (!user.authenticate(password)) return done(null, false,  {message: 'Invalid Password'})
                return done(null, user);
            })
            .catch(err => done(err))
        })
    )
}

