import express, { Router } from 'express';
import passport 		   from 'passport';

const adminAPI = require('./api')
const authAPI  = require('./auth')

// INITIALISE PRIMARY ROUTER
const router = Router();

// MIDDLEWARE GOES HERE: logging, authentication, etc..
router.use((req, res, next) => {
	if (req.session.lastVisit) console.log("last visit:", req.session.lastVisit);
	else console.log("new visit");
	req.session.lastVisit = new Date();
	next();
});

// MAIN PAGE ROUTING
router.use('/', authAPI)
router.use('/admin', isLoggedIn, adminAPI)

// DEFAULT 404 PAGE
router.use((req, res) => {
	res.status(404).send('404, page not found!');
})

// CONTINUE TO ROUTE IF USER IS LOGGED IN, AUTH ERROR
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) return next()
	return res.status(401).send({ success : false, message : 'authentication failed' });
}

export default router;