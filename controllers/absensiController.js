const fs = require('fs');
const path = require('path');
const { Absensi, Jadwal, Riwayat, Kelas, DataAsisten, User } = require('../models');
const { Op } = require('sequelize'); // <--- TAMBAHKAN IMPORT INI
// 1. IMPORT Helper Hitung Jarak
const calculateDistance = require('../utils/geofence'); 

// GET HISTORY ABSENSI (Per Jadwal)
exports.getAbsensiByJadwal = async (req, res) => {
  try {
    const absensi = await Absensi.findAll({
      where: { id_jadwal: req.params.id_jadwal }
    });
    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHECK-IN / ABSEN
exports.submitAbsensi = async (req, res) => {
  try {
    const { id_jadwal, status, latitude, longitude } = req.body;
    
    // 1. CEK APAKAH SUDAH ABSEN HARI INI?
    const today = new Date().toISOString().slice(0, 10);
    
    const existingAbsen = await Absensi.findOne({
      where: {
        id_jadwal: id_jadwal,
        tanggal: today
      }
    });

    if (existingAbsen) {
      return res.status(400).json({ 
        message: "Anda sudah melakukan absensi untuk jadwal ini hari ini!" 
      });
    }

    // 2. VALIDASI INPUT FILE
    if (!req.file) return res.status(400).json({ message: "Foto bukti wajib diupload!" });
    const foto = req.file.filename;

    // 3. CEK GPS
    if (!latitude || !longitude) return res.status(400).json({ message: "GPS Wajib diaktifkan!" });

    // === [BARU] 4. CEK KETERLAMBATAN ===
    let finalStatus = status;
    
    // Ambil info jadwal dan kelas untuk mengetahui jam masuk
    const jadwalInfo = await Jadwal.findByPk(id_jadwal, {
        include: [{ model: Kelas, as: 'Kelas' }]
    });

    if (!jadwalInfo) return res.status(404).json({ message: "Jadwal tidak ditemukan!" });

    // Jika asisten memilih "Hadir", kita cek apakah dia terlambat
    if (status === 'Hadir') {
        const hariJamStr = jadwalInfo.Kelas?.hari_jam || jadwalInfo.hari_jam || '';
        
        // Regex untuk menangkap jam, contoh "Senin 08:45 - 10:25" -> dapat "08:45"
        const timeMatch = hariJamStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        
        if (timeMatch) {
            const startTimeStr = timeMatch[1]; // "08:45"
            const [startHour, startMinute] = startTimeStr.split(':').map(Number);
            
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            
            // Konversi waktu ke hitungan menit dari tengah malam agar mudah dihitung
            const startTotalMinutes = (startHour * 60) + startMinute;
            const currentTotalMinutes = (currentHour * 60) + currentMinute;
            
            // Atur toleransi keterlambatan (misal: 15 menit dari jam mulai)
            // Jika ingin 0 menit toleransi, ubah angka 15 menjadi 0
            const tolerance = 15; 
            
            if (currentTotalMinutes > (startTotalMinutes + tolerance)) {
                finalStatus = 'Hadir - Terlambat';
            }
        }
    }
    // ===================================

    // 5. LOGIKA GEOFENCING
    const labLat = parseFloat(process.env.LAB_LATITUDE);
    const labLon = parseFloat(process.env.LAB_LONGITUDE);
    const maxRadius = parseInt(process.env.ABSENSI_RADIUS || 50);

    const distance = calculateDistance(
      parseFloat(latitude), parseFloat(longitude), labLat, labLon
    );
    let lokasi_valid = distance <= maxRadius;

    // 6. SIMPAN KE DATABASE (Gunakan finalStatus)
    const absen = await Absensi.create({
      id_jadwal,
      tanggal: today,
      waktu_absen: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      status: finalStatus, // <-- Gunakan status yang sudah divalidasi
      foto_absensi: foto,
      latitude,
      longitude,
      lokasi_valid
    });

    // 7. CATAT KE RIWAYAT
    let userIdToLog = req.user?.id_users || jadwalInfo.id_users;

    if (userIdToLog) {
        await Riwayat.create({
            id_users: userIdToLog,
            aktivitas: `Melakukan Absensi (Status: ${finalStatus}) - Jarak: ${Math.floor(distance)}m`,
            waktu_aktivitas: new Date(),
            id_laporan: null
        });
    }

    res.status(201).json({ 
      message: lokasi_valid ? 'Absensi berhasil' : 'Absensi berhasil (Diluar Radius)', 
      jarak_meter: Math.floor(distance),
      data: absen 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// [TAMBAHAN BARU] HAPUS ABSENSI
exports.deleteAbsensi = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID dari parameter URL

    // 1. Cari data absensi dulu
    const absen = await Absensi.findByPk(id);

    if (!absen) {
      return res.status(404).json({ message: "Data absensi tidak ditemukan" });
    }

    // 2. Hapus file foto dari folder uploads (Opsional, tapi disarankan)
    if (absen.foto_absensi) {
      const filePath = path.join(__dirname, '../uploads', absen.foto_absensi);
      // Cek apakah file ada, lalu hapus
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Hapus data dari database
    await absen.destroy();

    res.json({ message: "Data absensi berhasil dihapus" });

  } catch (error) {
    console.error("Error delete absensi:", error);
    res.status(500).json({ message: "Gagal menghapus data absensi" });
  }
};
// Tambahkan method ini di dalam absensiController.js

exports.getAllAbsensi = async (req, res) => {
  try {
      // Kita ambil data Absensi dan hubungkan (JOIN) dengan Jadwal -> Kelas & User
      // Sesuaikan nama model (Absensi, Jadwal, Kelas, User, DataAsisten) dengan model Anda
      const data = await Absensi.findAll({
          order: [['tanggal', 'DESC'], ['waktu_absen', 'DESC']], // Urutkan dari yang terbaru
          include: [
              {
                  model: Jadwal,
                  include: [
                      {
                          model: Kelas,
                          as:'Kelas',
                          attributes: ['nama_mk', 'nama_kelas', 'hari_jam']
                      },
                      {
                          model: DataAsisten,
                          include: [
                              {
                                  model: User,
                                  attributes: ['nama_lengkap']
                              }
                          ]
                      }
                  ]
              }
          ]
      });

      return res.status(200).json({
          status: 'success',
          data: data
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          status: 'error',
          message: 'Terjadi kesalahan server saat mengambil semua data absensi.'
      });
  }
};