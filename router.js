import express, { Router } from 'express';
import app from './server';


// INITIALISE PRIMARY ROUTER
const router = Router();


// MIDDLEWARE GOES HERE: logging, authentication, etc..
router.use((req, res, next) => {
	// module authentification
	console.log('middleware goes here');
	next();
});


// IMPORT ROUTERS FROM MODULES
const adminUsersRoute = require('./modules/users/admin.routes.users');
const adminGamesRoute = require('./modules/games/admin.routes.games');


// USE ROUTING FROM OTHER COMPONENTS
router.use('/admin/users', adminUsersRoute);
router.use('/admin/games', adminGamesRoute);


//  MAIN PAGE ROUTING
router.get('/', (req, res) => {
  res.send('Hello Dabou!')
});


// DEFAULT 404 PAGE
router.use((req, res) => {
	res.send('404, page not found!', 404);
})

export default router;