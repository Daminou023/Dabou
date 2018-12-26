import { link } from "fs";
import Utils from '../../utils/utils'

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Game          = require('../../games/model.games');
var Distributor   = require('../model.distributor');

exports.getDistributorGames = function(req, res, next) {
    const distributorKey = req.params.distributorKey;
    
    const checkDistributorExistsQuery = `MATCH (distributor:Distributor{key:'${distributorKey}'}) return distributor`
    const gamesQuery = `MATCH (distributor:Distributor{key:'${distributorKey}'})-[link:Distributed]->(games: Game) 
                        RETURN distributor, games`;

    neoSession
    .run(checkDistributorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no Distributor with this key was found')
        } else { 
            const distributor = new Distributor(result.records[0].get('distributor').properties).values
            neoSession
            .run(gamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    distributor : distributor
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

exports.addDistributorGames = function(req, res, next) {
    const distributorKey = req.params.distributorKey;
    const gameKeys = req.body.gameKeys
    console.log('gamekeys', gameKeys)
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkDistributorExistsQuery = `MATCH (distributor:Distributor{key:'${distributorKey}'}) return distributor`

    const addGamesQuery = `MATCH  (distributor:Distributor{key:'${distributorKey}'}) 
                           MATCH  (games:Game) WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                           AND NOT (distributor)-[:Distributed]->(games)
                           CREATE UNIQUE (distributor)-[:Distributed]->(games) 
                           RETURN distributor, games `                        

    neoSession
    .run(checkDistributorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no distributor with this key was found')
        } else { 
            const distributor = new Distributor(result.records[0].get('distributor').properties).values
            neoSession
            .run(addGamesQuery)
            .then(result => {
                const response = {
                    addedGames : result.records.map(record => record.get('games').properties),
                    distributor : distributor
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

exports.removeDistributorGames = function(req, res, next) {
    const distributorKey = req.params.distributorKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return Utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkDistributorExistsQuery = `MATCH (distributor:Distributor{key:'${distributorKey}'}) return distributor`

    const removegamesQuery = `MATCH (distributor:Distributor{key:'${distributorKey}'})-[link:Distributed]->(games: Game) 
                              WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                              DELETE link
                              RETURN distributor, games`;

    neoSession
    .run(checkDistributorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            Utils.handleNoResultsResponse(req, res, 'Sorry, no distributor with this key was found')
        } else { 
            const distributor = new Distributor(result.records[0].get('distributor').properties).values
            neoSession
            .run(removegamesQuery)
            .then(result => {
                const response = {
                    removedGames : result.records.map(record => record.get('games').properties),
                    distributor : distributor
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