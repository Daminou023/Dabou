import express, { Router } from 'express';
import passport 		       from 'passport';

// INITIALISE PRIMARY ROUTER
const router = Router();

// LOGIN 
router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
	  if (err) return next(err); // will generate a 500 error

	  // Generate a JSON response reflecting authentication status
	  if (!user) return res.status(401).send({ success : false, message : 'authentication failed: ' + info.message });

	  // Login the user if authentication passed
	  req.login(user, function(err){ //login is provided by passport
      if(err) return next(err);
      return res.send({ success : true, message : 'authentication succeeded' });        
	  });

	})(req, res, next);
});

// LOGOUT OF SESSION
router.use('/logout', (req, res) => {
	req.logout();	// logout is provided by passport
	res.status(200).send({success: true, message:'user was logged out'})
})

// SIGNUP
router.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
	    if (err)   {
        return next(err)
			} 
			
      if (!user) return res.status(401).send({ success : false, error: info.error });
      
      // Login the user if authentication passed
	    req.login(user, function(err){ //login is provided by passport
        if(err) return next(err);
        return res.send({ success : true, message : 'authentication succeeded, new user is logged in' });        
	    });
    })(req, res, next);
})


module.exports = router