import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('./model.event');
var EventLinks    = require('./model.eventLinks');
const Utils 	  = require('../utils/utils');

const utils = new Utils();

// GET LIST OF ALL EVENTS
exports.listEvents = function(req, res, next) {
	let listOfEvents = [];
	neoSession
		.run('MATCH (event:Event) RETURN event')
		.then(function(result){
			result.records.forEach(function(record){
				let event = new Event(record.get('event').properties);
				listOfEvents.push(event.values);
			})
			res.json(listOfEvents);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC EVENT
exports.getEvent = function(req, res, next) {
	let eventKey = req.params.eventKey;
	neoSession
		.run("MATCH (event:Event)WHERE event.key='" + eventKey +  "' RETURN event")
		.then(result => {
			if (result.records.length == 0) {
				utils.handleNoResultsResponse(req, res, 'Sorry, no event was found matching taht key')
			} else {
				let event = result.records[0].get('event').properties;
				res.json(event);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW EVENT
/*
* note: events can have the same name.
*/
exports.createNewEvent = function(req, res, next) {
	let newEvent = new Event(req.body.properties);
	let links = new EventLinks(req.body.links);

	console.log(newEvent)

    if (newEvent.error) {
		res.status(400).send(newEvent.error);
		return
	}

	if (links.error) {
		res.status(400).send(links);
		return
	}




	let key = req.body.properties.title + Date.now() + randomstring.generate({ length: 10, charset: 'hex'})


	key = key.replace(/\s+/g, '')
	key = key.replace(/[^\w\s]/gi, '')
	newEvent.values.key = key
	
	var request

	neoSession
			.run("MATCH (event:Event)WHERE event.key='" + newEvent.values.key +  "' RETURN event")
			.then(results => {
				if (results.records.length > 0) {
					utils.handleBadRequestResponse(req, res,'sorry, somehow this key is already taken!');
				}
				else {

					let request;

					let eventRequest = `MATCH (user:User) WHERE user.key='${links.values.organiser}' 
										WITH user
										CREATE (event:Event {event}) 
										WITH user, event 
										CREATE (user)-[:Organises]->(event) 
										RETURN user, event`

					let eventWithGamesRequest = `MATCH (user:User) WHERE user.key='${links.values.organiser}' 
												 MATCH (game:Game) WHERE game.key IN [${links.values.games.map(key => `'${key}'`)}]
												 WITH game, user
												 CREATE UNIQUE (user)-[:Organises]->(event:Event {event})-[:Proposes]->(game) 
												 return user, game, event
												 `

					if (links.values.games.length > 0 ) {
						request = eventWithGamesRequest
					} else {
						request = eventRequest
					}
					
					neoSession
					.run(
						request , {event: newEvent.values})
			        	.then(results => {
							if(results.records.length <= 0) {
								utils.handleNoResultsResponse(req, res, 'Sorry, user, games or location was not found')
							} else {

							let createdEvent = results.records[0].get('event').properties;
			            	let message = {
			            		'status': 200,
			            		'message': 'event was created!',
			            		'event': createdEvent
							}
							res.status(200).send(message);
						  }
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
	
	console.log(request)
}


// EDIT INFORMATION ON A SINGLE EVENTS
exports.editEvent = function(req, res, next) {
	
	let event = new Event(req.body);
	event.values.key = req.params.eventKey;

	if(event.error.unknownProperties) {
		res.status(400).send(event.error);
		return
	}

	let query = "MATCH (event:Event)WHERE event.key='" + event.values.key + "'";
	for (let property in event.values) {
		query += `SET event.${property} ="${event.values[property]}"`;
	}
	query += "RETURN event"

	neoSession
		.run(`MATCH (event:Event)WHERE event.key= "${event.values.key}" RETURN event`)
		.then(result => {
			if (result.records.length == 0) {
				utils.handleNoResultsResponse(req, res, 'Sorry, there is no event that matches this key')
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedEvent = new Event(results.records[0].get('event').properties);
						let message = {
							'status': 200,
							'message': 'event was edited!',
							'user': editedEvent.values
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


// DELETE AN EVENT
/*
* !! when deleting a event, or any node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteEvent = function(req, res, next) {
	console.log('in delete event')
	let eventKey = req.params.eventKey;
	let query = 'MATCH (event:Event{ key:"' + eventKey + '"}) DETACH DELETE event return event';
	
	neoSession
		.run(
			query
		)
		.then(results => {
			if (results.records.length <= 0) {
				utils.handleNoResultsResponse(req, res, 'Sorry, there is no event that matches this key')
				closeConnection();
			} else {
			res.status(200).send('event was deleted!');
			closeConnection();
		}
		})
		.catch(function(err) {
			return next(err);
			closeConnection();
		})
}


exports.getAll = function(req, res, next) {
	console.log('in gett all from event')
	let eventKey = req.params.eventKey;

	let query = `MATCH 	(event:Event{key:'${eventKey}'})
				 WITH   event
				 OPTIONAL MATCH  (event)-[:Proposes]->(games)
				 OPTIONAL MATCH  (user:User)-[:Organises]-(event)
				 OPTIONAL MATCH  (invited:User)-[:invitedTo]->(event)
				 OPTIONAL MATCH  (requesting:User)-[:wishesToJoin]->(event) 
						  return event, user, games, invited` 
		
	/*,
				 		(event)-[:Proposes]->(Games),
				 		(user:User)-[:Organises]-(event),
				 		(invited:User)-[:invitedTo]->(event),
				 		(requesting:User)-[:wishesToJoin]->(event)
				 		return event, user, invited, requesting`
	*/
	neoSession
		.run(query)
		.then(results => {
			console.log('records', results.records)

			// let event = results.records[0].get('event').properties;
			// let links = results.records[0].get('l').properties;

			// let games = results.records.map(record => record.get('n')).filter(node => node.labels.includes('Game'))
			
			
			// let organiser = results.records.map(record => record.get('n')).filter(node => node.labels.includes('Game'))

			// let users = results.records.map(record => record.get('n')).filter(node => node.labels.includes('User'))
			

			/*
			let a = results.records[0].get('n');
			let b = results.records[1].get('n');
			let c = results.records[2].get('n');

			console.log('a',a);
			console.log('b',b);
			console.log('c',c);
			
			/*
			console.log('event', event)
			console.log('links', link)
			console.log('nodes', nodes)
			*/

			res.status(200).send(results)
		})
		.catch(err => {
			return next(err)
			closeConnection();
		})
	
}


// CLOSE CONNECTION AND DRIVER TO DB
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
