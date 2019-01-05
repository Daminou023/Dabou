import express, { Router } from 'express';

const router = express.Router();
const LocationsController = require('./controller.locations');


// GET LIST OF EVENTS
router.route('/list')
	.get(LocationsController.listLocations)


router.route('/new')
	.post(LocationsController.createNewLocation);


router.route('/:locationsKey')
  .get(LocationsController.getLocation)
  .put(LocationsController.editLocation)
  .delete(LocationsController.deleteLocation);


module.exports = router;