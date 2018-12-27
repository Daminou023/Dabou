import Utils from '../../../utils/utils'
import User  from '../../model.user'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;

var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();

const ReturnGame   = require('../../../games/model.games');
const ReturnReview = require('../../../reviews/model.review')

// GET WISHED GAMES FROM A GIVEN PERSON
exports.listWishedGames = function(req, res, next) {
    const userKey = req.params.userKey

    const userGamesQuery = `MATCH (user:User{key:'${userKey}'})-[link:Wishes]->(game:Game) 
                            RETURN user, link, game`;

    let listOfGames = [];
	neoSession
		.run(userGamesQuery)
		.then(function(result){
			result.records.forEach(function(record){
				let game = new ReturnGame(record.get('game').properties);
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

exports.addWishedGame = function(req, res, next) {

    const userKey  = req.params.userKey
    const gameKeys = req.body.gameKeys

    if (!userKey || !gameKeys) return Utils.handleBadRequestResponse(req, res,'Sorry, no user or game key was given');

    const checkUserExistsQuery = `MATCH (user:User{key:'${userKey}'})
                                   RETURN user`;

    const checkGamesExistQuery = `MATCH (game:Games) 
                                  WHERE game.key IN [${gameKeys.map(key => `'${key}'`)}] 
                                  RETURN game`;


    const addGameToUserQuery = `MATCH (user:User{key:'${userKey}'}) 
                                MATCH (game:Game) WHERE game.key IN [${gameKeys.map(key => `'${key}'`)}]
                                AND NOT (user)-[:Wishes]->(game)
                                AND NOT (user)-[:HasInLibrary]->(game)
                                CREATE UNIQUE (user)-[link:Wishes]->(game) 
                                RETURN game, user`;

    neoSession
    .run(checkUserExistsQuery)
    .then(result => {
        if (result.records.length <= 0) {
            const msg = ('no user with this key found')
            Utils.handleNoResultsResponse(req, res, msg)
        } else {
            neoSession
            .run(checkGamesExistQuery)
            .then( results => {
                if (result.records.length < gameKeys.length) {
                    const unknownGames = gameKeys.filter(key => !result.records.map(record => record.get('game').properties.key).includes(key))
                    const msg = {
                        'userError': 'Sorry, game not found matching this key',
                        'unknown keys' : unknownGames
                    }
                    Utils.handleNoResultsResponse(req, res, msg)
                } else {
                    neoSession
                    .run(addGameToUserQuery)
                    .then(results => {
                        let games = results.records.map(record => new ReturnGame(record.get('game').properties).values)
                        let message = {
                            'message': 'games were added to user wishes',
                            'games': games 
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
            .catch(err => {
                return next(err);
                closeConnection();
            })
        }
    })
    .catch(err => {
        return next(err);
        closeConnection();
    })

}

exports.deleteWhisedGAme = function(req, res, next) {
    const userKey = req.params.userKey;
    const gameKeys = req.body.gameKeys

    if (!userKey || !gameKeys) return Utils.handleBadRequestResponse(req, res,'Sorry, no user or game key was given');

    const checkGamesExistsquery = `MATCH (game:Game) 
                                   WHERE game.key IN [${gameKeys.map(key => `'${key}'`)}] 
                                   RETURN game`;

    const deleteUserGameQuery = `MATCH (user:User{key:'${userKey}'})-[rel:Wishes]-(game:Game)
                                 WHERE game.key IN [${gameKeys.map(key => `'${key}'`)}]
                                 DELETE rel 
                                 RETURN user, game`

    console.log(deleteUserGameQuery)

        neoSession
        .run(checkGamesExistsquery)
        .then(result => {
            if (result.records.length < gameKeys.length) {
                const unknownGames = gameKeys.filter(key => !result.records.map(record => record.get('game').properties.key).includes(key))
                const msg = `Sorry, game was not found matching these keys: ${unknownGames}`
                Utils.handleUnknownInputResponse(req, res, msg)
            } else {
                neoSession
                    .run(deleteUserGameQuery)
                    .then(results => {
                        
                        let msg = '';
                        let user = results.records.map(record => User.create(record.get('user').properties).outputValues);
                        let deletedGames = results.records.map(record => new ReturnGame(record.get('game').properties).values);

                        let message = {
                            'user': user,
                            'deletedGames': deletedGames
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
        .catch( err => {
            return next(err);
            closeConnection()
        });
}



function closeConnection() {
	neoSession.close();
	neoDriver.close();
}