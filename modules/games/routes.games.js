import express, { Router } from 'express';

const router = express.Router();
const GamesController = require('./controller.games');


// GET LIST OF GAMES
router.route('/list')
	.get(GamesController.listGames)


router.route('/new')
	.post(GamesController.createNewGame);


router.route('/:gameKey')
  	.get(GamesController.getGame)
  	.put(GamesController.editGame)
  	.delete(GamesController.deleteGame);

router.route('/:gameKey/extensions')
	.get(GamesController.getGameExtensions) // get all the extensions of a game
	.post(GamesController.addGameExtension)//
	.delete(GamesController.removeGameExtension)//
	  
router.route('/:gameKey/reviews')
	.get(GamesController.getGameReviews)

module.exports = router;
