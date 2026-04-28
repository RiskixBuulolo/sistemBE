const { body, validationResult } = require('express-validator');

// Fungsi pembantu untuk mengecek hasil validasi
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Definisi Rules Validasi untuk Model-model Penting
module.exports = {
  // Validasi Register/Create User
  validateUser: [
    body('username').notEmpty().withMessage('Username wajib diisi'),
    body('email').isEmail().withMessage('Format email salah'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('role').isIn(['kepala_labor', 'staff_labor', 'asisten']).withMessage('Role tidak valid'),
    validate // Panggil fungsi cek error
  ],

  // Validasi Input Jadwal
  validateJadwal: [
    body('id_asisten').isInt().withMessage('ID Asisten harus angka'),
    body('id_kelas').isInt().withMessage('ID Kelas harus angka'),
    body('hari').notEmpty().withMessage('Hari wajib diisi'),
    body('waktu_dimulai').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format waktu harus HH:mm'),
    validate
  ],

  // Validasi Absensi
  validateAbsensi: [
    body('id_jadwal').notEmpty().withMessage('ID Jadwal wajib diisi'),
    body('latitude').notEmpty().withMessage('Lokasi wajib ada'),
    body('longitude').notEmpty().withMessage('Lokasi wajib ada'),
    validate
  ]
};