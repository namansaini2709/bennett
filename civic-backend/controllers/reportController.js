const Report = require('../models/Report');
const Media = require('../models/Media');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

exports.createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      location,
      priority,
      isAnonymous
    } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      location: {
        ...location,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      },
      priority: priority || 'medium',
      isAnonymous: isAnonymous || false,
      createdBy: req.user._id,
      statusHistory: [{
        status: 'submitted',
        changedBy: req.user._id,
        changedAt: new Date(),
        comment: 'Report submitted'
      }]
    });

    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'civic-reports',
          resource_type: 'auto'
        });

        const media = await Media.create({
          reportId: report._id,
          type: file.mimetype.startsWith('image') ? 'image' : 'video',
          url: result.secure_url,
          cloudinaryId: result.public_id,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user._id,
          createdBy: req.user._id
        });

        return media._id;
      });

      const mediaIds = await Promise.all(mediaPromises);
      report.media = mediaIds;
      await report.save();
    }

    const populatedReport = await Report.findById(report._id)
      .populate('reporterId', 'name email phone')
      .populate('media');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: populatedReport
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      category,
      priority,
      department,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;

    const sortOrder = order === 'asc' ? 1 : -1;

    let reportsQuery = Report.find(query)
      .populate('reporterId', 'name email phone')
      .populate('assignedTo', 'name email department')
      .populate('media')
      .sort({ [sortBy]: sortOrder });

    // Only apply pagination if page and limit are provided
    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      reportsQuery = reportsQuery.limit(parseInt(limit)).skip(skip);
    }

    const reports = await reportsQuery;
    const total = await Report.countDocuments(query);

    const response = {
      success: true,
      data: reports
    };

    // Only include pagination info if pagination was requested
    if (page && limit) {
      response.pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      };
    } else {
      response.total = total;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterId', 'name email phone')
      .populate('assignedTo', 'name email department')
      .populate('media')
      .populate('comments.user', 'name role')
      .populate('statusHistory.changedBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.viewCount += 1;
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      reporterId: req.user._id,
      isDeleted: false
    };

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate('media')
      .populate('assignedTo', 'name department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.reporterId.toString() !== req.user._id.toString() && 
        !['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update report after it has been processed'
      });
    }

    const { title, description, category, location, priority } = req.body;

    if (title) report.title = title;
    if (description) report.description = description;
    if (category) report.category = category;
    if (location) report.location = location;
    if (priority) report.priority = priority;
    
    report.updatedBy = req.user._id;

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('reporterId', 'name email phone')
      .populate('media');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('media');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Admin-only deletion (route already enforces this, but double-check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete reports'
      });
    }

    // Delete associated media from Cloudinary and database
    if (report.media && report.media.length > 0) {
      for (const media of report.media) {
        try {
          // Delete from Cloudinary
          if (media.cloudinaryId) {
            await cloudinary.uploader.destroy(media.cloudinaryId);
          }
          // Delete from database
          await Media.findByIdAndDelete(media._id);
        } catch (mediaError) {
          console.error('Error deleting media:', mediaError);
          // Continue with report deletion even if media deletion fails
        }
      }
    }

    // HARD DELETE: Permanently remove from database
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report permanently deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const oldStatus = report.status;
    report.status = status;
    report.updatedBy = req.user._id;

    report.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      comment: comment || `Status changed from ${oldStatus} to ${status}`
    });

    if (status === 'resolved') {
      report.resolution = {
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        resolutionNotes: comment
      };
      report.calculateResolutionTime();
    }

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('statusHistory.changedBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: error.message
    });
  }
};

exports.assignReport = async (req, res) => {
  try {
    const { staffId, department } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const staff = await User.findById(staffId);

    if (!staff || !['staff', 'supervisor'].includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member'
      });
    }

    report.assignedTo = staffId;
    report.assignedBy = req.user._id;
    report.assignedAt = new Date();
    report.department = department || staff.department;
    report.status = 'assigned';
    report.updatedBy = req.user._id;

    report.statusHistory.push({
      status: 'assigned',
      changedBy: req.user._id,
      changedAt: new Date(),
      comment: `Assigned to ${staff.name}`
    });

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('assignedTo', 'name email department');

    res.status(200).json({
      success: true,
      message: 'Report assigned successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning report',
      error: error.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text, isInternal } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const canAddInternalComment = ['staff', 'supervisor', 'admin'].includes(req.user.role);

    report.comments.push({
      user: req.user._id,
      text,
      isInternal: canAddInternalComment && isInternal
    });

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('comments.user', 'name role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

exports.upvoteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const userIndex = report.upvotes.indexOf(req.user._id);

    if (userIndex > -1) {
      report.upvotes.splice(userIndex, 1);
    } else {
      report.upvotes.push(req.user._id);
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? 'Upvote removed' : 'Report upvoted',
      data: {
        upvotes: report.upvotes.length
      }
    });
  } catch (error) {
    console.error('Upvote report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing upvote',
      error: error.message
    });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the reporter can provide feedback'
      });
    }

    if (report.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided for resolved reports'
      });
    }

    report.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: report.feedback
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

exports.getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    const reports = await Report.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distance',
          maxDistance: radiusInKm * 1000,
          spherical: true,
          query: { isDeleted: false }
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    await Report.populate(reports, [
      { path: 'reporterId', select: 'name' },
      { path: 'media' }
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby reports',
      error: error.message
    });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { isDeleted: false };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: '$status'
          },
          byCategory: {
            $push: '$category'
          },
          byPriority: {
            $push: '$priority'
          },
          avgResolutionTime: {
            $avg: '$actualResolutionTime'
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          avgResolutionTime: 1,
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byStatus'] },
                as: 'status',
                in: {
                  k: '$$status',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byStatus',
                        cond: { $eq: ['$$this', '$$status'] }
                      }
                    }
                  }
                }
              }
            }
          },
          categoryCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byCategory'] },
                as: 'category',
                in: {
                  k: '$$category',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byCategory',
                        cond: { $eq: ['$$this', '$$category'] }
                      }
                    }
                  }
                }
              }
            }
          },
          priorityCounts: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$byPriority'] },
                as: 'priority',
                in: {
                  k: '$$priority',
                  v: {
                    $size: {
                      $filter: {
                        input: '$byPriority',
                        cond: { $eq: ['$$this', '$$priority'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        total: 0,
        statusCounts: {},
        categoryCounts: {},
        priorityCounts: {},
        avgResolutionTime: 0
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
};

exports.addMedia = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No media files provided'
      });
    }

    const mediaPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'civic-reports',
        resource_type: 'auto'
      });

      const media = await Media.create({
        reportId: report._id,
        type: file.mimetype.startsWith('image') ? 'image' : 'video',
        url: result.secure_url,
        cloudinaryId: result.public_id,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: req.user._id,
        createdBy: req.user._id
      });

      return media._id;
    });

    const mediaIds = await Promise.all(mediaPromises);
    report.media.push(...mediaIds);
    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('media');

    res.status(200).json({
      success: true,
      message: 'Media added successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding media',
      error: error.message
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    await cloudinary.uploader.destroy(media.cloudinaryId);

    media.isDeleted = true;
    media.isActive = false;
    await media.save();

    report.media = report.media.filter(m => m.toString() !== mediaId);
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media',
      error: error.message
    });
  }
};