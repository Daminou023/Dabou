import express, { Router } from 'express';

const router = express.Router();
const AdminReviewsController = require('./admin.controller.reviews');


// GET LIST OF REVIEWS
router.route('/list')
	.get(AdminReviewsController.listReviews)


// CREATE NEW REVIEW
router.route('/new')
	.post(AdminReviewsController.createNewReview);


// CRUD ON SPECIFIC REVIEW
router.route('/:reviewKey')
  .get(AdminReviewsController.getReview)
  .put(AdminReviewsController.editReview)
  .delete(AdminReviewsController.deleteReview);


module.exports = router;