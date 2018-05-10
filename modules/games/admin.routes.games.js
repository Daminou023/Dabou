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


module.exports = router;