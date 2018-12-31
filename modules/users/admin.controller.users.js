import User  	from './model.user'
import Utils 	from '../utils/utils'
import passport from 'passport'

// CONFIGURE NEO4J DRIVER
const randomstring 	= require("randomstring");
const neo4j 	 	= require('neo4j-driver').v1;
const neoDriver 	= neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
const neoSession 	= neoDriver.session();
const crypto 		= require('crypto');


// GET LIST OF ALL USERS
exports.listUsers = function(req, res, next) {
	neoSession
		.run('MATCH (user:User) RETURN user')
		.then(function(result){
			const listOfUsers = result.records.map( record => {
				return User.create(record.get('user').properties).outputValues
			});
			res.json(listOfUsers);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET INFORMATION ON A SINGLE USER
exports.getUser = function(req, res, next) {
	let userKey = req.params.userKey;
	User.getByUserKey(userKey)
		.then(user => {
			if (user) res.json(user.outputValues)
			else Utils.handleNoResultsResponse(req, res, "no user with this key was found")
		})
		.catch(err => {
			return next(err);
			closeConnection()
		})
}

// GET USER BY username
exports.getByUsername = function(req, res, next) {
	let username = req.params.username;
	User.getByUsername(username)
		.then(user => {
			if (user) res.json(user.outputValues)
			else Utils.handleNoResultsResponse(req, res, "no user with this username was found")
		})
		.catch(err => {
			return next(err);
			closeConnection()
		})
}

// CREATE A NEW USER
exports.createUser = function(req, res, next) {

	let newUser = User.create(req.body)
	if (newUser.error) {
		res.status(400).send(newUser.error);
		return
	} else {
		newUser.register()
			.then(user => {
				res.status(200).send({
					message:'user was created',
					newUser: user
				})
			})
			.catch(err =>{
				return next(err)
				closeConnection()
			}) 
	}
}


// EDIT INFORMATION ON A SINGLE USER
exports.editUser = function(req, res, next) {
	const userKey = req.params.userKey;
	User.editUser(userKey, req.body)
		.then(user => {
			res.status(200).send({
				message: 'user was edited',
				editedUser: user
			}) 
		})
		.catch(err => {
			return next(err);
			closeConnection()
		})
}

// DELETE A USER BY HIS ID
exports.deleteUser = function(req, res, next) {
	const userKey = req.params.userKey;
	User.deleteUser(userKey)
		.then(user => {
			if (user) {
				res.status(200).send({
					message: 'user was deleted',
					deletedUser: user
				})
			} else Utils.handleNoResultsResponse(req, res, 'no user was found for this key')
		})
		.catch(err => {
			return next(err);
			closeConnection()
		})
}

// SIGNUP A NEW USER
exports.signup = function(req, res, next) {
	if(!req.user) {
		let newUser = User.create(req.body)
		if (newUser.error) {
			res.status(400).send(newUser.error);
			return
		} else {
			newUser.register( res, user => {
				// req.login() is exposed by the passport module. 
				// Used to establish a successful login session
				// After login operation is completed, a user object is signed to req.user Object
				req.login(user, (err) => {
					if (err) {
						return next(err)
					}
				})
				res.status(200).send({
					message:'user was created',
					newUser: user
				})
			}, err => {
				return next(err);
				closeConnection()
			})
		}
	} else {
		return res.redirect('/')
	}
}

// SIGN OUT THE USER
exports.signout = function(req, res) {
	// req.logout() is provided by the Passport module and invalidates the authenticated session
	req.logout();
	res.redirect('/')
}

// CLOSE CONNECTION AND DRIVER TO DB
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
