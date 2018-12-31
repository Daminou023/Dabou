import { link } from "fs";
import Utils from '../../../utils/utils'
import User  from '../../model.user'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();


// GET FRIENDS FOR A GIVEN PERSON
exports.getFriends = function(req, res, next) {
    
    let userKey = req.params.userKey;
    const friendQuery = `MATCH (user:User{key:'${userKey}'})-[link:friendsWith]-(friend:User) 
                         return user, link, friend`                                   

    neoSession
        .run(friendQuery)
        .then(result => {
            let friends = resutl.records.map(record => {
                return User.create(record.get('friend').properties).outputValues;
            })
            res.status(200).send(friends)
        })
        .catch(err => {
            return next(err);
            closeConnection()
        })
}

// GET FRIENDS OF FRIENDS OF A PERSON
exports.getFriendsOfFriends = function(req, res, next) {
    
    let userKey = req.params.userKey;
    console.log(userKey)
    const friendQuery = `MATCH (user:User{key:'${userKey}'})-[:friendsWith]->(friend:User)-[:friendsWith]->(friendOfFriend:User)
                         return user, friend, friendOfFriend`                                   
                        
    neoSession
        .run(friendQuery)
        .then(result => {
            let closeFriends = []
            let distantFriends = []

            result.records.forEach(function(record){
                let closeFriend = User.create(record.get('friend').properties).outputValues;
                if (!closeFriends.map(user => user.key).includes(closeFriend.values.key)) closeFriends.push(closeFriend.values)
                let friendsOfFriends = User.create(record.get('friendOfFriend').properties).outputValues;
                if (!distantFriends.map(user => user.key).includes(friendsOfFriends.values.key)) distantFriends.push(friendsOfFriends.values)
            })

            res.status(200).send({closeFriends, distantFriends})
        })
        .catch(err => {
            return next(err);
            closeConnection()
        })
}

// ADD NEW FRIEND
exports.addFriend  = function(req, res, next) {
    let userKey         = req.params.userKey;
    const targetUserKey = req.body.targetUserKey
    const userKeys      = [userKey, targetUserKey]

    
    if (!targetUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no user key given');

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const checkIfAlreadyFriendsQuery = ` MATCH (user:User{key:'${userKey}'})-[:friendsWith]-(targetUser:User{key:'${targetUserKey}'})
                                         return user, targetUser`

    const friendRequestQuery = `MATCH (targetUser:User{key:'${targetUserKey}'}) 
                                MATCH (user:User{key:'${userKey}'}) 
                                CREATE UNIQUE (user)-[newFriendship:friendsWith]->(targetUser) 
                                RETURN user, targetUser, newFriendship`;
                                
    neoSession
    .run(checkUsersExistsquery)
    .then(result => {
        if (result.records.length < userKeys.length) {
            const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
            const msg = {
                'userError': 'Sorry, user not found matching this key',
                'unknown keys' : unknownUsers
            }
            Utils.handleNoResultsResponse(req, res, msg)
        } else {
            neoSession
            .run(checkIfAlreadyFriendsQuery)
            .then( results => {
                if(results.records.length <= 0) {
                    neoSession
                    .run(friendRequestQuery)
                    .then(results => {
                        let users = results.records.map(record => {
                            return {
                                user: User.create(record.get('user').properties).outputValues,
                                invitedUser: User.create(record.get('targetUser').properties).outputValues,
                            }
                        })
                        if (users.length > 0) {
                            let message = {
                                'message': 'friend was added!',
                                'users': users 
                            }
                            res.status(200).send(message);
                        } else {
                            let message = {
                                'message': 'user already invited!',
                                'users': users 
                            }
                            res.status(400).send(message);
                        }
                        closeConnection()
                    })
                    .catch(function(err) {
                        return next(err);
                        closeConnection()
                    })
                } else {
                    res.status(400).send({message: "users are already friends!"})
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

// DELETE INVITATIONS FOR A GIVEN EVENT
exports.deleteFriend = function(req, res, next) {
    const userKey = req.params.userKey;
    const targetUserKey = req.body.targetUserKey
    const userKeys      = [userKey, targetUserKey]
    
    if (!userKey || !targetUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no user or target user key was given');

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const deleteFriendQuery = `MATCH (user:User{key:'${userKey}'})-[rel:friendsWith]-(targetUser:User{key:'${targetUserKey}'})
                               DELETE rel 
                               RETURN user, targetUser, rel`

        neoSession
        .run(checkUsersExistsquery)
        .then(result => {
            if (result.records.length < userKeys.length) {
                const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
                const msg = {
                    'userError': 'Sorry, user was not found matching this key',
                    'unknown keys' : unknownUsers
                }
                Utils.handleUnknownInputResponse(req, res, msg)
            } else {
                neoSession
                    .run(deleteFriendQuery)
                    .then(results => {
                        
                        let msg = '';
                        let user = results.records.map(record => User.create(record.get('user').properties).outputValues);
                        let targetUser = results.records.map(record => User.create(record.get('targetUser').properties).outputValues);
                        
                        if (user.length <= 0 || targetUser.length <=0) {
                            msg = 'there is no existing friendship between these two users'
                        } else {
                            msg = 'friendship was deleted! (sad... :( )'
                        }

                        let message = {
                            'message': msg,
                            'user': user,
                            'targetUser': targetUser
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


// CLOSE CONNECTION AND DRIVER TO DB 
//TODO: this function should be made into a service
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
