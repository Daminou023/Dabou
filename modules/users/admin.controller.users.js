
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
				let user = record.get('user').properties;
				delete user.password;
				listOfUsers.push(user);
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
	let missingProperties = [];

	let newUser = {
		name 		: req.body.name,
		sirName 	: req.body.sirName,
		mail 		: req.body.mail,
		userName 	: req.body.userName,
		passWord 	: hashPassword(req.body.passWord),
		role 		: "user",
		key			: req.body.userName + randomstring.generate({ length: 10, charset: 'hex'})
	}	

	for (let property in newUser) {
		if (newUser[property] === undefined) {
			missingProperties.push(property)			
		}
	}

	if (missingProperties.length > 0) {
		let message = {
			'status': 400,
			'message': "sorry, missing properties on user to create",
			'missingProperties': missingProperties
		}
		res.send(message, 404);
		return
	}

	neoSession
			.run("MATCH (user:User)WHERE user.userName='" + newUser.userName +  "' RETURN user")
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

					.run(`CREATE (user:User {key: {key}, name:{name}, sirName:{sirName}, userName: {userName}, mail:{mail}, passWord: {passWord}, role: {role}}) RETURN user`,
					        {
					            key: newUser.key,
					            name: newUser.name,
					            sirName: newUser.sirName,
								userName: newUser.userName,
					            mail: newUser.mail,
					            passWord: newUser.passWord,
					            role: newUser.role	            
					        }
					   	)
			        	.then(results => {
							let createdUser = results.records[0].get('user').properties;
							delete createdUser.passWord;

			            	let message = {
			            		'status': 200,
			            		'message': 'user was added!',
			            		'user': createdUser
							}
							console.log(message.user);
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
	let userKey = req.params.userKey;
	let user = new User(req.body);
	let query = "MATCH (user:User)WHERE user.key='" + userKey + "'";

	for (let property in user) {
		if (user[property] === undefined) {
			delete user[property];
		}
		if (property = "passWord") {
			user[property] = hashPassword(user[property])
		}
		query += `SET user.${property} ='${user[property]}'`;
	}
	
	neoSession
	.run(
		query += "RETURN user"
	)
	.then(results => {
		let editedUser = results.records[0].get('user').properties;
		delete editedUser.password;
		let message = {
			'status': 200,
			'message': 'user was edited!',
			'user': editedUser
		}
		res.status(200).send(message);
		closeConnection()
	  })
	  .catch(function(err) {
		return next(err);
		closeConnection()
	})
}


// DELETE A USER

/*
* !! when deleting a user, or any node for that matter, do not forget to 
* delete all links to that node before you delete it! or neo4J will spit
* back at your face... yeah..
*/

exports.deleteUser = function(req, res, next) {
	let userKey = req.params.userKey;
	let query = `
		MATCH (user:User{ key: ${userKey} }) 
		DETACH
		DELETE user`;
	
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
