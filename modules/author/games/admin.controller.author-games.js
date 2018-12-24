import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Game          = require('../../games/model.games');
var Author        = require('../model.author');
const Utils 	  = require('../../utils/utils');

const utils = new Utils();

exports.getAuthorGames = function(req, res, next) {
    const authorKey = req.params.authorKey;
    
    const checkAuthorExistsQuery = `MATCH (author:Author{key:'${authorKey}'}) return author`
    const gamesQuery = `MATCH (author:Author{key:'${authorKey}'})-[link:authorOf]->(games: Game) 
                        RETURN author, games`;

    neoSession
    .run(checkAuthorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no Author with this key was found')
        } else { 
            const author = new Author(result.records[0].get('author').properties).values
            neoSession
            .run(gamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    author : author
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

exports.addAuthorGames = function(req, res, next) {
    const authorKey = req.params.authorKey;
    const gameKeys = req.body.gameKeys
    console.log('gamekeys', gameKeys)
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkAuthorExistsQuery = `MATCH (author:Author{key:'${authorKey}'}) return author`

    const addGamesQuery = `MATCH  (author:Author{key:'${authorKey}'}) 
                           MATCH  (games:Game) WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                           AND NOT (author)-[:authorOf]->(games)
                           CREATE UNIQUE (author)-[:authorOf]->(games) 
                           RETURN author, games `                        

    neoSession
    .run(checkAuthorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no author with this key was found')
        } else { 
            const author = new Author(result.records[0].get('author').properties).values
            neoSession
            .run(addGamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    author : author
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

exports.removeAuthorGames = function(req, res, next) {
    const authorKey = req.params.authorKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkAuthorExistsQuery = `MATCH (author:Author{key:'${authorKey}'}) return author`

    const removegamesQuery = `MATCH (author:Author{key:'${authorKey}'})-[link:authorOf]->(games: Game) 
                              WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                              DELETE link
                              RETURN author, games`;

    neoSession
    .run(checkAuthorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no author with this key was found')
        } else { 
            const author = new Author(result.records[0].get('author').properties).values
            neoSession
            .run(removegamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    author : author
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