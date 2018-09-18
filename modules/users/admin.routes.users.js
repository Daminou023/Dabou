import express, { Router } from 'express';

const router = express.Router();
const AdminUserController = require('./admin.controller.users');
const AdminFriendShipInvitationsController = require('./friendship/invitations/admin.controller.users.friendships.invitations')
const AdminFriendShipController = require('./friendship/friendships/admin.controller.users.frienships')
const AdminUserEventsController = require('./events/admin.controller.users.events')
const AdminUserGamesController  = require('./games/library/admin.controller.users.games') 
const AdminUserGameWishesController = require('./games/wishes/admin.controller.users.gameWishes')

router.route('/list')
	.get(AdminUserController.listUsers)


router.route('/new')
	.post(AdminUserController.createUser);	

	
router.route('/:userKey')
	.get(AdminUserController.getUser)
	.put(AdminUserController.editUser)
	.delete(AdminUserController.deleteUser);


router.route('/:userKey/games')
	.get(AdminUserGamesController.listGames)
	.post(AdminUserGamesController.addGame)
	.delete(AdminUserGamesController.deleteGAme);	


router.route('/:userKey/games/reviews')
	.get(AdminUserGamesController.getUserReviews)

router.route('/:userKey/wishes')
	.get(AdminUserGameWishesController.listWishedGames)
	.post(AdminUserGameWishesController.addWishedGame)
	.delete(AdminUserGameWishesController.deleteWhisedGAme);	


router.route('/:userKey/friendInvites')
	.get(AdminFriendShipInvitationsController.getInvitations)
	.post(AdminFriendShipInvitationsController.addFriendInvite)
	.delete(AdminFriendShipInvitationsController.deleteFriendRequest)
	.put(AdminFriendShipInvitationsController.acceptOrRefuseFriendRequest);


router.route('/:userKey/friends')
	.get(AdminFriendShipController.getFriends)
	.post(AdminFriendShipController.addFriend)
	.delete(AdminFriendShipController.deleteFriend);


router.route('/:userKey/friendsOfFriends')
	.get(AdminFriendShipController.getFriendsOfFriends)


router.route('/:userKey/activity')
	.get(AdminUserController.getUserActicity);


router.route('/:userKey/organisedEvents')
	.get(AdminUserEventsController.getEventsOrganisedByUser)


router.route('/:userKey/participatedEvents')
	.get(AdminUserEventsController.getEventsParticipatedBuUser)	


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