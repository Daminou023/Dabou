import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('../model.event');
var EventLinks    = require('../model.eventLinks');
const Demand      = require('./admin.events.demand.model')
const ReturnUser  = require('../../users/model.users.out');
const ReturnEvent = require('../model.event.out');
const Utils 	  = require('../../utils/utils');

const utils = new Utils();


exports.getInviteDemands = function(req, res, next) {
    const eventKey = req.params.eventKey;
    
    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `

    const query = `MATCH (user:User)-[link:wishesToJoin]->(:Event{key:'${eventKey}'}) 
                   RETURN user, link`;

    neoSession
        .run(checkEventExistsQuery)
        .then(result => {
            if (result.records.length == 0) {
                utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
            } else { 
                const event = new ReturnEvent(result.records[0].get('event').properties).values
                neoSession
                .run(query)
                .then(result => {
                    const response = {
                        demands : result.records.map(record => {
                            return {
                                user: new ReturnUser(record.get('user').properties).values,
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

exports.addInviteDemands = function(req, res, next) {
    const userKeys = req.body.userKeys
    const eventKey = req.params.eventKey;
    
    if (!userKeys || userKeys.length <= 0 || userKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, user keys must be a non empty array');

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
                        .run(addDemandsQuery)
                        .then(results => {
                            let message = {
                                'status': 200,
                                'message': 'event demands were added!',
                                'event':         results.records.map(record => new ReturnEvent(record.get('event').properties).values)[0],
                                'invited users': results.records.map(record => {
                                    return {
                                        user: new ReturnUser(record.get('user').properties).values,
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

exports.changeInviteDemands = function(req, res, next) {

}

exports.deleteInviteDemands = function(req, res, next) {

}


function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
