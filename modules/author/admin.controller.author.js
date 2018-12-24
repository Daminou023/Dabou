
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();

const Utils = require('../utils/utils');
const utils = new Utils();

const Author = require('./model.author');


// GET LIST OF ALL GAMES
exports.listAuthors = function(req, res, next) {
	let listOfAuthors = [];
	neoSession
		.run('MATCH (author:Author) RETURN author')
		.then(function(result){
			result.records.forEach(function(record){
				let author = new Author(record.get('author').properties);
				listOfAuthors.push(author.values);
			})
			res.json(listOfAuthors);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC Author
exports.getAuthor = function(req, res, next) {
	let authorKey = req.params.authorKey;
	neoSession
		.run("MATCH (author:Author)WHERE author.key='" + authorKey +  "' RETURN author")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let author = result.records[0].get('author').properties;
				res.json(author);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW GAME
exports.createNewAuthor = function(req, res, next) {
    let newAuthor = new Author(req.body);
    if (newAuthor.error) {
		res.status(400).send(newAuthor.error);
		return
	}
	let key = req.body.name + randomstring.generate({ length: 10, charset: 'hex'})
	
	key = key.replace(/\s+/g, '')		// remove white space
	key = key.replace(/[^\w\s]/gi, '')	// remove special caracters

	newAuthor.values.key = key

    neoSession
    .run(`CREATE (author:Author {author}) RETURN author`, {author: newAuthor.values})
        .then(results => {
            let createdAuthor = results.records[0].get('author').properties;
            let message = {
                'status': 200,
                'message': 'author was created!',
                'author': createdAuthor
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
exports.editAuthor = function(req, res, next) {
	
	let authorKey = req.params.authorKey;
	let author = new Author(req.body);
	
	author.values.key = req.params.authorKey;
	author.values.key = author.values.key.replace(/\s+/g, '')		  // remove white space
	author.values.key = author.values.key.replace(/[^\w\s]/gi, '')  // remove special caracters

	if(author.error.unknownProperties) {
		res.status(400).send(author.error);
		return
	}

	let query = "MATCH (author:Author)WHERE author.key='" + authorKey + "'";
	for (let property in author.values) {
		query += `SET author.${property} ="${author.values[property]}"`;
	}
	query += "RETURN author"

	console.log(query)

	neoSession
		.run(`MATCH (author:Author)WHERE author.key= "${authorKey}" RETURN author`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedAuthor = new Author(results.records[0].get('author').properties);
						let message = {
							'status': 200,
							'message': 'author was edited!',
							'author': editedAuthor.values
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


// DELETE AN AUTHOR
/*
* !! when deleting a node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteAuthor = function(req, res, next) {
	let authorKey = req.params.authorKey;
	let query = 'MATCH (author:Author{ key:"' + authorKey + '"}) DETACH DELETE author return author';
	
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
				'message': 'author was deleted!'
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