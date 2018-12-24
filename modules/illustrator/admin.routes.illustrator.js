import express, { Router } from 'express';

const router = express.Router();
const AdminIllustratorController = require('./admin.controller.illustrator');
const AdminIllustratorGamesController = require('./games/admin.controller.illustrator-games')


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminIllustratorController.listIllustrators)


router.route('/new')
	.post(AdminIllustratorController.createNewIllustrator);


router.route('/:illustratorKey')
    .get(AdminIllustratorController.getIllustrator)        
    .put(AdminIllustratorController.editIllustrator)       
    .delete(AdminIllustratorController.deleteIllustrator); 


router.route('/:illustratorKey/games')
  .get(AdminIllustratorGamesController.getIllustratorGames)      
  .post(AdminIllustratorGamesController.addIllustratorGames)     
  .delete(AdminIllustratorGamesController.removeIllustratorGames)

module.exports = router;