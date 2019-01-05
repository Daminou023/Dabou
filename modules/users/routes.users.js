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
	.get(roleAuth(['user']), UserController.listUsers)

router.route('/new')
	.post(UserController.createUser);	

	
router.route('/:userKey')
	.get(UserController.getUser)
	.put(UserController.editUser)
	.delete(UserController.deleteUser);

router.route('/username/:username')
	.get(UserController.getByUsername)	

router.route('/:userKey/games')
	.get(UserGamesController.listGames)
	.post(UserGamesController.addGame)
	.delete(UserGamesController.deleteGAme);	

router.route('/:userKey/games/reviews')
	.get(UserGamesController.getUserReviews)

router.route('/:userKey/games/wishes')
	.get(UserGameWishesController.listWishedGames)
	.post(UserGameWishesController.addWishedGame)
	.delete(UserGameWishesController.deleteWhisedGAme);	

router.route('/:userKey/games/borrow')	
	.post(UserGameBorrowController.addBorrowedGame)
	.get(UserGameBorrowController.listBorrowedGames)
	.put(UserGameBorrowController.editBorrowedGame)
	.delete(UserGameBorrowController.deleteEntry)

router.route('/:userKey/games/lend')	
	.get(UserGameBorrowController.listLendedGames)

router.route('/:userKey/friendInvites')
	.get(FriendShipInvitationsController.getInvitations)
	.post(FriendShipInvitationsController.addFriendInvite)
	.delete(FriendShipInvitationsController.deleteFriendRequest)
	.put(FriendShipInvitationsController.acceptOrRefuseFriendRequest);


router.route('/:userKey/friends')
	.get(FriendShipController.getFriends)
	.post(FriendShipController.addFriend)
	.delete(FriendShipController.deleteFriend);


router.route('/:userKey/friendsOfFriends')
	.get(FriendShipController.getFriendsOfFriends)
	

router.route('/:userKey/organisedEvents')
	.get(UserEventsController.getEventsOrganisedByUser)


router.route('/:userKey/participatedEvents')
	.get(UserEventsController.getEventsParticipatedBuUser)	


router.get('/advanced', authorize, listUsers);


function authorize(req, res, next) {
	if (true) {
		next()
	}
	else {
		res.send('forbiden', 403)
	}
}


function listUsers(req, res) {
	res.send("Holly shit it works");
}






module.exports = router;