import express, { Router } from 'express';

const router = express.Router();
const AdminEventsController = require('./admin.controller.events');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminEventsController.listEvents)


router.route('/new')
	.post(AdminEventsController.createNewEvent);


router.route('/:eventKey')
  .get(AdminEventsController.getEvent)
  .put(AdminEventsController.editEvent)
  .delete(AdminEventsController.deleteEvent);


module.exports = router;