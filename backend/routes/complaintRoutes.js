const express = require('express');
const { submitComplaint, getUserComplaints, getComplaintDetails, updateComplaintUser, requestCancel } = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/', protect, authorize('user'), upload.array('evidence', 5), submitComplaint);
router.get('/', protect, authorize('user'), getUserComplaints);
router.get('/:id', protect, getComplaintDetails);
router.put('/:id', protect, authorize('user'), updateComplaintUser);
router.put('/:id/request-cancel', protect, authorize('user'), requestCancel);

module.exports = router;
