import express, { Router } from 'express';

// INITIALISE PRIMARY ROUTER
const router = Router();

// IMPORT ROUTERS FROM MODULES
const UsersRoute  		  = require('../../modules/users/routes.users');
const GamesRoute  		  = require('../../modules/games/routes.games');
const EventsRoute 		  = require('../../modules/events/routes.events');
const LocationsRoute 	  = require('../../modules/locations/routes.locations');
const ReviewsRoute 	      = require('../../modules/reviews/routes.reviews');
const IllustratorsRoute   = require('../../modules/illustrator/routes.illustrator');
const AuthorsRoute  	  = require('../../modules/author/routes.author');
const EditorsRoute  	  = require('../../modules/editor/routes.editor');
const DistributorsRoute   = require('../../modules/distributor/routes.distributor');


// USE ROUTING FROM OTHER COMPONENTS
router.use('/users',  	    UsersRoute);
router.use('/games',  	    GamesRoute);
router.use('/events', 	    EventsRoute);
router.use('/locations', 	LocationsRoute);
router.use('/reviews', 	    ReviewsRoute);
router.use('/illustrators', IllustratorsRoute);
router.use('/authors', 	    AuthorsRoute);
router.use('/editors', 	    EditorsRoute);
router.use('/distributors', DistributorsRoute);


module.exports = router;
