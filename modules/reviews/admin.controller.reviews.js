
// CONFIGURE NEO4J DRIVER
var randomstring  = require("randomstring");
const neo4j 	  = require('neo4j-driver').v1;
var neoDriver 	  = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456789"));
var neoSession 	  = neoDriver.session();
var Review 		  = require('./model.review');


// GET LIST OF ALL REVIEWS
exports.listReviews = function(req, res, next) {
	let listOfReviews = [];
	neoSession
		.run('MATCH (review:Review) RETURN review')
		.then(function(result){
			result.records.forEach(function(record){
				let review = new Review(record.get('review').properties);
				listOfReviews.push(review.values);
			})
			res.json(listOfReviews);
			closeConnection()
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}

// GET SPECIFIC REVIEW
exports.getReview = function(req, res, next) {
	let reviewKey = req.params.reviewKey;
	neoSession
		.run("MATCH (review:Review)WHERE review.key='" + reviewKey +  "' RETURN review")
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				let review = result.records[0].get('review').properties;
				res.json(review);
				closeConnection()
			}
		})
		.catch(function(err) {
			return next(err);
			closeConnection()
		});
}


// CREATE A NEW REVIEW
exports.createNewReview = function(req, res, next) {
	let newReview = new Review(req.body);
	
	
	// createReviewLink


    if (newReview.error) {
		res.status(400).send(newReview.error);
		return
	}
	let key = req.body.title.substring(0,8) + Date.now() + randomstring.generate({ length: 10, charset: 'hex'})
	key = key.replace(/\s+/g, '')	// remove whiteSpaces
	newReview.values.key = key
	
	neoSession
			.run("MATCH (review:Review)WHERE review.key='" + newReview.values.name +  "' RETURN review")
			.then(results => {
				if (results.records.length > 0) {
    				let message = {
							'status': 400,
							'message': "sorry, somehow this key is already taken!"
						}
					res.status(400).send(message);
				}
				else {
					neoSession
					.run(
						`CREATE (review:Review {review}) RETURN review`, {review: newReview.values})
			        	.then(results => {
							let createdReview = results.records[0].get('review').properties;
			            	let message = {
			            		'status': 200,
			            		'message': 'review was added!',
			            		'review': createdReview
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
				closeConnection();
			});
}


// EDIT INFORMATION ON A SINGLE REVIEWS
exports.editReview = function(req, res, next) {
	
	let review = new Review(req.body);
	review.values.key = req.params.reviewKey;

	if(review.error.unknownProperties) {
		res.status(400).send(review.error);
		return
	}

	let query = "MATCH (review:Review)WHERE review.key='" + review.values.key + "'";
	for (let property in review.values) {
		query += `SET review.${property} ="${review.values[property]}"`;
	}
	query += "RETURN review"

	console.log(query)

	neoSession
		.run(`MATCH (review:Review)WHERE review.key= "${review.values.key}" RETURN review`)
		.then(result => {
			if (result.records.length == 0) {
				handleNoResultsResponse(req, res)
			} else {
				neoSession
					.run(query)
					.then(results => {
						let editedReview = new Review(results.records[0].get('review').properties);
						let message = {
							'status': 200,
							'message': 'review was edited!',
							'user': editedReview.values
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


// DELETE A REVIEW
/*
* !! when deleting a review, or any node, do not forget to 
* delete all links to that node before you delete it!
*/
exports.deleteReview = function(req, res, next) {
	let reviewKey = req.params.reviewKey;
	let query = 'MATCH (review:Review { key:"' + reviewKey + '"}) DETACH DELETE review return review';
	
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
				'message': 'review was deleted!'
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
