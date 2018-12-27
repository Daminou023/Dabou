import express, { Router } from 'express';

// INITIALISE PRIMARY ROUTER
const router = Router();

// IMPORT ROUTERS FROM MODULES
const adminUsersRoute  		  = require('../../../modules/users/admin.routes.users');
const adminGamesRoute  		  = require('../../../modules/games/admin.routes.games');
const adminEventsRoute 		  = require('../../../modules/events/admin.routes.events');
const adminLocationsRoute 	  = require('../../../modules/locations/admin.routes.locations');
const adminReviewsRoute 	  = require('../../../modules/reviews/admin.routes.reviews');
const adminIllustratorsRoute  = require('../../../modules/illustrator/admin.routes.illustrator');
const adminAuthorsRoute  	  = require('../../../modules/author/admin.routes.author');
const adminEditorsRoute  	  = require('../../../modules/editor/admin.routes.editor');
const adminDistributorsRoute  = require('../../../modules/distributor/admin.routes.distributor');


// USE ROUTING FROM OTHER COMPONENTS
router.use('/users',  	    adminUsersRoute);
router.use('/games',  	    adminGamesRoute);
router.use('/events', 	    adminEventsRoute);
router.use('/locations', 	adminLocationsRoute);
router.use('/reviews', 	    adminReviewsRoute);
router.use('/illustrators', adminIllustratorsRoute);
router.use('/authors', 	    adminAuthorsRoute);
router.use('/editors', 	    adminEditorsRoute);
router.use('/distributors', adminDistributorsRoute);

module.exports = router;
