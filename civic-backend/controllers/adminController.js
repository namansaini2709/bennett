const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReports,
      totalUsers,
      todayReports,
      pendingReports,
      resolvedReports,
      activeStaff,
      statusCounts,
      recentReports
    ] = await Promise.all([
      prisma.report.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.report.count({ 
        where: { 
          isDeleted: false,
          createdAt: { gte: today }
        } 
      }),
      prisma.report.count({ 
        where: { 
          isDeleted: false,
          status: { notIn: ['resolved', 'rejected', 'closed'] }
        } 
      }),
      prisma.report.count({ 
        where: { status: 'resolved', isDeleted: false } 
      }),
      prisma.user.count({ 
        where: { 
          isDeleted: false, 
          role: { in: ['staff', 'supervisor'] },
          isActive: true
        } 
      }),
      prisma.report.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: { _all: true }
      }),
      prisma.report.findMany({
        where: { isDeleted: false },
        include: {
          reporter: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      })
    ]);

    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    const stats = {
      totalReports,
      todayReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      activeStaff,
      resolutionRate: parseFloat(resolutionRate.toFixed(2)),
      statusCounts: Object.fromEntries(statusCounts.map(s => [s.status, s._count._all]))
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentReports
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
    const { timeRange } = req.query;
    const where = { isDeleted: false };
    
    if (timeRange && timeRange !== 'all') {
      const days = parseInt(timeRange);
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.createdAt = { gte: date };
    }

    const [categoryStats, dailyStats] = await Promise.all([
      prisma.report.groupBy({
        by: ['category'],
        where,
        _count: { _all: true }
      }),
      // For PostgreSQL, we can use a more efficient grouping for the timeline
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as "_id",
          COUNT(*)::int as "total"
        FROM "Report"
        WHERE "isDeleted" = false
        ${timeRange && timeRange !== 'all' ? Prisma.sql`AND "createdAt" >= ${where.createdAt.gte}` : Prisma.empty}
        GROUP BY 1
        ORDER BY 1 ASC
      `
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categoryStats.map(s => ({ _id: s.category, count: s._count._all })),
        timeline: dailyStats
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
    const where = { isDeleted: false };
    
    if (timeRange && timeRange !== 'all') {
      const days = parseInt(timeRange);
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.createdAt = { gte: date };
    }

    const [roleStats, dailyReg, topReporters] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        where: { isDeleted: false },
        _count: { 
          _all: true,
          isActive: true, // This is a bit of a hack as Prisma groupBy doesn't directly support conditional counts easily without multiple queries
        }
      }),
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as "_id",
          COUNT(*)::int as "count"
        FROM "User"
        WHERE "isDeleted" = false
        ${timeRange && timeRange !== 'all' ? Prisma.sql`AND "createdAt" >= ${where.createdAt.gte}` : Prisma.empty}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.report.groupBy({
        by: ['reporterId'],
        where: { isDeleted: false },
        _count: { _all: true },
        orderBy: { _count: { reporterId: 'desc' } },
        take: 10
      })
    ]);

    // Fetch reporter names for topReporters
    const reporterIds = topReporters.map(r => r.reporterId);
    const reporters = await prisma.user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, name: true }
    });

    const reporterMap = Object.fromEntries(reporters.map(r => [r.id, r.name]));

    // For roleStats, we need more detail than groupBy gives easily
    // Let's do a more detailed manual aggregation or separate counts if needed
    const detailedRoleStats = await Promise.all(
      ['admin', 'supervisor', 'staff', 'citizen'].map(async (role) => {
        const [count, active, verified] = await Promise.all([
          prisma.user.count({ where: { role, isDeleted: false } }),
          prisma.user.count({ where: { role, isDeleted: false, isActive: true } }),
          prisma.user.count({ where: { role, isDeleted: false, isVerified: true } })
        ]);
        return { _id: role, count, active, verified };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        userStats: detailedRoleStats,
        registrationTrend: dailyReg,
        topReporters: topReporters.map(r => ({
          name: reporterMap[r.reporterId] || 'Unknown',
          reportCount: r._count._all
        }))
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
