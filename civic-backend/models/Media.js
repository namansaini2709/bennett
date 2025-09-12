const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: function() {
      return this.type === 'video';
    }
  },
  width: Number,
  height: Number,
  caption: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

mediaSchema.index({ reportId: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ createdAt: -1 });

mediaSchema.methods.generateThumbnail = function() {
  if (this.type === 'video' && this.url) {
    const urlParts = this.url.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    this.thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0.0,w_300,h_200,c_fill/${publicId}.jpg`;
  } else if (this.type === 'image') {
    const urlParts = this.url.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    this.thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_150,h_150,c_thumb/${publicId}.jpg`;
  }
};

module.exports = mongoose.model('Media', mediaSchema);