const { 
    LaporanKegiatan, LaporanModul, LaporanAbsensiMonitoring, 
    LaporanRps, LaporanKontrak, Jadwal, Kelas, Riwayat 
  } = require('../models');
  
  // === BAGIAN LAPORAN HARIAN ===
  
// === BAGIAN LAPORAN HARIAN ===

// Buat Laporan Kegiatan Harian (Beserta Bukti Modul & Monitoring)
exports.createLaporanHarian = async (req, res) => {
  try {
    const { id_jadwal, tanggal, pembuatan_modul, jumlah_modul } = req.body;
    
    // 1. Buat Header Laporan
    const laporan = await LaporanKegiatan.create({
      id_jadwal,
      tanggal,
      pembuatan_modul,
      jumlah_modul
    });

    // === PERBAIKAN: CATAT RIWAYAT ===
    if (req.user) {
        const actorId = req.user.id_users || req.user.id || req.user.userId;
        await Riwayat.create({
            id_users: actorId, 
            id_laporan: laporan.id_laporan, // Relasikan ke laporan
            aktivitas: `Menginput Laporan Harian (Modul: ${jumlah_modul})`,
            waktu_aktivitas: new Date()
        });
    }
    // ==============================

    res.status(201).json({ message: 'Laporan Kegiatan tersimpan', id_laporan: laporan.id_laporan });
  } catch (error) {
    console.error("Error createLaporanHarian:", error); // Membantu debug jika error lagi
    res.status(500).json({ message: error.message });
  }
};

// Upload Detail File (Modul/AbsMon)
exports.uploadBuktiLaporan = async (req, res) => {
  try {
    const { id_laporan, type } = req.body; // type: 'modul' or 'absmon'
    const filename = req.file ? req.file.filename : null;

    if (type === 'modul') {
      await LaporanModul.create({ 
        id_laporan, 
        file_modul: filename, 
        no_modul: req.body.no_modul 
      });
    } else {
      await LaporanAbsensiMonitoring.create({ 
        id_laporan, 
        jenis_file: 'Absensi', 
        file_absmon: filename 
      });
    }

    // === PERBAIKAN: CATAT RIWAYAT ===
    if (req.user) {
        const actorId = req.user.id_users || req.user.id || req.user.userId;
        await Riwayat.create({
            id_users: actorId,
            id_laporan: id_laporan,
            aktivitas: `Upload Bukti ${type === 'modul' ? 'Modul' : 'Absensi/Monitoring'}`,
            waktu_aktivitas: new Date()
        });
    }
    // ==============================

    res.json({ message: 'File berhasil diupload' });
  } catch (error) {
    console.error("Error uploadBuktiLaporan:", error); // Membantu debug jika error lagi
    res.status(500).json({ message: error.message });
  }
};
  
  // === BAGIAN DOKUMEN SEMESTER (RPS & KONTRAK) ===
  
  exports.uploadRps = async (req, res) => {
    try {
      const { id_jadwal } = req.body;
      const file = req.file ? req.file.filename : null;
  
      // Cek apakah sudah ada? (Upsert logic)
      const existing = await LaporanRps.findOne({ where: { id_jadwal } });
      if (existing) {
        existing.file_rps = file;
        existing.uploaded_at = new Date();
        await existing.save();
      } else {
        await LaporanRps.create({ id_jadwal, file_rps: file });
      }
  
      res.json({ message: 'RPS berhasil diupload' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.uploadKontrak = async (req, res) => {
    try {
      const { id_jadwal } = req.body;
      const file = req.file ? req.file.filename : null;
  
      const existing = await LaporanKontrak.findOne({ where: { id_jadwal } });
      if (existing) {
        existing.file_kontrak = file;
        existing.uploaded_at = new Date();
        await existing.save();
      } else {
        await LaporanKontrak.create({ id_jadwal, file_kontrak: file });
      }
  
      res.json({ message: 'Kontrak Kuliah berhasil diupload' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // === TAMBAHAN: GET DATA UNTUK MONITORING (KEPALA LABOR) ===

// 1. Ambil Laporan Harian berdasarkan Jadwal (Include Modul & AbsMon)
exports.getLaporanByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const laporan = await LaporanKegiatan.findAll({
      where: { id_jadwal },
      include: [
        { model: LaporanModul },           // Include detail modul
        { model: LaporanAbsensiMonitoring } // Include detail absensi/monitoring
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Ambil Status Dokumen Semester (RPS & Kontrak) Semua Jadwal
exports.getDokumenSemester = async (req, res) => {
  try {
    // Kita ambil dari tabel Jadwal, lalu include LaporanRps & LaporanKontrak
    const data = await Jadwal.findAll({
      include: [
        // { model: LaporanRps },
        // { model: LaporanKontrak },
        { 
          model: LaporanRps,
          as: 'LaporanRps', // <--- WAJIB SAMA dengan di models/jadwal.js
          required: false   // Tampilkan jadwal walau RPS belum ada
        },
        { 
          model: LaporanKontrak,
          as: 'LaporanKontrak', // <--- WAJIB SAMA dengan di models/jadwal.js
          required: false 
        },
        { 
          model: Kelas, 
          as: 'Kelas', // <--- WAJIB DITAMBAHKAN karena di model/jadwal.js ada aliasnya
          attributes: ['nama_mk', 'nama_kelas', 'hari_jam']
        } 
      ]
    });

    res.json(data);
  } catch (error) {
    console.error("Error getDokumenSemester:", error); // Log error biar jelas
    res.status(500).json({ message: error.message });
  }
};
// === TAMBAHAN BARU: GET DATA BY KELAS (UNTUK MENGATASI 2 ASISTEN) ===
exports.getLaporanByKelas = async (req, res) => {
  try {
    const { id_kelas } = req.params;

    // 1. Cari semua ID Jadwal yang terhubung dengan Kelas ini
    // (Misal: Kelas A punya Jadwal ID 101 (Asisten 1) dan Jadwal ID 102 (Asisten 2))
    const jadwalList = await Jadwal.findAll({
      where: { id_kelas: id_kelas },
      attributes: ['id_jadwal']
    });

    // Jika tidak ada jadwal ditemukan
    if (!jadwalList || jadwalList.length === 0) {
      return res.json([]);
    }

    // Ambil array ID-nya saja, contoh: [101, 102]
    const jadwalIds = jadwalList.map(item => item.id_jadwal);

    // 2. Cari semua laporan yang id_jadwal-nya ada di dalam list [101, 102]
    const laporan = await LaporanKegiatan.findAll({
      where: {
        id_jadwal: jadwalIds // Sequelize otomatis mengubah ini menjadi SQL "IN (...)"
      },
      include: [
        { model: LaporanModul },                // Include detail modul
        { model: LaporanAbsensiMonitoring }     // Include detail absensi/monitoring
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json(laporan);
  } catch (error) {
    console.error("Error getLaporanByKelas:", error);
    res.status(500).json({ message: error.message });
  }
};
// Menambahkan method baru: getLaporanAll
exports.getLaporanAll = async (req, res) => {
  try {
      // PERBAIKAN 1: Gunakan LaporanKegiatan (bukan LaporanHarian)
      const response = await LaporanKegiatan.findAll({
          include: [
            { 
              // PERBAIKAN 2: Include Jadwal dulu, baru di dalamnya include Kelas
              model: Jadwal,
              include: [{
                  model: Kelas,
                  as: 'Kelas', // Pastikan alias ini sesuai dengan models/index.js atau models/Jadwal.js
                  attributes: ['nama_mk', 'nama_kelas', 'kode_mk', 'hari_jam'] 
              }]
            },
            // PERBAIKAN 3: Include detail file agar tombol download di frontend berfungsi
            { model: LaporanModul },
            { model: LaporanAbsensiMonitoring }
          ],
          order: [['tanggal', 'DESC']]
      });
      res.status(200).json(response);
  } catch (error) {
      console.error("Error getLaporanAll:", error); // Log error ke terminal agar mudah debug
      res.status(500).json({ msg: error.message });
  }
}