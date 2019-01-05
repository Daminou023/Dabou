
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
const Illustrator = require('./model.illustrator');


// GET LIST OF ALL GAMES
exports.listIllustrators = function(req, res, next) {
	let listOfIllustrators = [];
	neoSession
		.run('MATCH (illustrator:Illustrator) RETURN illustrator')
		.then(function(result){
			result.records.forEach(function(record){
				let illustrator = new Illustrator(record.get('illustrator').properties);
				listOfIllustrators.push(illustrator.values);
			})
			res.json(listOfIllustrators);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC Illustrator
exports.getIllustrator = function(req, res, next) {
	let illustratorKey = req.params.illustratorKey;
	neoSession
		.run("MATCH (illustrator:Illustrator)WHERE illustrator.key='" + illustratorKey +  "' RETURN illustrator")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let illustrator = result.records[0].get('illustrator').properties;
				res.json(illustrator);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW GAME
exports.createNewIllustrator = function(req, res, next) {
    let newIllustrator = new Illustrator(req.body);
    if (newIllustrator.error) {
		res.status(400).send(newIllustrator.error);
		return
	}
	let key = req.body.name + randomstring.generate({ length: 10, charset: 'hex'})
	
	key = key.replace(/\s+/g, '')		// remove white space
	key = key.replace(/[^\w\s]/gi, '')	// remove special caracters

	newIllustrator.values.key = key

    neoSession
    .run(`CREATE (illustrator:Illustrator {illustrator}) RETURN illustrator`, {illustrator: newIllustrator.values})
        .then(results => {
            let createdIllustrator = results.records[0].get('illustrator').properties;
            let message = {
                'status': 200,
                'message': 'illustrator was created!',
                'illustrator': createdIllustrator
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
exports.editIllustrator = function(req, res, next) {
	
	let illustratorKey = req.params.illustratorKey;
	let illustrator = new Illustrator(req.body);
	
	illustrator.values.key = req.params.illustratorKey;
	illustrator.values.key = illustrator.values.key.replace(/\s+/g, '')		  // remove white space
	illustrator.values.key = illustrator.values.key.replace(/[^\w\s]/gi, '')  // remove special caracters

	if(illustrator.error.unknownProperties) {
		res.status(400).send(illustrator.error);
		return
	}

	let query = "MATCH (illustrator:Illustrator)WHERE illustrator.key='" + illustratorKey + "'";
	for (let property in illustrator.values) {
		query += `SET illustrator.${property} ="${illustrator.values[property]}"`;
	}
	query += "RETURN illustrator"

	console.log(query)

	neoSession
		.run(`MATCH (illustrator:Illustrator)WHERE illustrator.key= "${illustratorKey}" RETURN illustrator`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedIllustrator = new Illustrator(results.records[0].get('illustrator').properties);
						let message = {
							'status': 200,
							'message': 'illustrator was edited!',
							'illustrator': editedIllustrator.values
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


// DELETE AN ILLUSTRATPR
/*
* !! when deleting a node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteIllustrator = function(req, res, next) {
	let illustratorKey = req.params.illustratorKey;
	let query = 'MATCH (illustrator:Illustrator{ key:"' + illustratorKey + '"}) DETACH DELETE illustrator return illustrator';
	
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
				'message': 'illustrator was deleted!'
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