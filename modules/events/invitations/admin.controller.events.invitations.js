import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('../model.event');
var EventLinks    = require('../model.eventLinks');
const ReturnUser  = require('../../users/model.users.out');
const ReturnEvent = require('../model.event.out');
const Utils 	  = require('../../utils/utils');

const utils = new Utils();

exports.getInvitations = function(req, res, next) {
    const eventKey = req.params.eventKey;
    
    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `

    const query = `MATCH (user:User)-[link:invitedTo]->(:Event{key:'${eventKey}'}) 
                   RETURN user`;

    neoSession
        .run(checkEventExistsQuery)
        .then(result => {
            if (result.records.length == 0) {
                utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
            } else { 
                const event = new ReturnEvent(result.records[0].get('event').properties).values;
                neoSession
                .run(query)
                .then(result => {
                    const response = {
                        users : result.records.map(record => new ReturnUser(record.get('user').properties).values),
                        event : event
                    }
                    res.json(response);
                    closeConnection()
                })
                .catch(function(err) {
                    return next(err);
                    closeConnection()
                });
            }
        })
        .catch(err => {
            return next(err);
            closeConnection()
        })
}


exports.addInvitations  = function(req, res, next) {
    const userKeys = req.body.userKeys
    const eventKey = req.params.eventKey;
    
    if (!userKeys || userKeys.length <= 0 || userKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, user keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event`

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const addInvitationsQuery = `MATCH  (event:Event{key:'${eventKey}'}) 
                                 MATCH  (user:User) WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                 CREATE UNIQUE (user)-[:invitedTo]->(event) 
                                 RETURN user, event `

    neoSession
        .run(checkEventExistsQuery)
        .then( result => {
            if (result.records.length == 0) {
				utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
			} else {
                neoSession
                .run(checkUsersExistsquery)
                .then(result => {
                    if (result.records.length < userKeys.length) {
                        const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
                        const msg = {
                            'userError': 'Sorry, some users were not found matching these keys',
                            'unknown keys' : unknownUsers
                        }
                        utils.handleNoResultsResponse(req, res, msg)
                    } else {
                        neoSession
                        .run(addInvitationsQuery)
                        .then(results => {
                            let message = {
                                'status': 200,
                                'message': 'event invitations were edited!',
                                'event':         results.records.map(record => new ReturnEvent(record.get('event').properties).values)[0],
                                'invited users': results.records.map(record => new ReturnUser(record.get('user').properties).values),
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
        })
        .catch(err => {
            return next(err);
			closeConnection();
        })
}



exports.deleteInvitations = function(req, res, next) {
    const userKeys = req.body.userKeys
    const eventKey = req.params.eventKey;
    
    if (!userKeys || userKeys.length <= 0 || userKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, user keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event`

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;


    const deleteInvitationsQuery = `MATCH  (user)-[rel:invitedTo]->(event:Event{key:'${eventKey}'}) WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                    DELETE rel 
                                    RETURN user, event`

    neoSession
        .run(checkEventExistsQuery)
        .then(result => {
            if (result.records.length == 0) {
				utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
			} else {
                neoSession
                .run(checkUsersExistsquery)
                .then(result => {
                    if (result.records.length < userKeys.length) {
                        const unknownUsers = userKeys.filter(key => !result.records.map(record => record.get('user').properties.key).includes(key))
                        const msg = {
                            'userError': 'Sorry, some users were not found matching these keys',
                            'unknown keys' : unknownUsers
                        }
                        utils.handleNoResultsResponse(req, res, msg)
                    } else {
                        neoSession
                            .run(deleteInvitationsQuery)
                            .then(results => {
                                let message = {
                                    'status': 200,
                                    'message': 'event invitations were deleted!',
                                    'event':       results.records.map(record => new ReturnEvent(record.get('event').properties).values)[0],
                                    'deleted invites': results.records.map(record => new ReturnUser(record.get('user').properties).values),
                                }
                                res.status(200).send(message);
                                closeConnection()
                            })
                            .catch(function(err) {
                                return next(err);
                                closeConnection()
                            })
                            let users = result.records.map(record => record.get('user').properties.key)
                        console.log(users);

                    }
                })
                .catch( err => {
                    return next(err);
                    closeConnection()
                });
            }
        })
        .catch( err => {
            return next(err);
            closeConnection()
        });
}


// CLOSE CONNECTION AND DRIVER TO DB //TODO: this function should be made into a service
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
