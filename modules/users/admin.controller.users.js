
// CONFIGURE NEO4J DRIVER
var randomstring = require("randomstring");
const neo4j 	 = require('neo4j-driver').v1;
var neoDriver 	 = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	 = neoDriver.session();
var User 		 = require('./model.users');
var crypto 		 = require('crypto');


// GET LIST OF ALL USERS
exports.listUsers = function(req, res, next) {
	let listOfUsers = [];
	neoSession
		.run('MATCH (user:User) RETURN user')
		.then(function(result){
			result.records.forEach(function(record){
				let user = new User(record.get('user').properties);
				delete user.values.passWord;
				listOfUsers.push(user.values);
			})
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
	neoSession
		.run("MATCH (user:User)WHERE user.key='" + userKey +  "' RETURN user")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let user = result.records[0].get('user').properties;
				delete user.passWord;
				res.json(user);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// CREATE A NEW USER
exports.createUser = function(req, res, next) {

	let newUser = new User(req.body)
	
	if (newUser.error) {
		res.status(400).send(newUser.error);
		return
	}
	
	newUser.values.role = "user"
	newUser.values.passWord = hashPassword(req.body.passWord);
	newUser.values.key = req.body.userName + randomstring.generate({ length: 10, charset: 'hex'})

	neoSession
			.run("MATCH (user:User)WHERE user.userName='" + newUser.values.userName +  "' RETURN user")
			.then(results => {
    			if (results.records.length > 0) {
    				let message = {
							'status': 400,
							'message': "sorry, userName is already taken!"
						}
					res.status(400).send(message);
				}
				else {

					neoSession
					.run(
						`CREATE (user:User {user}) RETURN user`, {user: newUser.values})
			        	.then(results => {
							let createdUser = results.records[0].get('user').properties;
							delete createdUser.passWord;

			            	let message = {
			            		'status': 200,
			            		'message': 'user was added!',
			            		'user': createdUser
							}
							res.status(200).send(message);
							closeConnection()
			          	})
			          	.catch(function(err) {
							return next(err);
							closeConnection()
						})
			    }
      		})
      		.catch(function(err) {
				return next(err);
				closeConnection();
			});
}


// EDIT INFORMATION ON A SINGLE USER
exports.editUser = function(req, res, next) {
	
	let user = new User(req.body);
	user.values.key = req.params.userKey;

	if(user.error.unknownProperties) {
		res.status(400).send(user.error);
		return
	}

	let query = "MATCH (user:User)WHERE user.key='" + user.values.key + "'";
	for (let property in user.values) {
		if (property == "passWord") {
			user.values[property] = hashPassword(user.values[property])
		}
		query += `SET user.${property} ="${user.values[property]}"`;
	}
	query += "RETURN user"

	console.log(query)

	neoSession
		.run("MATCH (user:User)WHERE user.key='" + user.values.key +  "' RETURN user")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedUser = new User(results.records[0].get('user').properties);
						delete editedUser.password;
						let message = {
							'status': 200,
							'message': 'user was edited!',
							'user': editedUser.values
						}
						res.status(200).send(message);
						closeConnection()
					})
					.catch(function(err) {
						return next(err);
						closeConnection()
					})
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
	});
}


// DELETE A USER
/*
* !! when deleting a user, or any node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteUser = function(req, res, next) {
	let userKey = req.params.userKey;
	let query = 'MATCH (user:User{ key:"' + userKey + '"}) DETACH DELETE user';
	
	neoSession
		.run(
			query
		)
		.then(results => {
			let message = {
				'status': 200,
				'message': 'user was deleted!'
			}
			res.status(200).send(message);
			closeConnection();
		})
		.catch(function(err) {
			return next(err);
			closeConnection();
		})
}


// HANDLE 404 RESULT ERRORS
function handleNoResultsResponse(req, res) {
	let message = {
		'status': 404,
		'message': "sorry, nothing found!"
	}
	res.send(message, 404);
}

// CRYPTOGRAPHY: HASH PASSWORD USING THE USERNAME AND PASSWORD
function hashPassword(password) {
	if(password){
		var s = 'milcampsSalt:' + password;
		return crypto.createHash('sha256').update(s).digest('hex');
	}
	return undefined;
}


// CLOSE CONNECTION AND DRIVER TO DB
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
