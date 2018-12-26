
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();

const Editor = require('./model.editor');


// GET LIST OF ALL GAMES
exports.listEditors = function(req, res, next) {
	let listOfEditors = [];
	neoSession
		.run('MATCH (editor:Editor) RETURN editor')
		.then(function(result){
			result.records.forEach(function(record){
				let editor = new Editor(record.get('editor').properties);
				listOfEditors.push(editor.values);
			})
			res.json(listOfEditors);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC Editor
exports.getEditor = function(req, res, next) {
	let editorKey = req.params.editorKey;
	neoSession
		.run("MATCH (editor:Editor)WHERE editor.key='" + editorKey +  "' RETURN editor")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let editor = result.records[0].get('editor').properties;
				res.json(editor);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW GAME
exports.createNewEditor = function(req, res, next) {
    let newEditor = new Editor(req.body);
    if (newEditor.error) {
		res.status(400).send(newEditor.error);
		return
	}
	let key = req.body.name + randomstring.generate({ length: 10, charset: 'hex'})
	
	key = key.replace(/\s+/g, '')		// remove white space
	key = key.replace(/[^\w\s]/gi, '')	// remove special caracters

	newEditor.values.key = key

    neoSession
    .run(`CREATE (editor:Editor {editor}) RETURN editor`, {editor: newEditor.values})
        .then(results => {
            let createdEditor = results.records[0].get('editor').properties;
            let message = {
                'status': 200,
                'message': 'editor was created!',
                'editor': createdEditor
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
exports.editEditor = function(req, res, next) {
	
	let editorKey = req.params.editorKey;
	let editor = new Editor(req.body);
	
	editor.values.key = req.params.editorKey;
	editor.values.key = editor.values.key.replace(/\s+/g, '')		  // remove white space
	editor.values.key = editor.values.key.replace(/[^\w\s]/gi, '')  // remove special caracters

	if(editor.error.unknownProperties) {
		res.status(400).send(editor.error);
		return
	}

	let query = "MATCH (editor:Editor)WHERE editor.key='" + editorKey + "'";
	for (let property in editor.values) {
		query += `SET editor.${property} ="${editor.values[property]}"`;
	}
	query += "RETURN editor"

	console.log(query)

	neoSession
		.run(`MATCH (editor:Editor)WHERE editor.key= "${editorKey}" RETURN editor`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedEditor = new Editor(results.records[0].get('editor').properties);
						let message = {
							'status': 200,
							'message': 'editor was edited!',
							'editor': editedEditor.values
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
exports.deleteEditor = function(req, res, next) {
	let editorKey = req.params.editorKey;
	let query = 'MATCH (editor:Editor{ key:"' + editorKey + '"}) DETACH DELETE editor return editor';
	
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
				'message': 'editor was deleted!'
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