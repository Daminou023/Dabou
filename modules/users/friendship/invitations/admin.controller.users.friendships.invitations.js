import { link } from "fs";
import Utils from '../../../utils/utils'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
const Friendship  = require('./admin.friendships.invitations.model')
const ReturnUser  = require('../../../users/model.users.out');

// GET INVITATIONS FOR A GIVEN PERSON (ALL SENT AND RECEIVED)

exports.getInvitations = function(req, res, next) {
    
    let userKey = req.params.userKey;
    const userFriendInvitesQuery = `MATCH (targetUser:User{key:'${userKey}'})-[link:wantsToBeFriendsWith]->(user:User) 
                                    return targetUser, link, user`

    const userFriendRequestsQuery = `MATCH (targetUser:User{key:'${userKey}'})<-[link:wantsToBeFriendsWith]-(user:User) 
                                     return targetUser, link, user`                                    

    const invitesPromise = new Promise((resolve, reject) => {
        neoSession
        .run(userFriendInvitesQuery)
        .then(result => {

            let sentInvitations = [];

            if (result.records.length != 0) { 
                sentInvitations = result.records.map(record => new ReturnUser(record.get('user').properties).values);
            }
            resolve(sentInvitations);
        })
        .catch(err => {
            reject(err)
        })
    })

    const requestsPromise = new Promise((resolve, reject) => {
        neoSession
        .run(userFriendRequestsQuery)
        .then(result => {

            let friendRequests = [];

            if (result.records.length != 0) {
                friendRequests = result.records.map(record => new ReturnUser(record.get('user').properties).values);
            }
            resolve(friendRequests);
        })
        .catch(err => {
            reject(err)
        })
    })

    Promise.all([invitesPromise, requestsPromise])
    .then(([invites, requests]) => {
        let message = {
            invitations : invites,
            friendRequests: requests
        }
        res.status(200).send(message);
        closeConnection();
    })
    .catch(err => {
        return next(err);
        closeConnection()
    })
}

// ADD NEW INVITATIONS TO BECOME FRIENDS
exports.addFriendInvite  = function(req, res, next) {
    let userKey         = req.params.userKey;
    const targetUserKey = req.body.targetUserKey
    const userKeys      = [userKey, targetUserKey]

    
    if (!targetUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no user key given');

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const checkIfAlreadyFriendsQuery = `
                                MATCH (user:User{key:'${userKey}'})-[:friendsWith]-(targetUser:User{key:'${targetUserKey}'})
                                return user, targetUser
    `

    const friendRequestQuery = `MATCH (targetUser:User{key:'${targetUserKey}'}) 
                                MATCH (user:User{key:'${userKey}'}) 
                                WHERE NOT (user)-[:wantsToBeFriendsWith]->(targetUser)
                                AND NOT (user)-[:friendsWith]->(targetUser)
                                AND NOT (user)<-[:friendsWith]-(targetUser)
                                CREATE UNIQUE (user)-[:wantsToBeFriendsWith]->(targetUser) 
                                RETURN user, targetUser`;
                                
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
                                user: new ReturnUser(record.get('user').properties).values,
                                invitedUser: new ReturnUser(record.get('targetUser').properties).values,
                            }
                        })
                        if (users.length > 0) {
                            let message = {
                                'message': 'friend invitation was added!',
                                'users': users[0]
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
exports.deleteFriendRequest = function(req, res, next) {
    const userKey = req.params.userKey;
    const targetUserKey = req.body.targetUserKey
    const userKeys      = [userKey, targetUserKey]
    
    if (!userKey || !targetUserKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no user or target user key was given');

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const deleteInvitationsQuery = `MATCH  (user:User{key:'${userKey}'})-[rel:wantsToBeFriendsWith]->(targetUser:User{key:'${targetUserKey}'})
                                    DELETE rel 
                                    RETURN user, targetUser`

        neoSession
        .run(checkUsersExistsquery)
        .then(result => {
            if (result.records.length < userKeys.length) {
                const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
                const msg = {
                    'userError': 'Sorry, user was not found matching this key',
                    'unknown keys' : unknownUsers
                }
                Utils.handleNoResultsResponse(req, res, msg)
            } else {
                neoSession
                    .run(deleteInvitationsQuery)
                    .then(results => {
                        let message = {
                            'message': 'friend request was deleted!',
                            'user': results.records.map(record => new ReturnUser(record.get('user').properties).values),
                            'targetUser': results.records.map(record => new ReturnUser(record.get('targetUser').properties).values),
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

// ACCEPT OR REFUSE FRIEND REQUEST
exports.acceptOrRefuseFriendRequest = function(req, res, next) {
    
    const userKey  = req.params.userKey;
    let friendship = new Friendship(req.body)
    
    if (friendship.error) {
		res.status(400).send(friendship.error);
		return
    }

    console.log(friendship)
    
    // check if there is indeed a friend request between the two
    const checkRequestExistsquery = `
            MATCH  (user:User{key:'${userKey}'})<-[rel:wantsToBeFriendsWith]-(reqUser:User{key:'${friendship.values.requestingUserKey}'})
            RETURN rel`;
    
    const acceptRequestQuery = `
            MATCH  (user:User{key:'${userKey}'})<-[rel:wantsToBeFriendsWith]-(requestingUser:User{key:'${friendship.values.requestingUserKey}'})
            DELETE rel
            WITH user, requestingUser
            CREATE UNIQUE (requestingUser)-[friendship:friendsWith]->(user)
            RETURN user, friendship, requestingUser`;

    const deleteRequestQuery = `
            MATCH  (user:User{key:'${userKey}'})<-[rel:wantsToBeFriendsWith]-(requestingUser:User{key:'${friendship.values.requestingUserKey}'})
            DELETE rel 
            RETURN user, requestingUser`
    
    neoSession
    .run(checkRequestExistsquery)
    .then(result => {
        if (result.records.length <= 0) {
            const msg = 'Sorry, there seems to be no friend request matching these users';
            res.status(400).send(msg);
        } else {
            const acceptOrRefuseQuery = friendship.values.choice ? acceptRequestQuery : deleteRequestQuery ;
            console.log(acceptOrRefuseQuery)
            neoSession
                .run(acceptOrRefuseQuery)
                .then(results => {
                    let message = {
                        'message': `friend request was ${friendship.values.choice ? 'accepted' : 'deleted'} !`,
                        'targetUser':     results.records.map(record => new ReturnUser(record.get('user').properties).values),
                        'requestingUser': results.records.map(record => new ReturnUser(record.get('requestingUser').properties).values),
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
