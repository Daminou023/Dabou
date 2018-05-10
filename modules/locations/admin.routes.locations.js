import express, { Router } from 'express';

const router = express.Router();
const AdminLocationsController = require('./admin.controller.locations');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminLocationsController.listLocations)


router.route('/new')
	.post(AdminLocationsController.createNewLocation);


router.route('/:locationsKey')
  .get(AdminLocationsController.getLocation)
  .put(AdminLocationsController.editLocation)
  .delete(AdminLocationsController.deleteLocation);


module.exports = router;