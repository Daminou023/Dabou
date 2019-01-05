import express, { Router } from 'express';

const router = express.Router();
const ReviewsController = require('./controller.reviews');


// GET LIST OF REVIEWS
router.route('/list')
	.get(ReviewsController.listReviews)


// CREATE NEW REVIEW
router.route('/new')
	.post(ReviewsController.createNewReview);


// CRUD ON SPECIFIC REVIEW
router.route('/:reviewKey')
  .get(ReviewsController.getReview)
  .put(ReviewsController.editReview)
  .delete(ReviewsController.deleteReview);


module.exports = router;