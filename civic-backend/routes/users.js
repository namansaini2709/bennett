const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'supervisor'), userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);
router.put('/:id/activate', protect, authorize('admin'), userController.activateUser);
router.put('/:id/deactivate', protect, authorize('admin'), userController.deactivateUser);

module.exports = router;