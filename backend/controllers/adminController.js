const User = require('../models/User');
const Complaint = require('../models/Complaint');
const PoliceStation = require('../models/PoliceStation');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email');

// Analytics Dashboard
exports.getAnalytics = async (req, res) => {
  try {
     const { year } = req.query;
     
     let dateFilter = {};
     if (year && year !== 'All') {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        dateFilter.createdAt = { $gte: startOfYear, $lte: endOfYear };
     }
     
     const total = await Complaint.countDocuments(dateFilter);
     const pending = await Complaint.countDocuments({ ...dateFilter, status: { $in: ['Sent', 'Viewed', 'In Progress'] } });
     const solved = await Complaint.countDocuments({ ...dateFilter, status: 'Action Taken' });
     const cancelled = await Complaint.countDocuments({ ...dateFilter, status: 'Cancelled' });
     res.json({ total, pending, solved, cancelled });
  } catch(err) {
     res.status(500).json({ message: err.message });
  }
};

// Manage Police Stations
exports.getStations = async (req, res) => {
   try {
      const stations = await PoliceStation.find();
      res.json(stations);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.addStation = async (req, res) => {
   try {
      const station = await PoliceStation.create(req.body);
      res.json(station);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.updateStation = async (req, res) => {
   try {
      const station = await PoliceStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(station);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStation = async (req, res) => {
   try {
      const { transferTo } = req.query;
      const station = await PoliceStation.findById(req.params.id);
      if(!station) return res.status(404).json({ message: 'Station not found' });
      
      // Transfer complaints if a target station is selected
      if (transferTo) {
         // Re-route complaints and strip any individual officer assignments 
         // so the new Station Head has full control to assign their own team
         await Complaint.updateMany(
            { policeStationId: station._id },
            { 
                $set: { 
                   policeStationId: transferTo,
                   assignedPoliceMemberId: null 
                } 
            }
         );
         
         // Un-assign officers belonging to the deleted station
         await User.updateMany(
            { policeStationId: station._id },
            { $set: { policeStationId: null } }
         );
      }
      
      await PoliceStation.findByIdAndDelete(req.params.id);
      res.json({ message: 'Station deleted successfully' });
   } catch(err) { res.status(500).json({ message: err.message }); }
};

// Manage Police Members
exports.getPolice = async (req, res) => {
   try {
      const policeUsers = await User.find({ role: { $in: ['police', 'station_head'] } }).populate('policeStationId', 'name');
      res.json(policeUsers);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.addPolice = async (req, res) => {
   try {
      const { name, email, password, role, policeStationId } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'Email already exists' });
      
      if (role === 'station_head' && policeStationId) {
         const existingHead = await User.findOne({ policeStationId, role: 'station_head' });
         if (existingHead) return res.status(400).json({ message: 'This station already has a Station Head. You must transfer or demote them first.' });
      }
      
      const user = await User.create({ name, email, password, role: role || 'police', policeStationId });
      res.json(user);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.updatePolice = async (req, res) => {
   try {
      const { name, email, password, role, policeStationId } = req.body;
      const police = await User.findById(req.params.id);
      if(!police) return res.status(404).json({ message: 'Police not found' });
      
      if (role === 'station_head' && policeStationId) {
         const existingHead = await User.findOne({ 
             policeStationId, 
             role: 'station_head', 
             _id: { $ne: police._id } 
         });
         if (existingHead) return res.status(400).json({ message: 'The target station already has a Station Head.' });
      }
      
      if (role) police.role = role;
      if (name) police.name = name;
      if (email) police.email = email;
      if (policeStationId !== undefined) {
         police.policeStationId = policeStationId || null; // Allow unassigning
      }
      if (password) {
          police.password = password; 
      }
      
      // If a replacement head was provided, systematically promote them
      if (req.query.replacementHeadId) {
         const newHead = await User.findById(req.query.replacementHeadId);
         if (newHead) {
            newHead.role = 'station_head';
            await newHead.save();
         }
      }
      
      await police.save();
      res.json(police);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.deletePolice = async (req, res) => {
   try {
      const { transferToUserId, transferToStationId } = req.query;
      const user = await User.findById(req.params.id);
      if(!user) return res.status(404).json({ message: 'Police member not found' });
      
      if (transferToUserId) {
         const targetUser = await User.findById(transferToUserId);
         if (targetUser) {
            await Complaint.updateMany(
               { assignedPoliceMemberId: user._id },
               { $set: { assignedPoliceMemberId: targetUser._id, policeStationId: targetUser.policeStationId } }
            );
         }
      } 
      else if (transferToStationId) {
         await Complaint.updateMany(
            { assignedPoliceMemberId: user._id },
            { $set: { assignedPoliceMemberId: null, policeStationId: transferToStationId } }
         );
      } 
      else {
         // Default safely fallback to their original Station Head
         await Complaint.updateMany(
            { assignedPoliceMemberId: user._id },
            { $set: { assignedPoliceMemberId: null } }
         );
      }
      
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'Police member removed and cases reassigned' });
   } catch(err) { res.status(500).json({ message: err.message }); }
};

// View All Complaints
exports.getAllComplaints = async (req, res) => {
   try {
      const complaints = await Complaint.find()
        .populate('userId', 'name email')
        .populate('policeStationId', 'name')
        .sort('-createdAt');
      res.json(complaints);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.assignStationToComplaint = async (req, res) => {
   try {
      const complaint = await Complaint.findById(req.params.id);
      if(!complaint) return res.status(404).json({ message: 'Complaint not found' });
      
      const newStationId = req.body.policeStationId;
      
      const hasHead = await User.findOne({ policeStationId: newStationId, role: 'station_head' });
      if (!hasHead) return res.status(400).json({ message: 'Target station must have a Station Head before accepting assignments.' });
      
      if (complaint.policeStationId?.toString() !== newStationId) {
         complaint.policeStationId = newStationId;
         complaint.assignedPoliceMemberId = null; // Unassign old officer so new Head gets it
      }
      
      await complaint.save();
      
      res.json(complaint);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.sendNotificationToPolice = async (req, res) => {
   try {
      const complaint = await Complaint.findById(req.params.id)
        .populate('assignedPoliceMemberId', 'name email')
        .populate('policeStationId', 'name');
        
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      
      let targetEmail, targetName;
      
      if (complaint.assignedPoliceMemberId) {
         targetEmail = complaint.assignedPoliceMemberId.email;
         targetName = complaint.assignedPoliceMemberId.name;
      } else if (complaint.policeStationId) {
         // Default to station head
         const head = await User.findOne({ policeStationId: complaint.policeStationId._id, role: 'station_head' });
         if (!head) return res.status(400).json({ message: 'No officer or Station Head assigned to notify!' });
         targetEmail = head.email;
         targetName = head.name;
      } else {
         return res.status(400).json({ message: 'No station has been assigned yet!' });
      }
      
      await sendEmail({
         email: targetEmail,
         subject: 'URGENT: Action Required on Open Complaint',
         message: `Hello ${targetName},\n\nThe administrative system has flagged an urgent check-in requirement regarding an un-actioned complaint in your queue:\n\nIncident: ${complaint.type}\nLocation: ${complaint.address}\n\nPlease log into the ReportIt system immediately to provide updates and submit Proof of Action.\n\nThank you,\nReportIt Admin Team`
      });
      
      res.json({ message: 'Notification warning sent successfully' });
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.cancelComplaint = async (req, res) => {
   try {
      const complaint = await Complaint.findById(req.params.id).populate('userId', 'email name');
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ message: 'An explicit cancellation reason must be provided.' });
      
      complaint.status = 'Cancelled';
      complaint.cancelRequested = false; // Resolved
      complaint.assignedPoliceMemberId = null; // Unassign so it doesn't clutter police dashboards
      
      await complaint.save();
      
      try {
         await sendEmail({
            email: complaint.userId.email,
            subject: 'NOTICE: ReportIt Complaint Cancelled',
            message: `Hello ${complaint.userId.name},\n\nYour complaint filed regarding the incident of "${complaint.type}" has been officially cancelled by an administrator.\n\nReason for cancellation:\n"${reason}"\n\nIf you believe this is an administrative mistake, please file a new case from your dashboard or contact our support desk immediately.\n\nRegards,\nReportIt System Admin`
         });
      } catch (emailErr) {
         console.log('Failed to send cancellation email:', emailErr);
      }
      
      res.json({ message: 'Complaint cancelled successfully and notice dispatched', complaint });
   } catch(err) { res.status(500).json({ message: err.message }); }
};

// Block/Unblock users
exports.getUsers = async (req, res) => {
   try {
      const users = await User.find({ role: 'user' });
      res.json(users);
   } catch(err) { res.status(500).json({ message: err.message }); }
}

exports.toggleUserBlock = async (req, res) => {
   try {
      const user = await User.findById(req.params.id);
      if(!user) return res.status(404).json({ message: 'User not found' });
      
      const willBeBlocked = !user.isBlocked;
      user.isBlocked = willBeBlocked;
      await user.save();
      
      if (willBeBlocked) {
         try {
            await sendEmail({
               email: user.email,
               subject: 'URGENT: Your ReportIt Account is Suspended',
               message: `Hello ${user.name},\n\nYour account has been officially suspended by ReportIt administrators due to abnormal activities or violations of our platform's policies.\n\nYou will no longer be able to log in, file complaints, or monitor history until your account is reinstated.\n\nIf you believe this is an error, please reach out directly to support.\n\nRegards,\nReportIt Trust & Safety Team`
            });
         } catch (emailErr) {
            console.log('Error dispatching ban email:', emailErr);
         }
      } else {
         try {
            await sendEmail({
               email: user.email,
               subject: 'NOTICE: Your ReportIt Account is Reinstated',
               message: `Hello ${user.name},\n\nWe sincerely apologize for any mistake on our end regarding your recent account suspension.\n\nYour account has now been fully reinstated by the ReportIt administrators. You may log back into the system normally and resume filing your cases.\n\nThank you for your patience,\nReportIt Trust & Safety Team`
            });
         } catch (emailErr) {
            console.log('Error dispatching unban email:', emailErr);
         }
      }
      
      res.json(user);
   } catch(err) { res.status(500).json({ message: err.message }); }
};
