import Utils from '../../../utils/utils'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;

var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();

const ReturnGame   = require('../../../games/model.games');
const ReturnUser   = require('../../../users/model.users.out')


// GET GAMES FROM A GIVEN PERSON
exports.listBorrowedGames = function(req, res, next) {
    const userKey = req.params.userKey

    const userGamesQuery = ` MATCH (game:Game)
                             MATCH (user:User{key:'${userKey}'})-[link:borrowedFrom {gameKey: game.key}]->(lender:User) 
                             RETURN user, link, lender, game`;

	neoSession
		.run(userGamesQuery)
		.then(function(result){
            let games   = result.records.map(record => new ReturnGame(record.get('game').properties).values)
            let leases = result.records.map(record => ({
                lease:  record.get('link').properties,
                game:   games.filter(game => game.key === record.get('link').properties.gameKey)[0],
                lender: new ReturnUser(record.get('lender').properties).values
            }))
			res.json(leases);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET GAMES FROM A GIVEN PERSON
exports.listLendedGames = function(req, res, next) {
    const userKey = req.params.userKey

    const userGamesQuery = ` MATCH (game:Game)
                             MATCH (user:User{key:'${userKey}'})<-[link:borrowedFrom {gameKey: game.key}]-(borrower:User) 
                             RETURN user, link, borrower, game`;

	neoSession
		.run(userGamesQuery)
		.then(function(result){
            let games   = result.records.map(record => new ReturnGame(record.get('game').properties).values)
            let leases = result.records.map(record => ({
                lease:  record.get('link').properties,
                game:   games.filter(game => game.key === record.get('link').properties.gameKey)[0],
                borrower: new ReturnUser(record.get('borrower').properties).values
            }))
			res.json(leases);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// ADD GAME TO THE LIST OF THE USERS GAMES
exports.addBorrowedGame = function(req, res, next) {
    const userKey       = req.params.userKey
    const lenderUserKey = req.body.lenderUserKey
    const gameKey       = req.body.gameKey
    const userKeys      = [userKey, lenderUserKey]

    if (!userKey || !lenderUserKey || !gameKey) return Utils.handleBadRequestResponse(req, res,'Sorry, lenderUserKey and gameKey are needed');

    const checkUsersExistQuery = `MATCH (user:User)
                                  WHERE user.key IN [${userKeys.map(key => `'${key}'`)}]
                                  return user` 

    const checkGamesExistQuery = `MATCH (game:Game{key:'${gameKey}'})
                                  RETURN game`;          

    const addBorrowedGameToUserQuery = `MATCH (user:User{key:'${userKey}'}) 
                                        MATCH (lender:User{key:'${lenderUserKey}'})
                                        MATCH (game:Game) WHERE game.key = '${gameKey}'
                                        AND NOT (user)-[:borrowedFrom{gameKey: '${gameKey}', returned: false}]->(lender)
                                        WITH user, lender, game 
                                        CREATE UNIQUE (user)-[link:borrowedFrom{
                                            gameKey: '${gameKey}',
                                            since:'${new Date()}',
                                            until: '',
                                            returned: false
                                        }]->(lender) 
                                        RETURN link, game, lender, user`;

    neoSession
    .run(checkUsersExistQuery)
    .then(result => {
        const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
        if (unknownUsers.length > 0) {
            const returnObj = {
                message: "oops, user or lender was not found.",
                unknownUsers: unknownUsers
            }
            Utils.handleNoResultsResponse(req, res, returnObj)
        } else {
            neoSession
            .run(checkGamesExistQuery)
            .then( results => {
                if (results.records.length <= 0) {
                    const msg = {
                        'userError': 'Sorry, game not found matching this key',
                        'unknown key' : gameKey
                    }
                    Utils.handleNoResultsResponse(req, res, msg)
                } else {
                    neoSession
                    .run(addBorrowedGameToUserQuery)
                    .then(results => {
                        let game   = results.records.map(record => new ReturnGame(record.get('game').properties).values)[0]
                        let user   = results.records.map(record => new ReturnUser(record.get('user').properties).values)[0]
                        let lender = results.records.map(record => new ReturnUser(record.get('lender').properties).values)[0]
                        let lease  = results.records.map(record => record.get('link').properties)[0] //TODO/ make link model
                        let message = {
                            'message': game ? 'user borrowed game' :'user has already borrowed this game',
                            'game': game,
                            'lease': lease,
                            'lender': lender,
                            'lease': lease
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

exports.editBorrowedGame = function(req, res, next) {
    const borrowerKey   = req.params.userKey
    const gameKey       = req.body.gameKey
    const lenderUserKey = req.body.lenderUserKey
    const returned      = req.body.returned
    const returnDate    = req.body.returnDate
    
    if (!["false", "true"].includes(returned)) return Utils.handleBadRequestResponse(req, res, 'no valid return status given')
    if (!borrowerKey || !gameKey || !lenderUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, not enough info was given');

    const returnGameQuery = ` 
                MATCH (user:User{key:'${borrowerKey}'})-[link:borrowedFrom {gameKey:'${gameKey}'}]->(lender:User{key:'${lenderUserKey}'})
                SET link.returned = ${returned === 'true' ? true:false},
                    link.until = '${returned === 'true'? returnDate? returnDate : new Date(): ''}'
                RETURN user, link, lender`
    
    neoSession
        .run(returnGameQuery)
        .then(result => {
            let lease = result.records.map(record => record.get('link').properties)
            let returnMessage = {
                message: lease? returned? "game was returned": "lease was changed": "no match found",
                lease: lease
            }
            res.status(200).send(returnMessage);
            closeConnection()
        })
        .catch( err => {
            return next(err);
            closeConnection()
        });
}


// DELETE GAME FROM USER LIBRARY
exports.deleteEntry = function(req, res, next) {
    const borrowerKey   = req.params.userKey
    const gameKey       = req.body.gameKey
    const lenderUserKey = req.body.lenderUserKey

    if (!borrowerKey || !gameKey || !lenderUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, not enough info was given');

    const returnGameQuery = ` 
                MATCH (user:User{key:'${borrowerKey}'})-[link:borrowedFrom {gameKey:'${gameKey}'}]->(lender:User{key:'${lenderUserKey}'})
                DETACH DELETE link
                RETURN link`
    
    neoSession
        .run(returnGameQuery)
        .then(result => {
            let lease = result.records.map(record => record.get('link').properties)[0]
            let returnMessage = {
                message: lease? 'lease was removed': "no match found"
            }
            
            if (!lease) Utils.handleNoResultsResponse(req, res, 'no lease was found')
            else {
                res.status(200).send(returnMessage);
                closeConnection()
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