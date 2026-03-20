const Complaint = require('../models/Complaint');
const PoliceStation = require('../models/PoliceStation');
const { calculateDistance } = require('../utils/haversine');
const sendEmail = require('../utils/email');

exports.submitComplaint = async (req, res) => {
  try {
    const { type, description, address, phoneNumber } = req.body;
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) return res.status(400).json({ message: 'A valid 10-digit phone number is required.' });
    
    const evidence = req.files ? req.files.map(f => f.path) : [];

    // Find stations for keyword matching
    const stations = await PoliceStation.find();
    let matchedStation = null;
    
    // Keyword match logic based on address
    const searchAddress = address ? address.toLowerCase() : '';
    
    for (const station of stations) {
      const stationName = station.name.toLowerCase();
      // Look for the main identifying word, e.g. "Kodambakkam" from "Kodambakkam Police Station"
      const keywords = stationName.replace('police', '').replace('station', '').trim().split(' ').filter(k => k.length > 3);
      
      const isMatch = keywords.some(keyword => searchAddress.includes(keyword));
      if (isMatch) {
         matchedStation = station;
         break;
      }
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      policeStationId: matchedStation ? matchedStation._id : undefined,
      type,
      description,
      address,
      phoneNumber,
      evidence
    });

    // Notify user
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Complaint Submitted Successfully',
        message: `Your complaint regarding "${type}" has been submitted successfully.\n\nAssigned Station: ${matchedStation ? matchedStation.name : 'Pending Admin Assignment'}\nStatus: Sent`
      });
    } catch (err) {
      console.log('Email error:', err);
    }

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .populate('policeStationId', 'name')
      .sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaintUser = async (req, res) => {
   try {
      const { type, description, address, phoneNumber } = req.body;
      
      if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
         return res.status(400).json({ message: 'A valid 10-digit phone number is required.' });
      }
      
      const complaint = await Complaint.findById(req.params.id);
      
      if(!complaint) return res.status(404).json({ message: 'Complaint not found' });
      if(complaint.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });
      
      if(complaint.status !== 'Sent') {
         return res.status(400).json({ message: 'Cannot edit a complaint after it has been viewed or processed by the authorities.' });
      }
      
      if (type) complaint.type = type;
      if (description) complaint.description = description;
      if (address) complaint.address = address;
      if (phoneNumber) complaint.phoneNumber = phoneNumber;
      
      await complaint.save();
      res.json(complaint);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.requestCancel = async (req, res) => {
   try {
      const complaint = await Complaint.findById(req.params.id);
      if(!complaint) return res.status(404).json({ message: 'Not found' });
      if(complaint.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });
      
      if(complaint.status === 'Action Taken' || complaint.status === 'Cancelled') {
         return res.status(400).json({ message: 'Cannot cancel a completed or previously cancelled complaint.' });
      }
      
      complaint.cancelRequested = true;
      await complaint.save();
      res.json(complaint);
   } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.getComplaintDetails = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('policeStationId', 'name address');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Determine whether the user is authorized to view
    if (req.user.role === 'user' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // For police/station_head, check if complaint belongs to their station
    if (['police', 'station_head'].includes(req.user.role) && req.user.policeStationId.toString() !== complaint.policeStationId._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this station' });
    }
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
