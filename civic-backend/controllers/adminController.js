const Report = require('../models/Report');
const User = require('../models/User');
const Department = require('../models/Department');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReports,
      todayReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      activeStaff
    ] = await Promise.all([
      Report.countDocuments({ isDeleted: false }),
      Report.countDocuments({ 
        isDeleted: false,
        createdAt: { $gte: today }
      }),
      Report.countDocuments({ 
        isDeleted: false,
        status: { $in: ['submitted', 'acknowledged', 'assigned', 'in_progress'] }
      }),
      Report.countDocuments({ 
        isDeleted: false,
        status: 'resolved'
      }),
      User.countDocuments({ 
        isDeleted: false,
        role: 'citizen'
      }),
      User.countDocuments({ 
        isDeleted: false,
        isActive: true,
        role: { $in: ['staff', 'supervisor'] }
      })
    ]);

    const recentReports = await Report.find({ isDeleted: false })
      .populate('reporterId', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalReports,
          todayReports,
          pendingReports,
          resolvedReports,
          totalUsers,
          activeStaff
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

exports.getReportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, timeRange, groupBy = 'day' } = req.query;

    const matchQuery = { isDeleted: false };

    // Handle timeRange parameter (7, 30, 90 days)
    if (timeRange) {
      const days = parseInt(timeRange);
      const endDateTime = new Date();
      const startDateTime = new Date();
      startDateTime.setDate(endDateTime.getDate() - days);

      matchQuery.createdAt = {
        $gte: startDateTime,
        $lte: endDateTime
      };
    } else if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%V';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const analytics = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryAnalytics = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          pending: {
            $sum: { 
              $cond: [
                { $in: ['$status', ['submitted', 'acknowledged', 'assigned', 'in_progress']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeline: analytics,
        categories: categoryAnalytics
      }
    });
  } catch (error) {
    console.error('Get report analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report analytics',
      error: error.message
    });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;

    // Build match query for time-based filtering
    const matchQuery = { isDeleted: false };
    if (timeRange) {
      const days = parseInt(timeRange);
      const endDateTime = new Date();
      const startDateTime = new Date();
      startDateTime.setDate(endDateTime.getDate() - days);

      matchQuery.createdAt = {
        $gte: startDateTime,
        $lte: endDateTime
      };
    }

    const userStats = await User.aggregate([
      { $match: { isDeleted: false } }, // Keep all-time stats for user role distribution
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          }
        }
      }
    ]);

    // Apply time filtering to registration trend
    const registrationTrend = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: timeRange ? parseInt(timeRange) : 30 }
    ]);

    // Apply time filtering to top reporters as well
    const reportMatchQuery = { isDeleted: false };
    if (timeRange) {
      const days = parseInt(timeRange);
      const endDateTime = new Date();
      const startDateTime = new Date();
      startDateTime.setDate(endDateTime.getDate() - days);

      reportMatchQuery.createdAt = {
        $gte: startDateTime,
        $lte: endDateTime
      };
    }

    const topReporters = await Report.aggregate([
      { $match: reportMatchQuery },
      {
        $group: {
          _id: '$reporterId',
          reportCount: { $sum: 1 }
        }
      },
      { $sort: { reportCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          reportCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats,
        registrationTrend,
        topReporters
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { staffId, startDate, endDate } = req.query;

    const matchQuery = { isDeleted: false };

    if (staffId) {
      matchQuery.assignedTo = staffId;
    }

    if (startDate && endDate) {
      matchQuery.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const staffPerformance = await Report.aggregate([
      { $match: { ...matchQuery, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          avgResolutionTime: {
            $avg: '$actualResolutionTime'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $project: {
          name: '$staff.name',
          department: '$staff.department',
          totalAssigned: 1,
          resolved: 1,
          inProgress: 1,
          avgResolutionTime: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$totalAssigned'] },
              100
            ]
          }
        }
      },
      { $sort: { resolutionRate: -1 } }
    ]);

    const departmentPerformance = await Report.aggregate([
      { $match: { ...matchQuery, department: { $exists: true } } },
      {
        $group: {
          _id: '$department',
          totalReports: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          avgResolutionTime: {
            $avg: '$actualResolutionTime'
          }
        }
      },
      {
        $project: {
          department: '$_id',
          totalReports: 1,
          resolved: 1,
          avgResolutionTime: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$totalReports'] },
              100
            ]
          }
        }
      },
      { $sort: { totalReports: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        staffPerformance,
        departmentPerformance
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance metrics',
      error: error.message
    });
  }
};

exports.assignAreaToStaff = async (req, res) => {
  try {
    const { staffId, area } = req.body;

    const staff = await User.findById(staffId);

    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member'
      });
    }

    staff.assignedArea = area;
    staff.updatedBy = req.user._id;
    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Area assigned successfully',
      data: staff
    });
  } catch (error) {
    console.error('Assign area error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning area',
      error: error.message
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isDeleted: false })
      .populate('headOfDepartment', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, headOfDepartment } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required'
      });
    }

    const existingDept = await Department.findOne({
      $or: [{ name }, { code }],
      isDeleted: false
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    const department = await Department.create({
      name,
      code,
      description,
      categories,
      contactEmail,
      contactPhone,
      headOfDepartment,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, categories, contactEmail, contactPhone, headOfDepartment, isActive } = req.body;

    const department = await Department.findById(id);

    if (!department || department.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name && name !== department.name) {
      const existingDept = await Department.findOne({ name, isDeleted: false, _id: { $ne: id } });
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
      department.name = name;
    }

    if (code && code !== department.code) {
      const existingDept = await Department.findOne({ code, isDeleted: false, _id: { $ne: id } });
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
      department.code = code;
    }

    if (description !== undefined) department.description = description;
    if (categories !== undefined) department.categories = categories;
    if (contactEmail !== undefined) department.contactEmail = contactEmail;
    if (contactPhone !== undefined) department.contactPhone = contactPhone;
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment;
    if (isActive !== undefined) department.isActive = isActive;
    department.updatedBy = req.user._id;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department || department.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const staffCount = await User.countDocuments({
      department: department.code,
      isDeleted: false
    });

    if (staffCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${staffCount} staff member(s) are assigned to this department.`
      });
    }

    department.isDeleted = true;
    department.updatedBy = req.user._id;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

exports.createStaffUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, department, assignedArea } = req.body;

    if (!name || !email || !phone || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, password, role, and department are required'
      });
    }

    if (!['staff', 'supervisor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be staff, supervisor, or admin'
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
      isDeleted: false
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    const dept = await Department.findOne({ code: department, isDeleted: false });
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department code'
      });
    }

    const staffUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
      department,
      assignedArea,
      isVerified: true,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: staffUser
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff user',
      error: error.message
    });
  }
};