import express, { Router } from 'express';
import roleAuth from '../../config/strategies/roleAuth'

// import roleAuth from './auth'

// const auth = require('./auth')

// const roleAuth = require('./auth')
const router = express.Router();

const UserController 				  = require('./controller.users');
const FriendShipInvitationsController = require('./friendship/invitations/controller.users.friendships.invitations')
const FriendShipController 		      = require('./friendship/friendships/controller.users.frienships')
const UserEventsController 		   = require('./events/controller.users.events')
const UserGamesController  		   = require('./games/library/controller.users.games') 
const UserGameWishesController 	   = require('./games/wishes/controller.users.gameWishes')
const UserGameBorrowController 	   = require('./games/borrow/controller.users.games.borrow')


router.route('/list')
	.get(roleAuth(['user', 'admin']), UserController.listUsers)

router.route('/new')
	.post(roleAuth(['admin']),UserController.createUser);	

	
router.route('/:userKey')
	.get(roleAuth(['admin']), UserController.getUser)
	.put(roleAuth(['admin']), UserController.editUser)
	.delete(roleAuth(['admin']), UserController.deleteUser);

router.route('/username/:username')
	.get(roleAuth(['admin']), UserController.getByUsername)	

router.route('/:userKey/games')
	.get(roleAuth(['admin']), UserGamesController.listGames)
	.post(roleAuth(['admin']), UserGamesController.addGame)
	.delete(roleAuth(['admin']), UserGamesController.deleteGAme);	

router.route('/:userKey/games/reviews')
	.get(roleAuth(['admin']), UserGamesController.getUserReviews)

router.route('/:userKey/games/wishes')
	.get(roleAuth(['admin']), UserGameWishesController.listWishedGames)
	.post(roleAuth(['admin']), UserGameWishesController.addWishedGame)
	.delete(roleAuth(['admin']), UserGameWishesController.deleteWhisedGAme);	

router.route('/:userKey/games/borrow')	
	.post(roleAuth(['admin']), UserGameBorrowController.addBorrowedGame)
	.get(roleAuth(['admin']), UserGameBorrowController.listBorrowedGames)
	.put(roleAuth(['admin']), UserGameBorrowController.editBorrowedGame)
	.delete(roleAuth(['admin']), UserGameBorrowController.deleteEntry)

router.route('/:userKey/games/lend')	
	.get(roleAuth(['admin']), UserGameBorrowController.listLendedGames)

router.route('/:userKey/friendInvites')
	.get(roleAuth(['admin']), FriendShipInvitationsController.getInvitations)
	.post(roleAuth(['admin']), FriendShipInvitationsController.addFriendInvite)
	.delete(roleAuth(['admin']), FriendShipInvitationsController.deleteFriendRequest)
	.put(roleAuth(['admin']), FriendShipInvitationsController.acceptOrRefuseFriendRequest);


router.route('/:userKey/friends')
	.get(roleAuth(['admin']), FriendShipController.getFriends)
	.post(roleAuth(['admin']), FriendShipController.addFriend)
	.delete(roleAuth(['admin']), FriendShipController.deleteFriend);


router.route('/:userKey/friendsOfFriends')
	.get(roleAuth(['admin']), FriendShipController.getFriendsOfFriends)
	

router.route('/:userKey/organisedEvents')
	.get(roleAuth(['admin']), UserEventsController.getEventsOrganisedByUser)


router.route('/:userKey/participatedEvents')
	.get(roleAuth(['admin']), UserEventsController.getEventsParticipatedBuUser)	


module.exports = router;