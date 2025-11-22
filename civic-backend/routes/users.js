const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const demoProtection = require('../middleware/demoProtection');

router.get('/', protect, authorize('admin', 'supervisor', 'demo'), userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, authorize('admin'), demoProtection, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), demoProtection, userController.deleteUser);
router.put('/:id/activate', protect, authorize('admin'), demoProtection, userController.activateUser);
router.put('/:id/deactivate', protect, authorize('admin'), demoProtection, userController.deactivateUser);

module.exports = router;