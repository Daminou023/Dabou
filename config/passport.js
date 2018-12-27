const passport      = require('passport');
const localStrategy = require('passport-local');

import User from '../modules/users/model.user'

passport.use(new localStrategy({
    usernameField: 'user[values][userName]',
    passwordField: 'user[values][password]'
    }, (username, password) => {
        User.getByUsername(username)
            .then(user => {
                if (!user || !user.authenticate(password)) {
                    return done(null, false, { errors: { 'username or password': 'is invalid' }})
                }

                return done(null, user);
            })
            .catch(done)
    } )
)
