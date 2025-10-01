const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'supervisor'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/reports/analytics', adminController.getReportAnalytics);
router.get('/users/analytics', adminController.getUserAnalytics);
router.get('/performance', adminController.getPerformanceMetrics);

router.post('/staff/assign-area', authorize('admin'), adminController.assignAreaToStaff);
router.post('/staff/create', authorize('admin'), adminController.createStaffUser);

router.get('/departments', adminController.getDepartments);
router.post('/departments', authorize('admin'), adminController.createDepartment);
router.put('/departments/:id', authorize('admin'), adminController.updateDepartment);
router.delete('/departments/:id', authorize('admin'), adminController.deleteDepartment);

module.exports = router;