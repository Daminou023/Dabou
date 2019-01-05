import express, { Router } from 'express';

const router = express.Router();
const EventsController = require('./controller.events');
const EventsCreatorController = require('./creator/controller.events.creator')
const EventsInvitationsController = require('./invitations/controller.events.invitations')
const EventsDemandsController = require('./demands/controller.events.demands')
const EventsParticipatnsController = require('./participants/controller.events.participants')
const EventsGamesController = require('./games/controller.event-games')


// GET LIST OF EVENTS
router.route('/list')
	.get(EventsController.listEvents)  // ok


router.route('/new')
	.post(EventsController.createNewEvent); // ok


router.route('/:eventKey')
  .get(EventsController.getEvent)        // ok
  .put(EventsController.editEvent)       // ok
  .delete(EventsController.deleteEvent); // ok


router.route('/:eventKey/games')
  .get(EventsGamesController.getEventGames)        // ok
  .post(EventsGamesController.addEventGames)       // ok
  .delete(EventsGamesController.removeEventGames)  // ok

router.route('/:eventKey/creator')
  .get(EventsCreatorController.getCreator)     // ok
  .put(EventsCreatorController.changeCreator)  // ok


router.route('/:eventKey/invitations')
  .get(EventsInvitationsController.getInvitations)             // ok
  .post(EventsInvitationsController.addInvitations)            // ok
  .delete(EventsInvitationsController.deleteInvitations)       // ok
  .put(EventsInvitationsController.editInvitations)            // ok


router.route('/:eventKey/demands')
  .get(EventsDemandsController.getDemands)                    // ok
  .post(EventsDemandsController.addDemands)                   // ok 
  .put(EventsDemandsController.editDemands)                   // ok
  .delete(EventsDemandsController.deleteDemands)              // ToDo: idealy, deletion should be agnostic of invitations or demands


router.route('/:eventKey/participants')
  .get(EventsParticipatnsController.getParticipants)
  .put(EventsParticipatnsController.changeParticipant)
  .delete(EventsParticipatnsController.deleteParticipants)



module.exports = router;