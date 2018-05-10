
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('./model.event');


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
				handleNoResultsResponse(req, res)
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
    let newEvent = new Event(req.body);
    if (newEvent.error) {
		res.status(400).send(newEvent.error);
		return
	}
	let key = req.body.title + Date.now() + randomstring.generate({ length: 10, charset: 'hex'})
	key = key.replace(/\s+/g, '')
	newEvent.values.key = key
	
	neoSession
			.run("MATCH (event:Event)WHERE event.key='" + newEvent.values.key +  "' RETURN event")
			.then(results => {
				if (results.records.length > 0) {
    				let message = {
							'status': 400,
							'message': "sorry, somehow this key is already taken!"
						}
					res.status(400).send(message);
				}
				else {
					neoSession
					.run(
						`CREATE (event:Event {event}) RETURN event`, {event: newEvent.values})
			        	.then(results => {
							let createdEvent = results.records[0].get('event').properties;
			            	let message = {
			            		'status': 200,
			            		'message': 'event was added!',
			            		'event': createdEvent
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

	console.log(query)

	neoSession
		.run(`MATCH (event:Event)WHERE event.key= "${event.values.key}" RETURN event`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
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
	let eventKey = req.params.eventKey;
	let query = 'MATCH (event:Event{ key:"' + eventKey + '"}) DETACH DELETE event return event';
	
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
				'message': 'event was deleted!'
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
