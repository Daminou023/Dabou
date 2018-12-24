import express, { Router } from 'express';
// import app from './server';


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
	
	// console.log('middleware goes here');
	next();
});


// IMPORT ROUTERS FROM MODULES
const adminUsersRoute  		  = require('../modules/users/admin.routes.users');
const adminGamesRoute  		  = require('../modules/games/admin.routes.games');
const adminEventsRoute 		  = require('../modules/events/admin.routes.events');
const adminLocationsRoute 	  = require('../modules/locations/admin.routes.locations');
const adminReviewsRoute 	  = require('../modules/reviews/admin.routes.reviews');
const adminIllustratorsRoute  = require('../modules/illustrator/admin.routes.illustrator');
const adminAuthorsRoute  	  = require('../modules/author/admin.routes.author');
const adminEditorsRoute  	  = require('../modules/editor/admin.routes.editor');


// USE ROUTING FROM OTHER COMPONENTS
router.use('/admin/users',  	  adminUsersRoute);
router.use('/admin/games',  	  adminGamesRoute);
router.use('/admin/events', 	  adminEventsRoute);
router.use('/admin/locations', 	  adminLocationsRoute);
router.use('/admin/reviews', 	  adminReviewsRoute);
router.use('/admin/illustrators', adminIllustratorsRoute);
router.use('/admin/authors', 	  adminAuthorsRoute);
router.use('/admin/editors', 	  adminEditorsRoute);


//  MAIN PAGE ROUTING
router.get('/', (req, res) => {
  res.send('Hello Dabou!')
});


// DEFAULT 404 PAGE
router.use((req, res) => {
	res.send('404, page not found!', 404);
})

export default router;