
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const util 		  = require('util');
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Location 	  = require('./model.location');


// GET LIST OF ALL LOCATIONS
exports.listLocations = function(req, res, next) {
	let listOfLocations = [];
	neoSession
		.run('MATCH (location:Location) RETURN location')
		.then(function(result){
			result.records.forEach(function(record){
				let location = new Location(record.get('location').properties);
				listOfLocations.push(location.values);
			})
			res.json(listOfLocations);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC LOCATION
exports.getLocation = function(req, res, next) {
	let locationKey = req.params.locationsKey;
	neoSession
		.run("MATCH (location:Location)WHERE location.key='" + locationKey +  "' RETURN  location")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let location = result.records[0].get('location').properties;
				res.json(location);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW LOCATION
/*
* note: there can NEVER be two locations with the same info.
* a location can be common. If we try and create a location that already exists, that location will
* be returned.
*/
exports.createNewLocation = function(req, res, next) {
    let newLocation = new Location(req.body);
    if (newLocation.error) {
		res.status(400).send(newLocation.error);
		return
	}
	let key = req.body.zipCode +
			  req.body.street+
			  req.body.number + 
			  randomstring.generate({ length: 10, charset: 'hex'})
	key = key.replace(/\s+/g, '')											// remove whitespace

	neoSession
			.run(`MATCH (location:Location ${util.inspect(newLocation.values)}) RETURN location`)
			.then(results => {
    			if (results.records.length > 0) {
					let existingLocation = results.records[0].get('location').properties;
    				let response = {
							"status": 200,
							"locationExists": true,
							"message": "this location already exists! it was not created, and you can use this existing one",
							"existingLocation": existingLocation
						}
					res.status(200).send(response);
				}
				else {
					newLocation.values.key = key
					neoSession
					.run(
						`CREATE (location:Location {location}) RETURN location`, {location: newLocation.values})
			        	.then(results => {
							let createdLocation = results.records[0].get('location').properties;
			            	let message = {
			            		'status': 200,
			            		'message': 'location was created!',
			            		'location': createdLocation
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

// EDIT INFORMATION ON A SINGLE LOCATION
exports.editLocation = function(req, res, next) {
	
	let location = new Location(req.body);
	location.values.key = req.params.locationsKey;

	if(location.error.unknownProperties) {
		res.status(400).send(location.error);
		return
	}

	let query = "MATCH (location:Location)WHERE location.key='" + location.values.key + "'";
	for (let property in location.values) {
		query += `SET location.${property} ="${location.values[property]}"`;
	}
	query += "RETURN location"

	console.log(query)

	neoSession
		.run(`MATCH (location:Location)WHERE location.key= "${location.values.key}" RETURN location`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedLocation = new Location(results.records[0].get('location').properties);
						let message = {
							'status': 200,
							'message': 'location was edited!',
							'user': editedLocation.values
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


// DELETE A LOCATION
/*
* !! when deleting a location, or any node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteLocation = function(req, res, next) {
	let locationKey = req.params.locationsKey;
	let query = 'MATCH (location:Location{ key:"' + locationKey + '"}) DETACH DELETE location return location';7
	console.log(query)
	
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
				'message': 'location was deleted!'
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
