const prisma = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await prisma.report.count({ where: { isDeleted: false } });
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });

    // Get today's reports
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReports = await prisma.report.count({
      where: {
        isDeleted: false,
        createdAt: { gte: today }
      }
    });

    // Get pending reports (submitted, acknowledged, assigned, in_progress)
    const pendingReports = await prisma.report.count({
      where: {
        isDeleted: false,
        status: { in: ['submitted', 'acknowledged', 'assigned', 'in_progress'] }
      }
    });

    const resolvedReports = await prisma.report.count({
      where: { status: 'resolved', isDeleted: false }
    });

    const activeStaff = await prisma.user.count({
      where: {
        isDeleted: false,
        isActive: true,
        role: { in: ['staff', 'supervisor'] }
      }
    });

    const statusCountsRaw = await prisma.report.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    const recentReports = await prisma.report.findMany({
      where: { isDeleted: false },
      include: {
        reporter: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Format for frontend
    const stats = {
      totalReports,
      todayReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      activeStaff,
      statusCounts: Object.fromEntries(statusCountsRaw.map(s => [s.status, s._count._all]))
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
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
    const { timeRange } = req.query;
    let where = { isDeleted: false };

    if (timeRange && timeRange !== 'all') {
      const days = parseInt(timeRange);
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.createdAt = { gte: date };
    }

    // 1. Categories stats
    const categoryStats = await prisma.report.groupBy({
      by: ['category'],
      where,
      _count: { _all: true }
    });

    // 2. Timeline stats (Daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reports = await prisma.report.findMany({
      where: { ...where, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true }
    });

    const timelineMap = {};
    reports.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      if (!timelineMap[date]) timelineMap[date] = { _id: date, total: 0, statusCounts: [] };
      timelineMap[date].total++;

      let statusEntry = timelineMap[date].statusCounts.find(s => s.status === r.status);
      if (!statusEntry) {
        statusEntry = { status: r.status, count: 0 };
        timelineMap[date].statusCounts.push(statusEntry);
      }
      statusEntry.count++;
    });

    const timeline = Object.values(timelineMap).sort((a, b) => a._id.localeCompare(b._id));

    res.status(200).json({
      success: true,
      data: {
        categories: categoryStats.map(c => ({ _id: c.category, count: c._count._all })),
        timeline
      }
    });
  } catch (error) {
    console.error('Report analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    let where = { isDeleted: false };

    // 1. User role distribution
    const roleStatsRaw = await prisma.user.groupBy({
      by: ['role'],
      where,
      _count: { _all: true }
    });

    // Add active/verified info (simplified for now)
    const userStats = await Promise.all(roleStatsRaw.map(async (roleStat) => {
      const active = await prisma.user.count({
        where: { role: roleStat.role, isActive: true, isDeleted: false }
      });
      const verified = await prisma.user.count({
        where: { role: roleStat.role, isVerified: true, isDeleted: false }
      });
      return {
        _id: roleStat.role,
        count: roleStat._count._all,
        active,
        verified
      };
    }));

    // 2. Registration Trend (Monthly for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const registrations = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, isDeleted: false },
      select: { createdAt: true }
    });

    const trendMap = {};
    registrations.forEach(u => {
      const month = u.createdAt.toLocaleString('default', { month: 'short' });
      trendMap[month] = (trendMap[month] || 0) + 1;
    });

    const registrationTrend = Object.entries(trendMap).map(([month, count]) => ({
      _id: month,
      count
    }));

    // 3. Top Reporters
    const topReportersRaw = await prisma.report.groupBy({
      by: ['reporterId'],
      where: { isDeleted: false },
      _count: { _all: true },
      orderBy: { _count: { reporterId: 'desc' } },
      take: 10
    });

    const topReporters = await Promise.all(topReportersRaw.map(async (r) => {
      const user = await prisma.user.findUnique({
        where: { id: r.reporterId },
        select: { name: true }
      });
      return {
        name: user?.name || 'Anonymous',
        reportCount: r._count._all
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        userStats,
        registrationTrend,
        topReporters
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
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

// ── AI Bulk Reprioritization ──

exports.bulkReprioritize = async (req, res) => {
  try {
    const { bulkReprioritize } = require('../services/aiPrioritization');
    const { limit = 50 } = req.query;

    const results = await bulkReprioritize({ limit: parseInt(limit) });

    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    res.status(200).json({
      success: true,
      message: `Bulk reprioritization complete: ${succeeded} succeeded, ${failed} failed`,
      data: {
        total: results.length,
        succeeded,
        failed,
        results
      }
    });
  } catch (error) {
    console.error('Bulk reprioritize error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during bulk reprioritization',
      error: error.message
    });
  }
};

