import express, { Router } from 'express';

const router = express.Router();
const DistributorController = require('./controller.distributor');
const DistributorGamesController = require('./games/controller.distributor-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(DistributorController.listDistributors)


router.route('/new')
	.post(DistributorController.createNewDistributor);


router.route('/:distributorKey')
  .get(DistributorController.getDistributor)        
  .put(DistributorController.editDistributor)       
  .delete(DistributorController.deleteDistributor); 


router.route('/:distributorKey/games')
  .get(DistributorGamesController.getDistributorGames)      
  .post(DistributorGamesController.addDistributorGames)     
  .delete(DistributorGamesController.removeDistributorGames)

module.exports = router;