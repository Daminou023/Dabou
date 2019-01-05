import { link } from "fs";
import Utils from '../../utils/utils'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var ReturnEvent   = require('../model.event.out');

exports.getEventGames = function(req, res, next) {
    const eventKey = req.params.eventKey;
    
    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `

    const gamesQuery = `MATCH (event:Event{key:'${eventKey}'})-[link:Proposes]->(games: Game) 
                        RETURN event, games`;

    neoSession
    .run(checkEventExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
        } else { 
            const event = new ReturnEvent(result.records[0].get('event').properties).values
            neoSession
            .run(gamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
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

exports.addEventGames = function(req, res, next) {
    const eventKey = req.params.eventKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `


    const addGamesQuery = `MATCH  (event:Event{key:'${eventKey}'}) 
                           MATCH  (games:Game) WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                           AND NOT (event)-[:Proposes]->(games)
                           CREATE UNIQUE (event)-[:Proposes]->(games) 
                           RETURN event, games `                        


    neoSession
    .run(checkEventExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
        } else { 
            const event = new ReturnEvent(result.records[0].get('event').properties).values
            neoSession
            .run(addGamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
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

exports.removeEventGames = function(req, res, next) {
    const eventKey = req.params.eventKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkEventExistsQuery = `MATCH (event:Event{key:'${eventKey}'}) return event `

    const removegamesQuery = `MATCH (event:Event{key:'${eventKey}'})-[link:Proposes]->(games: Game) 
                              WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                              DELETE link
                              RETURN event, games`;


    neoSession
    .run(checkEventExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no event with this key was found')
        } else { 
            const event = new ReturnEvent(result.records[0].get('event').properties).values
            neoSession
            .run(removegamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
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

// CLOSE CONNECTION AND DRIVER TO DB
function closeConnection() {
	neoSession.close();
	neoDriver.close();
}