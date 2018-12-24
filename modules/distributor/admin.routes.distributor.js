import express, { Router } from 'express';

const router = express.Router();
const AdminDistributorController = require('./admin.controller.distributor');
const AdminDistributorGamesController = require('./games/admin.controller.distributor-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminDistributorController.listDistributors)


router.route('/new')
	.post(AdminDistributorController.createNewDistributor);


router.route('/:distributorKey')
  .get(AdminDistributorController.getDistributor)        
  .put(AdminDistributorController.editDistributor)       
  .delete(AdminDistributorController.deleteDistributor); 


router.route('/:distributorKey/games')
  .get(AdminDistributorGamesController.getDistributorGames)      
  .post(AdminDistributorGamesController.addDistributorGames)     
  .delete(AdminDistributorGamesController.removeDistributorGames)

module.exports = router;