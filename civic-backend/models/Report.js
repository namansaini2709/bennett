const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'road_issue',
      'water_supply',
      'electricity',
      'garbage',
      'drainage',
      'street_light',
      'traffic',
      'pollution',
      'encroachment',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'],
    default: 'submitted'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    locality: String,
    ward: String,
    city: String,
    pincode: String,
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: Date,
  department: {
    type: String,
    default: null
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNotes: String,
    beforeMedia: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }],
    afterMedia: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }]
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  estimatedResolutionTime: Date,
  actualResolutionTime: Number,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

reportSchema.index({ reporterId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ assignedTo: 1 });
reportSchema.index({ department: 1 });

reportSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const historyEntry = {
      status: this.status,
      changedBy: this.updatedBy || this.createdBy,
      changedAt: new Date()
    };
    
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    this.statusHistory.push(historyEntry);
  }
  next();
});

reportSchema.methods.calculateResolutionTime = function() {
  if (this.status === 'resolved' && this.resolution.resolvedAt) {
    const resolutionTime = Math.floor((this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60));
    this.actualResolutionTime = resolutionTime;
    return resolutionTime;
  }
  return null;
};

module.exports = mongoose.model('Report', reportSchema);