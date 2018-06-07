import express, { Router } from 'express';

const router = express.Router();
const AdminReviewsController = require('./admin.controller.reviews');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminReviewsController.listReviews)


router.route('/new')
	.post(AdminReviewsController.createNewReview);


router.route('/:reviewKey')
  .get(AdminReviewsController.getReview)
  .put(AdminReviewsController.editReview)
  .delete(AdminReviewsController.deleteReview);


module.exports = router;