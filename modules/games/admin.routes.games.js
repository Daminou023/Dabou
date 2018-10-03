import express, { Router } from 'express';

const router = express.Router();
const AdminGamesController = require('./admin.controller.games');


// GET LIST OF GAMES
router.route('/list')
	.get(AdminGamesController.listGames)


router.route('/new')
	.post(AdminGamesController.createNewGame);


router.route('/:gameKey')
  	.get(AdminGamesController.getGame)
  	.put(AdminGamesController.editGame)
  	.delete(AdminGamesController.deleteGame);

router.route('/:gameKey/extensions')
	.get(AdminGamesController.getGameExtensions) // get all the extensions of a game
	.post(AdminGamesController.addGameExtension)//
	.delete(AdminGamesController.removeGameExtension)//
	  
router.route('/:gameKey/reviews')
	.get(AdminGamesController.getGameReviews)

module.exports = router;

/*
GET: returns
- the games that extend this game
- the game this game extends

Post:
needs 
	- the key of the original game in the title
	- the key of the game extension (in params)
returns:
	- the original game
	- the extension

delete same as post
*/