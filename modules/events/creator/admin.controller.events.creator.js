import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
const neoDriver   = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
const neoSession  = neoDriver.session();
const Event 	  = require('../model.event');
const EventLinks  = require('../model.eventLinks');
const ReturnUser  = require('../../users/model.users.out');
const ReturnEvent = require('../model.event.out');



exports.getCreator = function(req, res, next) {
    let eventKey = req.params.eventKey;

//    MATCH p=(u:User)-[r:Organises]->(e:Event{key:'NaN4de58ff7f0'}) RETURN p

    const query = `MATCH (organiser:User)-[link:Organises]->(event:Event{key:'${eventKey}'}) RETURN organiser, link, event`;

    neoSession
		.run(query)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
                const response = result.records.map(record => {
                    return {
						organiser: new ReturnUser(record.get('organiser').properties).values,
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

}


// CLOSE CONNECTION AND DRIVER TO DB //TODO: this function should be made into a service
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
