import Utils from '../utils/utils'
import User  from '../users/model.user'

// CONFIGURE NEO4J DRIVER
var randomstring = require("randomstring");
const neo4j 	 = require('neo4j-driver').v1;
var neoDriver 	 = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	 = neoDriver.session();
var Game 		 = require('./model.games');
var crypto 		 = require('crypto');
var ReturnGame   = require('./model.games')
var ReturnReview = require('../reviews/model.review')

// GET LIST OF ALL GAMES
exports.listGames = function(req, res, next) {
	let listOfGames = [];
	neoSession
		.run('MATCH (game:Game) RETURN game')
		.then(function(result){
			result.records.forEach(function(record){
				let game = new Game(record.get('game').properties);
				listOfGames.push(game.values);
			})
			res.json(listOfGames);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC GAME
exports.getGame = function(req, res, next) {
	let gameKey = req.params.gameKey;
	neoSession
		.run("MATCH (game:Game)WHERE game.key='" + gameKey +  "' RETURN game")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let game = result.records[0].get('game').properties;
				res.json(game);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW GAME
exports.createNewGame = function(req, res, next) {
    let newGame = new Game(req.body);
    if (newGame.error) {
		res.status(400).send(newGame.error);
		return
	}
	let key = req.body.name + randomstring.generate({ length: 10, charset: 'hex'})
	
	key = key.replace(/\s+/g, '')		// remove white space
	key = key.replace(/[^\w\s]/gi, '')	// remove special caracters

	newGame.values.key = key

	// TODO: Search 
	
	neoSession
			.run("MATCH (game:Game)WHERE game.name='" + newGame.values.name +  "' RETURN game")
			.then(results => {
    			if (results.records.length > 0) {
    				let message = {
							'status': 400,
							'message': "sorry, game already exists! try another game name or extension?"
						}
					res.status(400).send(message);
				}
				else {

					neoSession
					.run(
						`CREATE (game:Game {game}) RETURN game`, {game: newGame.values})
			        	.then(results => {
							let createdGame = results.records[0].get('game').properties;
			            	let message = {
			            		'status': 200,
			            		'message': 'game was added!',
			            		'game': createdGame
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


// EDIT INFORMATION ON A SINGLE GAME
exports.editGame = function(req, res, next) {
	
	let gameKey = req.params.gameKey;
	let game = new Game(req.body);
	
	game.values.key = req.params.gameKey;
	game.values.key = game.values.key.replace(/\s+/g, '')		// remove white space
	game.values.key = game.values.key.replace(/[^\w\s]/gi, '')	// remove special caracters

	if(game.error.unknownProperties) {
		res.status(400).send(game.error);
		return
	}

	let query = "MATCH (game:Game)WHERE game.key='" + gameKey + "'";
	for (let property in game.values) {
		query += `SET game.${property} ="${game.values[property]}"`;
	}
	query += "RETURN game"

	console.log(query)

	neoSession
		// .run("MATCH (game:Game)WHERE game.key='" + gameKey +  "' RETURN game")
		.run(`MATCH (game:Game)WHERE game.key= "${gameKey}" RETURN game`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedGame = new Game(results.records[0].get('game').properties);
						let message = {
							'status': 200,
							'message': 'game was edited!',
							'user': editedGame.values
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


// DELETE A Game
/*
* !! when deleting a game, or any node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteGame = function(req, res, next) {
	let gameKey = req.params.gameKey;
	let query = 'MATCH (game:Game{ key:"' + gameKey + '"}) DETACH DELETE game return game';
	
	neoSession
		.run(
			query
		)
		.then(results => {
			if (results.records.length <= 0) {
				handleNoResultsResponse(req, res)
				closeConnection();
			} else {
			let message = {
				'status': 200,
				'message': 'game was deleted!'
			}
			res.status(200).send(message);
			closeConnection();
		}
		})
		.catch(function(err) {
			return next(err);
			closeConnection();
		})
}

exports.getGameReviews = function(req, res, next) {
	let gameKey = req.params.gameKey;
	
	let gameReviewQuery = `MATCH (user:User)-[:Wrote]-(review:Review)-[:About]->(game:Game{key:"${gameKey}"}) 
						   RETURN game, review, user`
	
	neoSession
		.run(gameReviewQuery)
		.then(result => {

			let reviews = result.records.map(record => {
				let review = new ReturnReview(record.get('review').properties).values;
				let game = new ReturnGame(record.get('game').properties).values;
				let user = User.create(record.get('user').properties).outputValues;
				return { review, game, user }
			})

			console.log(reviews.map(rev => rev.review.stars))

			let mean = reviews
				.map(rev => rev.review.stars)
				.reduce((sum, toAdd) => parseInt(sum) + parseInt(toAdd))/reviews.length;

			res.status(200).send({reviews, mean});
			closeConnection();
		})
		.catch(function(err) {
			return next(err);
			closeConnection();
	})
}

exports.getGameExtensions = function(req, res, next) {
	let gameKey = req.params.gameKey

	console.log(gameKey)

	const extensionsQuery = `MATCH (extension:Game)-[:Extends]->(:Game{key:'${gameKey}'}) 
							 MATCH (game:Game{key:'${gameKey}'}) 
							 RETURN game, extension`;

	const extendedFromQuery = `MATCH (extended:Game)<-[:Extends]-(:Game{key:'${gameKey}'})
							   MATCH (game:Game{key:'${gameKey}'})
							   RETURN game, extended`;

	Promise
		.all([ neoSession.run(extensionsQuery), neoSession.run(extendedFromQuery)])
		.then(([extensionResults, extendedResults]) => {
			
			let returnResult = {
			 'game' : [...extensionResults.records, ...extendedResults.records].map(record => new ReturnGame(record.get('game').properties).values)[0],
			 'extensions' : extensionResults.records.map(record => new ReturnGame(record.get('extension').properties).values),
			 'extendedFrom' : extendedResults.records.map(record => new ReturnGame(record.get('extended').properties).values)
			}
			 res.json(returnResult)
			
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

exports.addGameExtension = function(req, res, next) {
	const originalGameKey  = req.params.gameKey;
	const extendingGameKey = req.body.extendingGameKey;
	
	// check if both keys were given.
	if (!extendingGameKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no user or game key was given');

	const addExtensionQuery = `MATCH (originalGame:Game{key:'${originalGameKey}'}) 
							   MATCH (extendingGame:Game{key:'${extendingGameKey}'}) 
							   WITH originalGame, extendingGame 
							   CREATE UNIQUE (extendingGame)-[:Extends]->(originalGame)
							   RETURN originalGame, extendingGame`

							   console.log(addExtensionQuery)
	
	neoSession
		.run(addExtensionQuery)
		.then(result => {
			if (result.records.length <= 0) {
				let message = {
					'status': 404,
					'message': 'Oops, game or extension was not found..',							
				}
				res.status(404).send(message);
			} else {
				let game = new ReturnGame(result.records[0].get('originalGame').properties).values;
				let extension  = new ReturnGame(result.records[0].get('extendingGame').properties).values;

				res.json({game, extension});
				closeConnection();
			}
		})
		.catch(function(err) {
			closeConnection();
			return next(err);
		})
}



exports.removeGameExtension = function(req, res, next) {
	const originalGameKey = req.params.gameKey;
	const extensionToRemoveKey = req.body.extendingGameKey;

    const removeExtensionQuery = `MATCH (originalGame:Game{key:'${originalGameKey}'}) 
							   	  MATCH (extendingGame:Game{key:'${extensionToRemoveKey}'}) 
							      MATCH (extendingGame)-[rel:Extends]->(originalGame) 
								  WITH originalGame, extendingGame, rel
								  DELETE rel
								  RETURN originalGame, extendingGame`
	
	neoSession
		.run(removeExtensionQuery)
		.then(result => {
			if (result.records.length <= 0) {
				let message = {
					'status': 404,
					'message': 'Oops, game or extension was not found..',							
				}
				res.status(404).send(message);
			} else {
				
				let game = new ReturnGame(result.records[0].get('originalGame').properties).values;
				let extension  = new ReturnGame(result.records[0].get('extendingGame').properties).values;
				
				res.json({
					message: 'relationship was deleted',
					game,
					extension
				})
			}
		})
		.catch(function(err) {
			closeConnection();
			return next(err);
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

// CLOSE CONNECTION AND DRIVER TO DB
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
