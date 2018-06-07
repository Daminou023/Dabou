import { link } from "fs";

// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Event 		  = require('../model.event');
var EventLinks    = require('../model.eventLinks');

exports.getInvitations = function(req, res, next) {

}

exports.changeInvitations  = function(req, res, next) {

}

exports.deleteInvitations = function(req, res, next) {

}