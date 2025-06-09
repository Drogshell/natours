const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, tourController.getAllTours) // .protect only allows users that are logged in to get all tours
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-tour-guide'),
        tourController.deleteTour
    );

module.exports = router;
