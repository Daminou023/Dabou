import express, { Router } from 'express';

// INITIALISE PRIMARY ROUTER
const router = Router();


// MIDDLEWARE GOES HERE: logging, authentication, etc..
router.use((req, res, next) => {

	if (req.session.lastVisit) {
		console.log("last visit:", req.session.lastVisit);
	}
	else {
		console.log("new visit");
	}
	req.session.lastVisit = new Date();
	
	// middleware goes here
	console.log('middleware');
	next();
});

// MAIN PAGE ROUTING
router.get('/', (req, res) => {
	res.send('Hello Dabou!')
  });

router.use('/admin/', require('./api/admin'))

// DEFAULT 404 PAGE
router.use((req, res) => {
	res.send('404, page not found!', 404);
})

export default router;