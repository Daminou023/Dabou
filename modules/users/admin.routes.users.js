import express, { Router } from 'express';

const router = express.Router();
const AdminUserController = require('./admin.controller.users');

router.route('/list')
	.get(AdminUserController.listUsers)


router.route('/:userKey')
	.get(AdminUserController.getUser)
	.put(AdminUserController.editUser)
	.delete(AdminUserController.deleteUser);

router.route('/new')
	.post(AdminUserController.createUser);

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