import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
const ReturnEvent = require('../../events/model.event.out');

exports.getEventsOrganisedByUser = function(req, res, next) {
    const userKey = req.params.userKey

    const userEventsQuery = `MATCH (organiser:User{key:'${userKey}'})-[link:Organises]->(event:Event) 
                             RETURN organiser, link, event`;

        neoSession
        .run(userEventsQuery)
        .then(result => {
                const events = result.records.map(record => new ReturnEvent (record.get('event').properties).values);
                res.json(events);
                closeConnection()
        })
        .catch(function(err) {
            return next(err);
            closeConnection()
        });
}

exports.getEventsParticipatedBuUser = function(req, res, next) {
    const userKey = req.params.userKey

    const invitationQuery = `MATCH (user:User{key:'${userKey}'})-[a:invitedTo{status:'accepted'}]->(inviteEvent:Event)
                             RETURN inviteEvent`
    
    const demandQuery = `MATCH (user:User{key:'${userKey}'})-[b:wishesToJoin{status:'accepted'}]->(demandEvent:Event)
                         RETURN demandEvent`

    let invitationPromise = new Promise((resolve, reject) => {
        neoSession
        .run(invitationQuery)
        .then(result => {
                const inviteEvents = result.records.map(record => new ReturnEvent (record.get('inviteEvent').properties).values);
                resolve(inviteEvents)
        })
        .catch(function(err) {
            reject(err)
        });
    })

    let demandPromise = new Promise((resolve, reject) => {
        neoSession
        .run(demandQuery)
        .then(result => {
                const demandEvent = result.records.map(record => new ReturnEvent (record.get('demandEvent').properties).values);
                resolve(demandEvent)
        })
        .catch(function(err) {
            reject(err)
        });
    })

    Promise.all([invitationPromise, demandPromise])
           .then(([inviteEvents, demandEvents]) => {
                res.json({
                    joined: demandEvents,
                    invited: inviteEvents
                });
                closeConnection()
           })
           .catch((err) => {
                return next(err);
                closeConnection()               
           })
}                 


function closeConnection() {
	neoSession.close();
	neoDriver.close();
}
