const Complaint = require('../models/Complaint');
const sendEmail = require('../utils/email');
const User = require('../models/User');

exports.getStationComplaints = async (req, res) => {
  try {
    let query = { policeStationId: req.user.policeStationId };
    if (req.user.role === 'police') {
       query.assignedPoliceMemberId = req.user._id;
    }
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedPoliceMemberId', 'name')
      .sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { status, remarks, assignedPoliceMemberId } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'email name');
    
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.policeStationId.toString() !== req.user.policeStationId.toString()) {
      return res.status(403).json({ message: 'Not authorized for this complaint' });
    }
    if (req.user.role === 'police' && complaint.assignedPoliceMemberId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    if (status) complaint.status = status;
    if (remarks) complaint.remarks = remarks;
    if (assignedPoliceMemberId) complaint.assignedPoliceMemberId = assignedPoliceMemberId;
    
    if (req.files && req.files.length > 0) {
       const proofs = req.files.map(f => f.path);
       complaint.proofOfAction = [...complaint.proofOfAction, ...proofs];
    }

    await complaint.save();

    // Send email to user if status changed
    if (status) {
      try {
         await sendEmail({
           email: complaint.userId.email,
           subject: 'Complaint Status Updated',
           message: `Hello ${complaint.userId.name},\n\nYour complaint status has been updated to "${status}".\n\nRemarks: ${remarks || complaint.remarks || 'None'}\n\nReportIt Team`
         });
      } catch(err) {
         console.log('Update email error', err);
      }
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPoliceMembers = async (req, res) => {
  try {
     const members = await User.find({ role: 'police', policeStationId: req.user.policeStationId }).select('name email _id');
     res.json(members);
  } catch(err) {
     res.status(500).json({ message: err.message });
  }
};
