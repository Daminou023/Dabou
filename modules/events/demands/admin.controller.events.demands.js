import { link } from "fs";
import Utils from '../../utils/utils'
import User  from '../../users/model.user'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('../model.event');
var EventLinks    = require('../model.eventLinks');
const Demand      = require('./admin.events.demand.model')
const ReturnEvent = require('../model.event.out');


exports.getDemands = function(req, res, next) {
    const eventKey = req.params.eventKey;
    
    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `

    const query = `MATCH (user:User)-[link:wishesToJoin]->(:Event{key:'${eventKey}'}) 
                   RETURN user, link`;

    neoSession
        .run(checkEventExistsQuery)
        .then(result => {
            if (result.records.length == 0) {
                Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
            } else { 
                const event = new ReturnEvent(result.records[0].get('event').properties).values
                neoSession
                .run(query)
                .then(result => {
                    const response = {
                        demands : result.records.map(record => {
                            return {
                                user: User.create(record.get('user').properties).outputValues,
                                demandStatus: record.get('link').properties.status
                            }
                        }),
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

exports.addDemands = function(req, res, next) {
    const userKeys = req.body.userKeys
    const eventKey = req.params.eventKey;
    
    if (!userKeys || userKeys.length <= 0 || userKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, user keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event`

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;

    const addDemandsQuery = `MATCH  (event:Event{key:'${eventKey}'}) 
                                 MATCH  (user:User) WHERE user.key IN [${userKeys.map(key => `'${key}'`)}]
                                 AND NOT (user)-[:wishesToJoin]->(event)
                                 CREATE UNIQUE (user)-[:wishesToJoin {status:'pending'}]->(event) 
                                 RETURN user, event `

    neoSession
        .run(checkEventExistsQuery)
        .then( result => {
            if (result.records.length == 0) {
				Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
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
                        Utils.handleNoResultsResponse(req, res, msg)
                    } else {
                        neoSession
                        .run(addDemandsQuery)
                        .then(results => {
                            let message = {
                                'status': 200,
                                'message': 'event demands were added!',
                                'event':         results.records.map(record => new ReturnEvent(record.get('event').properties).values)[0],
                                'invited users': results.records.map(record => {
                                    return {
                                        user: User.create(record.get('user').properties).outputValues,
                                        demandStatus: 'pending'
                                    }
                                }) 
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

exports.editDemands = function(req, res, next) {
    const eventKey = req.params.eventKey;
    const keysAndStatus = req.body.keysAndStatus
    const userKeys = keysAndStatus.map(ks => ks.userKey)

    if (!keysAndStatus || keysAndStatus.length <= 0 || keysAndStatus.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, syntax error. Please provide an array of user keys and status')
    
    const queryError = (keysAndStatus).map(ks => new Demand(ks)).filter(ks => ks.error);
    if (queryError.length > 0) return Utils.handleBadRequestResponse(req, res, 'Sorry, there are syntax errors in the provided values')

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event`
    
    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;
    
    const acceptedDemands =  keysAndStatus.filter(ks => ks.inviteStatus === 'accepted').map(ks => ks.userKey);
    const rejectedDemands =  keysAndStatus.filter(ks => ks.inviteStatus === 'rejected').map(ks => ks.userKey);
    const pendingDemands  =  keysAndStatus.filter(ks => ks.inviteStatus === 'pending').map(ks => ks.userKey);
    let queries = [];
    
    const changeAcceptedDemands = `MATCH  (user)-[rel:wishesToJoin]->(event:Event{key:'${eventKey}'}) WHERE user.key IN [${acceptedDemands.map(key => `'${key}'`)}] 
                                       SET rel.status = "accepted"
                                       RETURN rel, user`

    const changeRejectedDemands = `MATCH  (user)-[rel:wishesToJoin]->(event:Event{key:'${eventKey}'}) WHERE user.key IN [${rejectedDemands.map(key => `'${key}'`)}] 
                                       SET rel.status = "rejected"
                                       RETURN rel, user`

    const changePendingDemands  = `MATCH  (user)-[rel:wishesToJoin]->(event:Event{key:'${eventKey}'}) WHERE user.key IN [${pendingDemands.map(key => `'${key}'`)}] 
                                       SET rel.status = "pending"
                                       RETURN rel, user`        
    

    neoSession
    .run(checkEventExistsQuery)
    .then(result => {
        if (result.records.length <= 0 ) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
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
                    Utils.handleNoResultsResponse(req, res, msg)
                } else {

                    Promise.all([
                        neoSession.run(changeAcceptedDemands),
                        neoSession.run(changeRejectedDemands),
                        neoSession.run(changePendingDemands),
                    ])
                    .then((results) => {

                        console.log('res:', results)

                        let message = {
                            'status': 200,
                            'message': 'event demands were changed!',
                            'results' : {
                                'accepted':results[0].records.map(record => User.create(record.get('user').properties).outputValues),
                                'rejected':results[1].records.map(record => User.create(record.get('user').properties).outputValues),
                                'pending':results[2].records.map(record => User.create(record.get('user').properties).outputValues),
                            }
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
    })
    .catch( err => {
        return next(err);
        closeConnection()
    });

}

exports.deleteDemands = function(req, res, next) {

    const userKeys = req.body.userKeys
    const eventKey = req.params.eventKey;
    
    if (!userKeys || userKeys.length <= 0 || userKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, user keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event`

    const checkUsersExistsquery = `MATCH (user:User) 
                                   WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                   RETURN user`;


    const deleteDemandsQuery = `MATCH  (user)-[rel:wishesToJoin]->(event:Event{key:'${eventKey}'}) WHERE user.key IN [${userKeys.map(key => `'${key}'`)}] 
                                    DELETE rel 
                                    RETURN user, event`

    neoSession
        .run(checkEventExistsQuery)
        .then(result => {
            if (result.records.length == 0) {
				Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
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
                        Utils.handleNoResultsResponse(req, res, msg)
                    } else {
                        neoSession
                            .run(deleteDemandsQuery)
                            .then(results => {
                                let message = {
                                    'message': 'event demands were deleted!',
                                    'event':           results.records.map(record => new ReturnEvent(record.get('event').properties).values)[0],
                                    'deleted demands': results.records.map(record => User.create(record.get('user').properties).outputValues),
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
