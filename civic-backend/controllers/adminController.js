const prisma = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await prisma.report.count({ where: { isDeleted: false } });
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
    
    const statusCounts = await prisma.report.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    const resolvedReports = await prisma.report.count({ 
      where: { status: 'resolved', isDeleted: false } 
    });

    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        totalUsers,
        statusCounts: Object.fromEntries(statusCounts.map(s => [s.status, s._count._all])),
        resolutionRate: parseFloat(resolutionRate.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

exports.getReportAnalytics = async (req, res) => {
  try {
    const categoryStats = await prisma.report.groupBy({
      by: ['category'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    res.status(200).json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    res.status(200).json({
      success: true,
      data: roleStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const avgResolution = await prisma.report.aggregate({
      where: { status: 'resolved', isDeleted: false },
      _avg: { actualResolutionTime: true }
    });

    res.status(200).json({
      success: true,
      data: {
        averageResolutionTimeHours: avgResolution._avg.actualResolutionTime || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignAreaToStaff = async (req, res) => {
  try {
    const { userId, area } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { assignedArea: area }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaffUser = async (req, res) => {
  // Implementation for creating staff
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isDeleted: false },
      include: {
        headOfDepartment: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, headOfDepartmentId, contactEmail, contactPhone } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        categories,
        headOfDepartmentId,
        contactEmail,
        contactPhone
      }
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, headOfDepartmentId, contactEmail, contactPhone, isActive } = req.body;

    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        description,
        categories,
        headOfDepartmentId,
        contactEmail,
        contactPhone,
        isActive
      }
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await prisma.department.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        isActive: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartmentUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        departmentName: req.params.deptName,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true
      }
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
