import express, { Router } from 'express';

const router = express.Router();
const IllustratorController = require('./controller.illustrator');
const IllustratorGamesController = require('./games/controller.illustrator-games')


// GET LIST OF EVENTS
router.route('/list')
	.get(IllustratorController.listIllustrators)


router.route('/new')
	.post(IllustratorController.createNewIllustrator);


router.route('/:illustratorKey')
    .get(IllustratorController.getIllustrator)        
    .put(IllustratorController.editIllustrator)       
    .delete(IllustratorController.deleteIllustrator); 


router.route('/:illustratorKey/games')
  .get(IllustratorGamesController.getIllustratorGames)      
  .post(IllustratorGamesController.addIllustratorGames)     
  .delete(IllustratorGamesController.removeIllustratorGames)

module.exports = router;