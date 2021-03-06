import { link } from "fs";
import Utils from '../../utils/utils'
import User  from '../../users/model.user'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
const neoDriver   = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
const neoSession  = neoDriver.session();
const Event 	  = require('../model.event');
const EventLinks  = require('../model.eventLinks');
const ReturnEvent = require('../model.event.out');

exports.getCreator = function(req, res, next) {
    const eventKey = req.params.eventKey;
    const query = `MATCH (organiser:User)-[link:Organises]->(event:Event{key:'${eventKey}'}) RETURN organiser, link, event`;
    neoSession
		.run(query)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
                const response = result.records.map(record => {
                    return {
						organiser: User.create(record.get('organiser').properties).outputValues,
						event: new ReturnEvent (record.get('event').properties).values
                    }
                });
            	res.json(response);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
        });
    
}

exports.changeCreator = function(req, res, next) {
	const creatorKey = req.body.creatorKey;
	const eventKey = req.params.eventKey;
	
	if (!creatorKey) return Utils.handleBadRequestResponse(req, res,'Sorry, no creator key was given');
	

	const checkCreatorExistsquery = `MATCH (organiser:User{key:'${creatorKey}'}) RETURN organiser`;
	const changeCreatorQuery 	  = `MATCH (oldOrganiser:User)-[oldLink:Organises]->(event:Event{key:'${eventKey}'}), (newOrganiser:User{key:'${creatorKey}'})
									 CREATE (newOrganiser)-[newLink:Organises]->(event)
									 DELETE oldLink
									 RETURN event, newOrganiser`;

	neoSession
		.run(checkCreatorExistsquery)
		.then(result => {
			if (result.records.length == 0) {
				Utils.handleNoResultsResponse(req, res, 'Sorry, there is no creator that matches this key')
			} else {
				neoSession
					.run(changeCreatorQuery)
					.then(results => {
						const newUser 	  = User.create(results.records[0].get('newOrganiser').properties).outputValues;
						const event 	  = new ReturnEvent(results.records[0].get('event').properties);
						let message = {
							'status': 200,
							'message': 'event creator was edited!',
							'new organizer': newUser,
							'event': event.values
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


// CLOSE CONNECTION AND DRIVER TO DB //TODO: this function should be made into a service
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
