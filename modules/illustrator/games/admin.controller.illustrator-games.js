import { link } from "fs";
import Utils from '../../utils/utils'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Game          = require('../../games/model.games');
var Illustrator   = require('../model.illustrator');

exports.getIllustratorGames = function(req, res, next) {
    const illustratorKey = req.params.illustratorKey;
    
    const checkIllustratorExistsQuery = `MATCH (illustrator:Illustrator{key:'${illustratorKey}'}) return illustrator`
    const gamesQuery = `MATCH (illustrator:Illustrator{key:'${illustratorKey}'})-[link:Illustrated]->(games: Game) 
                        RETURN illustrator, games`;

    neoSession
    .run(checkIllustratorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no illustrator with this key was found')
        } else { 
            const illustrator = new Illustrator(result.records[0].get('illustrator').properties).values
            neoSession
            .run(gamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    illustrator : illustrator
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

exports.addIllustratorGames = function(req, res, next) {
    const illustratorKey = req.params.illustratorKey;
    const gameKeys = req.body.gameKeys
    console.log('gamekeys', gameKeys)
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkIllustratorExistsQuery = `MATCH (illustrator:Illustrator{key:'${illustratorKey}'}) return illustrator`

    const addGamesQuery = `MATCH  (illustrator:Illustrator{key:'${illustratorKey}'}) 
                           MATCH  (games:Game) WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                           AND NOT (illustrator)-[:Illustrated]->(games)
                           CREATE UNIQUE (illustrator)-[:Illustrated]->(games) 
                           RETURN illustrator, games `                        

    neoSession
    .run(checkIllustratorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no illustrator with this key was found')
        } else { 
            const illustrator = new Illustrator(result.records[0].get('illustrator').properties).values
            neoSession
            .run(addGamesQuery)
            .then(result => {
                const response = {
                    addedGames : result.records.map(record => record.get('games').properties),
                    illustrator : illustrator
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

exports.removeIllustratorGames = function(req, res, next) {
    const illustratorKey = req.params.illustratorKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkIllustratorExistsQuery = `MATCH (illustrator:Illustrator{key:'${illustratorKey}'}) return illustrator`

    const removegamesQuery = `MATCH (illustrator:Illustrator{key:'${illustratorKey}'})-[link:Illustrated]->(games: Game) 
                              WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                              DELETE link
                              RETURN illustrator, games`;

    neoSession
    .run(checkIllustratorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no illustrator with this key was found')
        } else { 
            const illustrator = new Illustrator(result.records[0].get('illustrator').properties).values
            neoSession
            .run(removegamesQuery)
            .then(result => {
                const response = {
                    removedGames : result.records.map(record => record.get('games').properties),
                    illustrator : illustrator
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