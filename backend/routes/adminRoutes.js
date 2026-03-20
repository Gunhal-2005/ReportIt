const express = require('express');
const { getAnalytics, getStations, addStation, updateStation, deleteStation, getPolice, addPolice, updatePolice, deletePolice, getAllComplaints, assignStationToComplaint, sendNotificationToPolice, cancelComplaint, getUsers, toggleUserBlock } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);

// Stations
router.route('/stations').get(getStations).post(addStation);
router.route('/stations/:id').put(updateStation).delete(deleteStation);

// Police Members
router.route('/police').get(getPolice).post(addPolice);
router.route('/police/:id').put(updatePolice).delete(deletePolice);

// Users
router.route('/users').get(getUsers);
router.route('/users/:id/toggle-block').put(toggleUserBlock);

// Complaints
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/assign', assignStationToComplaint);
router.post('/complaints/:id/notify', sendNotificationToPolice);
router.put('/complaints/:id/cancel', cancelComplaint);

module.exports = router;
