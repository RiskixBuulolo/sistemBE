const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route Login
router.post('/login', authController.login);

// Flow Reset Password
router.post('/forgot-password', authController.forgotPassword); // Input Email -> Kirim OTP
router.post('/verify-otp', authController.verifyOtp);           // Input Email + OTP -> Cek Valid
router.post('/reset-password', authController.resetPassword);   // Input Email + OTP + Pass Baru -> Simpan

module.exports = router;