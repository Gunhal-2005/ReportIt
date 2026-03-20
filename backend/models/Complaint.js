const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policeStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  type: {
    type: String,
    enum: ['Harassment', 'Theft', 'Accident', 'Online Fraud', 'Office Harassment'],
    required: true
  },
  description: { type: String, required: true },
  address: { type: String, default: 'Address not provided' },
  phoneNumber: { type: String },
  evidence: [{ type: String }],
  status: {
    type: String,
    enum: ['Sent', 'Viewed', 'In Progress', 'Action Taken', 'Cancelled'],
    default: 'Sent'
  },
  cancelRequested: {
    type: Boolean,
    default: false
  },
  remarks: { type: String },
  assignedPoliceMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proofOfAction: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
