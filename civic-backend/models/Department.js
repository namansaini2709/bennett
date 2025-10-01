const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a department name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide a department code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    enum: ['road_issue', 'water_supply', 'electricity', 'garbage', 'drainage', 'street_light', 'traffic', 'pollution', 'encroachment', 'other']
  }],
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactEmail: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  contactPhone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

departmentSchema.index({ isActive: 1 });

departmentSchema.methods.toJSON = function() {
  const department = this.toObject();
  return department;
};

module.exports = mongoose.model('Department', departmentSchema);