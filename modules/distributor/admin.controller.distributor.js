
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();

const Utils = require('../utils/utils');
const utils = new Utils();

const Distributor = require('./model.distributor');


// GET LIST OF ALL GAMES
exports.listDistributors = function(req, res, next) {
	let listOfDistributors = [];
	neoSession
		.run('MATCH (distributor:Distributor) RETURN distributor')
		.then(function(result){
			result.records.forEach(function(record){
				let distributor = new Distributor(record.get('distributor').properties);
				listOfDistributors.push(distributor.values);
			})
			res.json(listOfDistributors);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC Distributor
exports.getDistributor = function(req, res, next) {
	let distributorKey = req.params.distributorKey;
	neoSession
		.run("MATCH (distributor:Distributor)WHERE distributor.key='" + distributorKey +  "' RETURN distributor")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let distributor = result.records[0].get('distributor').properties;
				res.json(distributor);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW GAME
exports.createNewDistributor = function(req, res, next) {
    let newDistributor = new Distributor(req.body);
    if (newDistributor.error) {
		res.status(400).send(newDistributor.error);
		return
	}
	let key = req.body.name + randomstring.generate({ length: 10, charset: 'hex'})
	
	key = key.replace(/\s+/g, '')		// remove white space
	key = key.replace(/[^\w\s]/gi, '')	// remove special caracters

	newDistributor.values.key = key

    neoSession
    .run(`CREATE (distributor:Distributor {distributor}) RETURN distributor`, {distributor: newDistributor.values})
        .then(results => {
            let createdDistributor = results.records[0].get('distributor').properties;
            let message = {
                'status': 200,
                'message': 'distributor was created!',
                'distributor': createdDistributor
            }
            res.status(200).send(message);
            closeConnection()
          })
          .catch(function(err) {
            return next(err);
            closeConnection()
        })
}


// EDIT INFORMATION ON A SINGLE ILLUSTRATOR
exports.editDistributor = function(req, res, next) {
	
	let distributorKey = req.params.distributorKey;
	let distributor = new Distributor(req.body);
	
	distributor.values.key = req.params.distributorKey;
	distributor.values.key = distributor.values.key.replace(/\s+/g, '')		  // remove white space
	distributor.values.key = distributor.values.key.replace(/[^\w\s]/gi, '')  // remove special caracters

	if(distributor.error.unknownProperties) {
		res.status(400).send(distributor.error);
		return
	}

	let query = "MATCH (distributor:Distributor)WHERE distributor.key='" + distributorKey + "'";
	for (let property in distributor.values) {
		query += `SET distributor.${property} ="${distributor.values[property]}"`;
	}
	query += "RETURN distributor"

	console.log(query)

	neoSession
		.run(`MATCH (distributor:Distributor)WHERE distributor.key= "${distributorKey}" RETURN distributor`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedDistributor = new Distributor(results.records[0].get('distributor').properties);
						let message = {
							'status': 200,
							'message': 'distributor was edited!',
							'distributor': editedDistributor.values
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


// DELETE AN EDITOR
/*
* !! when deleting a node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteDistributor = function(req, res, next) {
	let distributorKey = req.params.distributorKey;
	let query = 'MATCH (distributor:Distributor{ key:"' + distributorKey + '"}) DETACH DELETE distributor return distributor';
	
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
				'message': 'distributor was deleted!'
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




/* DOC
* To prevent creation of link without a found node
https://stackoverflow.com/questions/44166057/neo4j-cypher-create-a-relationship-only-if-the-end-node-exists?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
*
*/