const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/updateprofile', protect, authController.updateProfile);
router.put('/updatepassword', protect, authController.updatePassword);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);
router.post('/verify/:token', authController.verifyEmail);
router.post('/refresh', authController.refreshToken);

module.exports = router;