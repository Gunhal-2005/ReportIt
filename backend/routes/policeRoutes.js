const express = require('express');
const { getStationComplaints, updateComplaint, getPoliceMembers } = require('../controllers/policeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.use(protect, authorize('police', 'station_head'));

router.get('/complaints', getStationComplaints);
router.put('/complaints/:id', upload.array('proofOfAction', 5), updateComplaint);
router.get('/members', getPoliceMembers);

module.exports = router;
