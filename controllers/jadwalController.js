const { Jadwal, User, DataAsisten, Kelas, Riwayat, LaporanRps, LaporanKontrak, LaporanKegiatan } = require('../models');

// GET JADWAL (Sudah dilengkapi Filter Otomatis per Role)
// GET JADWAL (Logika Filter Role Anda sudah Bagus)
exports.getJadwal = async (req, res) => {
  try {
    let whereCondition = {};
    const userRole = req.user.role; 
    const userId = req.user.id_users;

    if (userRole === 'asisten') {
      const asistenProfile = await DataAsisten.findOne({ where: { id_users: userId } });
      if (!asistenProfile) return res.json({ message: "Profil asisten belum ditemukan", data: [] });
      whereCondition = { id_asisten: asistenProfile.id_asisten };
    } else {
      if (req.query.asisten_id) whereCondition = { id_asisten: req.query.asisten_id };
    }

    const jadwal = await Jadwal.findAll({
      where: whereCondition,
      include: [
        { 
          model: DataAsisten,
          include: [{ model: User, attributes: ['nama_lengkap'] }] 
        },
        { 
            model: Kelas,
            as: 'Kelas',
            attributes: ['nama_mk', 'nama_kelas', 'hari_jam', 'ruangan', 'nama_dosen']
        },
        // === TAMBAHAN UNTUK TAB STATUS FRONTEND ===
        { 
            model: LaporanRps, 
            as: 'LaporanRps', // Pastikan alias sesuai dengan asosiasi di model/index.js
            required: false 
        },
        { 
            model: LaporanKontrak, 
            as: 'LaporanKontrak', // Pastikan alias sesuai dengan asosiasi di model/index.js
            required: false 
        },
        { 
            model: LaporanKegiatan, 
            as: 'LaporanKegiatans', // Biasanya Sequelize menambah 's' jika relasi hasMany. Jika error, coba hapus 's' menjadi 'LaporanKegiatan'
            required: false 
        }
        // ==========================================
      ],
      order: [['createdAt', 'DESC']], 
    });

    res.json({ message: "Berhasil memuat data jadwal", data: jadwal });

  } catch (error) {
    console.error("Error getJadwal:", error); // Tambahkan ini biar gampang kalau ada error
    res.status(500).json({ message: error.message });
  }
};

// CREATE JADWAL
exports.createJadwal = async (req, res) => {
  try {
    // Catatan: frontend saat ini hanya mengirim id_asisten dan id_kelas
    const { id_asisten, id_kelas } = req.body;
    
    const checkAsisten = await DataAsisten.findByPk(id_asisten);
    if (!checkAsisten) return res.status(404).json({ message: 'Asisten tidak ditemukan' });

    const checkKelas = await Kelas.findByPk(id_kelas);
    if (!checkKelas) return res.status(404).json({ message: 'Kelas tidak ditemukan' });

    // 1. VALIDASI DOUBLE ASSIGN (Apakah asisten sudah ada di kelas ini?)
    const existingAssign = await Jadwal.findOne({ where: { id_asisten, id_kelas } });
    if (existingAssign) {
      return res.status(400).json({ message: 'Asisten tersebut sudah ditugaskan pada kelas ini!' });
    }

    // 2. VALIDASI BENTROK JADWAL (Apakah hari_jam sama?)
    if (checkKelas.hari_jam) {
      const jadwalAsisten = await Jadwal.findAll({
        where: { id_asisten },
        include: [{
          model: Kelas,
          as: 'Kelas',
          attributes: ['nama_mk', 'hari_jam']
        }]
      });

      // Cari apakah ada kelas lain milik asisten ini yang hari_jam-nya persis sama
      const bentrok = jadwalAsisten.find(j => j.Kelas && j.Kelas.hari_jam === checkKelas.hari_jam);
      
      if (bentrok) {
        return res.status(400).json({ 
          message: `Jadwal bentrok! Asisten ini sudah dijadwalkan pada mata kuliah ${bentrok.Kelas.nama_mk} di waktu yang sama (${checkKelas.hari_jam}).` 
        });
      }
    }

    const newJadwal = await Jadwal.create({
      id_asisten, id_kelas
    });

    await Riwayat.create({
        id_users: req.user.id_users, 
        aktivitas: `Menugaskan Asisten ID ${id_asisten} ke Kelas ID ${id_kelas}`,
        waktu_aktivitas: new Date(),
        id_laporan: null
    });

    res.status(201).json({ message: 'Asisten berhasil ditugaskan ke kelas ini', data: newJadwal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE JADWAL
exports.updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_asisten, id_kelas } = req.body;

    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    const checkKelas = await Kelas.findByPk(id_kelas);
    if (!checkKelas) return res.status(404).json({ message: 'Kelas tidak ditemukan' });

    // 1. VALIDASI DOUBLE ASSIGN (Kecuali jadwal ini sendiri)
    const existingAssign = await Jadwal.findOne({ where: { id_asisten, id_kelas } });
    if (existingAssign && existingAssign.id_jadwal !== parseInt(id)) {
      return res.status(400).json({ message: 'Asisten tersebut sudah ditugaskan pada kelas ini!' });
    }

    // 2. VALIDASI BENTROK JADWAL SAAT EDIT
    if (checkKelas.hari_jam) {
      const jadwalAsisten = await Jadwal.findAll({
        where: { id_asisten },
        include: [{
          model: Kelas,
          as: 'Kelas',
          attributes: ['nama_mk', 'hari_jam']
        }]
      });

      // Pastikan jadwal yang sedang diedit tidak dihitung bentrok dengan dirinya sendiri
      const bentrok = jadwalAsisten.find(j => 
        j.id_jadwal !== parseInt(id) && 
        j.Kelas && 
        j.Kelas.hari_jam === checkKelas.hari_jam
      );
      
      if (bentrok) {
        return res.status(400).json({ 
          message: `Update dibatalkan! Asisten sudah ada kelas ${bentrok.Kelas.nama_mk} pada ${checkKelas.hari_jam}.` 
        });
      }
    }

    // Update data (hapus variabel hari, waktu_dimulai, dll karena tidak dikirim frontend)
    await jadwal.update({ id_asisten, id_kelas });

    await Riwayat.create({
      id_users: req.user.id_users,
      aktivitas: `Mengubah Jadwal ID ${id} (Ganti Asisten/Kelas)`,
      waktu_aktivitas: new Date()
    });

    res.json({ message: "Penugasan jadwal berhasil diperbarui", data: jadwal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE JADWAL
exports.deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const jadwal = await Jadwal.findByPk(id);

    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    await jadwal.destroy();

    // === TAMBAHAN: CATAT RIWAYAT ===
    await Riwayat.create({
      id_users: req.user.id_users,
      aktivitas: `Menghapus Penugasan Jadwal ID ${id}`,
      waktu_aktivitas: new Date()
  });
  // ==============================

    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};