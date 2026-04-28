const express = require('express');
const router = express.Router();

// === 1. IMPORT CONTROLLERS ===
const userController = require('../controllers/userController');
const kelasController = require('../controllers/kelasController');
const jadwalController = require('../controllers/jadwalController');
const absensiController = require('../controllers/absensiController');
const laporanController = require('../controllers/laporanController');
const authController = require('../controllers/authController');
const riwayatController = require('../controllers/riwayatController');
const dashboardController = require('../controllers/dashboardController'); 


// === 2. IMPORT MIDDLEWARE ===
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { uploadAbsen, uploadDokumen } = require('../middleware/uploadMiddleware');

// ==================================================================
// ROUTE IMPLEMENTATION
// ==================================================================

// --- A. MANAJEMEN USER ---
router.get('/profile/me', verifyToken, userController.getMyProfile);
router.put('/profile/me', verifyToken, userController.updateMyProfile);
router.get('/users', verifyToken, checkRole(['kepala_labor', 'staff_labor']), userController.getAllUsers);
router.post('/users', verifyToken, checkRole(['kepala_labor', 'staff_labor']), userController.createUser);
router.put('/users/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), userController.updateUser);
router.delete('/users/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), userController.deleteUser);


// --- B. MANAJEMEN KELAS ---
router.get('/kelas', verifyToken, kelasController.getAllKelas);
router.post('/kelas', verifyToken, checkRole(['kepala_labor', 'staff_labor']), kelasController.createKelas);
// === TAMBAHKAN ROUTE CLEAR-ALL DI SINI (SEBELUM :id) ===
router.delete('/kelas/clear-all', verifyToken, checkRole(['kepala_labor', 'staff_labor']), kelasController.deleteAllKelas);
router.put('/kelas/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), kelasController.updateKelas);
router.delete('/kelas/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), kelasController.deleteKelas);
// === TAMBAHAN BARU DISINI ===
// Pastikan menggunakan uploadDokumen.single('file_excel') agar req.file terbaca di controller
router.post('/kelas/import', verifyToken, checkRole(['kepala_labor', 'staff_labor']), uploadDokumen.single('file_excel'), kelasController.importKelasExcel);

// --- C. MANAJEMEN JADWAL ---
router.get('/jadwal', verifyToken, jadwalController.getJadwal);
router.post('/jadwal', verifyToken, checkRole(['kepala_labor', 'staff_labor']), jadwalController.createJadwal);
router.put('/jadwal/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), jadwalController.updateJadwal);
router.delete('/jadwal/:id', verifyToken, checkRole(['kepala_labor', 'staff_labor']), jadwalController.deleteJadwal);

// --- D. ABSENSI (ASISTEN) ---
router.post('/absensi', verifyToken, uploadAbsen.single('foto_absensi'), absensiController.submitAbsensi);
// [TAMBAHAN BARU: Route untuk mengambil SEMUA data absensi]
router.get('/absensi', verifyToken, absensiController.getAllAbsensi);
router.get('/absensi/jadwal/:id_jadwal', verifyToken, absensiController.getAbsensiByJadwal);
// [TAMBAHAN BARU]
router.delete('/absensi/:id', verifyToken, absensiController.deleteAbsensi);

// --- E. LAPORAN & DOKUMEN ---
// 1. Header Laporan (JSON Biasa)
router.post('/laporan/harian', verifyToken, laporanController.createLaporanHarian);
// Pastikan rute ini ditaruh SEBELUM rute /harian/kelas/:id agar tidak bentrok
router.get('/harian', verifyToken, laporanController.getLaporanAll);
router.get('/harian/kelas/:id_kelas', verifyToken, laporanController.getLaporanByKelas);
// 2. Upload Bukti (Modul/Absen)
// Frontend: formData.append('file_bukti', file)
router.post('/laporan/bukti', verifyToken, uploadDokumen.single('file_bukti'), laporanController.uploadBuktiLaporan);
// 3. Upload RPS
// Frontend: formData.append('file_rps', file)
router.post('/laporan/rps', verifyToken, uploadDokumen.single('file_rps'), laporanController.uploadRps);
// 4. Upload Kontrak
// Frontend: formData.append('file_kontrak', file)
router.post('/laporan/kontrak', verifyToken, uploadDokumen.single('file_kontrak'), laporanController.uploadKontrak);
router.get('/harian/:id_jadwal', laporanController.getLaporanByJadwal);
router.get('/semester', verifyToken, laporanController.getDokumenSemester);


// --- F. DASHBOARD (STATISTIK) --- [BAGIAN BARU INI]
// Route ini khusus untuk Kepala Labor melihat ringkasan
router.get('/dashboard/kepala/summary', 
    verifyToken, 
    checkRole(['kepala_labor']), // Hanya Kepala Labor yang boleh akses
    dashboardController.getKepalaSummary
);

// --- TAMBAHKAN INI DI BAWAHNYA ---
router.get('/dashboard/asisten/summary', 
    verifyToken, 
    checkRole(['asisten']), // Hanya Asisten
    dashboardController.getAsistenSummary
);

// 3. STAFF LABOR (TAMBAHAN PENTING INI)
router.get('/dashboard/staff/summary', 
    verifyToken, 
    checkRole(['staff_labor']), // Hanya Staff
    dashboardController.getStaffSummary // Pastikan controller ini ada (kita buat di step sebelumnya)
);


// --- G. AUTHENTICATION (Public Routes) ---
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/reset-password', authController.resetPassword);

// --- H. RIWAYAT AKTIVITAS ---
router.get('/riwayat', 
    verifyToken, 
    checkRole(['kepala_labor']), // Hanya Kepala Labor yang boleh lihat log
    riwayatController.getAllRiwayat
);

// === TAMBAHAN BARU: Route untuk menghapus semua riwayat ===
router.delete('/riwayat/clear-all', 
    verifyToken, 
    checkRole(['kepala_labor']), // Pastikan hanya Kepala Labor yang bisa menghapus
    riwayatController.clearAllRiwayat
);

module.exports = router;