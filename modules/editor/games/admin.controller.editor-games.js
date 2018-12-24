import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Game          = require('../../games/model.games');
var Editor        = require('../model.editor');
const Utils 	  = require('../../utils/utils');

const utils = new Utils();

exports.getEditorGames = function(req, res, next) {
    const editorKey = req.params.editorKey;
    
    const checkEditorExistsQuery = `MATCH (editor:Editor{key:'${editorKey}'}) return editor`
    const gamesQuery = `MATCH (editor:Editor{key:'${editorKey}'})-[link:Edited]->(games: Game) 
                        RETURN editor, games`;

    neoSession
    .run(checkEditorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no Editor with this key was found')
        } else { 
            const editor = new Editor(result.records[0].get('editor').properties).values
            neoSession
            .run(gamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    editor : editor
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

exports.addEditorGames = function(req, res, next) {
    const editorKey = req.params.editorKey;
    const gameKeys = req.body.gameKeys
    console.log('gamekeys', gameKeys)
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkEditorExistsQuery = `MATCH (editor:Editor{key:'${editorKey}'}) return editor`

    const addGamesQuery = `MATCH  (editor:Editor{key:'${editorKey}'}) 
                           MATCH  (games:Game) WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                           AND NOT (editor)-[:Edited]->(games)
                           CREATE UNIQUE (editor)-[:Edited]->(games) 
                           RETURN editor, games `                        

    neoSession
    .run(checkEditorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no editor with this key was found')
        } else { 
            const editor = new Editor(result.records[0].get('editor').properties).values
            neoSession
            .run(addGamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    editor : editor
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

exports.removeEditorGames = function(req, res, next) {
    const editorKey = req.params.editorKey;
    const gameKeys = req.body.gameKeys
    if (!gameKeys || gameKeys.length <= 0 || gameKeys.constructor !== Array) return utils.handleBadRequestResponse(req, res,'Sorry, game keys must be a non empty array');

    const checkEditorExistsQuery = `MATCH (editor:Editor{key:'${editorKey}'}) return editor`

    const removegamesQuery = `MATCH (editor:Editor{key:'${editorKey}'})-[link:Edited]->(games: Game) 
                              WHERE games.key IN [${gameKeys.map(key => `'${key}'`)}]
                              DELETE link
                              RETURN editor, games`;

    neoSession
    .run(checkEditorExistsQuery)
    .then(result => {
        if (result.records.length == 0) {
            utils.handleNoResultsResponse(req, res, 'Sorry, no editor with this key was found')
        } else { 
            const editor = new Editor(result.records[0].get('editor').properties).values
            neoSession
            .run(removegamesQuery)
            .then(result => {
                const response = {
                    games : result.records.map(record => record.get('games').properties),
                    editor : editor
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