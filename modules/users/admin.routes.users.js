import express, { Router } from 'express';

const router = express.Router();
const AdminUserController = require('./admin.controller.users');
const AdminFriendShipInvitationsController = require('./friendship/invitations/admin.controller.users.friendships.invitations')
const AdminFriendShipController = require('./friendship/friendships/admin.controller.users.frienships')

router.route('/list')
	.get(AdminUserController.listUsers)


router.route('/new')
	.post(AdminUserController.createUser);	

	
router.route('/:userKey')
	.get(AdminUserController.getUser)
	.put(AdminUserController.editUser)
	.delete(AdminUserController.deleteUser);


router.route('/:userKey/friendInvites')
	.get(AdminFriendShipInvitationsController.getInvitations)
	.post(AdminFriendShipInvitationsController.addFriendInvite)
	.delete(AdminFriendShipInvitationsController.deleteFriendRequest)
	.put(AdminFriendShipInvitationsController.acceptOrRefuseFriendRequest);
	

router.route('/:userKey/friends')
	.get(AdminFriendShipController.getFriends)
	.post(AdminFriendShipController.addFriend)
	.delete(AdminFriendShipController.deleteFriend);


router.route('/:userKey/activity')
	.get(AdminUserController.getUserActicity);


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