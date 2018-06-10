import express, { Router } from 'express';

const router = express.Router();
const AdminEventsController = require('./admin.controller.events');
const AdminEventsCreatorController = require('./creator/admin.controller.events.creator')
const AdminEventsInvitationsController = require('./invitations/admin.controller.events.invitations')
const AdminEventsDemandsController = require('./demands/admin.controller.events.demands')
const AdminEventsLocationController = require('./location/admin.controller.events.location')
const AdminEventsParticipatnsController = require('./participants/admin.controller.events.participants')


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminEventsController.listEvents)  // ok


router.route('/new')
	.post(AdminEventsController.createNewEvent); // ok


router.route('/:eventKey')
  .get(AdminEventsController.getEvent)        // ok
  .put(AdminEventsController.editEvent)       // ok
  .delete(AdminEventsController.deleteEvent); // ok


router.route('/:eventKey/all')
  .get(AdminEventsController.getAll)


router.route('/:eventKey/creator')
  .get(AdminEventsCreatorController.getCreator)     // ok
  .put(AdminEventsCreatorController.changeCreator)  // ok


router.route('/:eventKey/invitations')
  .get(AdminEventsInvitationsController.getInvitations)             // ok
  .post(AdminEventsInvitationsController.addInvitations)            // ok
  .delete(AdminEventsInvitationsController.deleteInvitations)       // ok
  .put(AdminEventsInvitationsController.editInvitations)            // todo


router.route('/:eventKey/demands')
  .get(AdminEventsDemandsController.getDemands)
  .put(AdminEventsDemandsController.changeDemands)
  .delete(AdminEventsDemandsController.deleteDemands)


router.route('/:eventKey/location')
  .get(AdminEventsLocationController.getLocation)
  .put(AdminEventsLocationController.changeLocation)


router.route('/:eventKey/participants')
  .get(AdminEventsParticipatnsController.getParticipants)
  .put(AdminEventsParticipatnsController.changeParticipant)
  .delete(AdminEventsParticipatnsController.deleteParticipants)



module.exports = router;