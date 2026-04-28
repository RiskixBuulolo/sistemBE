const { User, DataAsisten, Riwayat, Jadwal } = require('../models');
const bcrypt = require('bcryptjs');

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ 
        model: DataAsisten,
        // === TAMBAHKAN BAGIAN INI (NESTED INCLUDE) ===
        include: [
          {
            model: Jadwal,
            attributes: ['id_jadwal'] // Kita hanya butuh hitung jumlahnya, ambil ID saja biar ringan
          }
        ]
        // ==============================================
       }], // Join data asisten jika ada
      attributes: { exclude: ['password', 'otp_code'] },
      order: [['role', 'ASC'], ['nama_lengkap', 'ASC']] // Urutkan biar rapi
    });
    
    // PERBAIKAN: Bungkus dengan object data
    res.json({ 
        message: "Berhasil memuat data user",
        data: users 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, nama_lengkap, npm, no_hp } = req.body;
    
    // Cek apakah username/email sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ message: "Username sudah digunakan" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username, email, password: hashedPassword, role, nama_lengkap
    });

    // PERBAIKAN LOGIKA: Cek role 'asisten' (sesuai dropdown frontend)
    if (role === 'asisten') {
      await DataAsisten.create({
        id_users: newUser.id_users, // Pastikan field primary key user benar (id_users atau id)
        npm: npm || null,
        no_hp: no_hp || null
      });
    }
    // === TAMBAHAN: CATAT RIWAYAT ===
    // Pastikan req.user ada (artinya yang create user harus login dulu, misal Kepala Labor)
    if (req.user) {
      await Riwayat.create({
          id_users: req.user.id_users, // Admin yang membuat
          aktivitas: `Menambahkan User Baru: ${newUser.nama_lengkap} (${newUser.role})`,
          waktu_aktivitas: new Date()
      });
  }
  // ==============================

    res.status(201).json({ message: 'User berhasil dibuat', data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === REVISI: GET MY PROFILE (Menggunakan Token, bukan Params) ===
exports.getMyProfile = async (req, res) => {
  try {
    // 1. DEBUG: Cek isi token user di terminal backend
    console.log("Isi req.user:", req.user);

    // 2. Ambil ID dengan aman (cek apakah pakai .id atau .id_users atau .userId)
    const id = req.user.id_users || req.user.id || req.user.userId;

    if (!id) {
        return res.status(400).json({ message: "Token tidak valid, ID user tidak ditemukan." });
    }

    const profile = await User.findOne({
      where: { id_users: id },
      // Hapus dulu exclude 'otp_code' jika Anda belum migrasi DB, 
      // tapi jika sudah migrasi, baris ini aman.
      attributes: { exclude: ['password', 'otp_code', 'otp_expiration'] }, 
      include: [
          { 
              model: DataAsisten,
              required: false // Gunakan false agar jika bukan asisten (tidak ada data), tidak error
          }, 
          { 
              model: Riwayat, 
              limit: 5, 
              order: [['waktu_aktivitas', 'DESC']],
              required: false 
          }
      ]
    });

    if (!profile) return res.status(404).json({ message: "User tidak ditemukan di database" });

    res.json(profile);
  } catch (error) {
    // 3. Log error detail ke terminal backend agar terlihat jelas
    console.error("ERROR getMyProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server: " + error.message });
  }
};

// === BARU: UPDATE MY PROFILE (Termasuk Password & Data Asisten) ===
exports.updateMyProfile = async (req, res) => {
  try {
      // === 1. DEBUG LOG (Cek Terminal Backend Anda saat klik simpan) ===
      console.log("-----------------------------------------");
      console.log("DEBUG UPDATE PROFILE:");
      console.log("Isi Token (req.user):", req.user);

      // Ambil ID. Kita coba baca dari berbagai kemungkinan field token
      const id = req.user.id_users || req.user.id || req.user.userId;
      console.log("ID yang digunakan untuk mencari:", id);

      if (!id) {
          return res.status(400).json({ message: "Token valid tapi tidak mengandung ID user." });
      }
      // =================================================================

      // === 2. CARI USER ===
      // Gunakan findOne dengan where spesifik agar lebih akurat daripada findByPk
      const user = await User.findOne({ where: { id_users: id } });

      if (!user) {
          console.log("HASIL DB: User NULL (Tidak ditemukan di tabel users)");
          return res.status(404).json({ message: "User tidak ditemukan di database" });
      }

      // === 3. UPDATE LOGIC (Sama seperti sebelumnya) ===
      const { nama_lengkap, email, no_hp, npm, password, confirmPassword, username } = req.body;

      // Cek Username Duplikat (Kecuali punya sendiri)
      if (username && username !== user.username) {
          const existingUser = await User.findOne({ where: { username } });
          if (existingUser) {
              return res.status(400).json({ message: "Username sudah digunakan user lain." });
          }
          user.username = username;
      }

      user.nama_lengkap = nama_lengkap || user.nama_lengkap;
      user.email = email || user.email;

      // Ganti Password
      if (password && password.trim() !== "") {
          if (password !== confirmPassword) {
              return res.status(400).json({ message: "Konfirmasi password tidak cocok" });
          }
          const bcrypt = require('bcryptjs'); 
          user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      // Update Data Asisten (Hanya jika role asisten)
      if (user.role === 'asisten') {
           const { DataAsisten } = require('../models'); 
           const asistenData = await DataAsisten.findOne({ where: { id_users: id } });
           
           if (asistenData) {
              await asistenData.update({ no_hp, npm });
           } else {
              // Buat baru jika belum ada
              await DataAsisten.create({ id_users: id, no_hp, npm });
           }
      }

      // === TAMBAHAN: CATAT RIWAYAT ===
    // Letakkan di baris sebelum res.json success
    await Riwayat.create({
      id_users: req.user.id_users,
      aktivitas: `Memperbarui Profil Pribadi`,
      waktu_aktivitas: new Date()
  });
  // ==============================

      console.log("UPDATE SUKSES!");
      res.json({ message: "Profil berhasil diperbarui" });

  } catch (error) {
      console.error("ERROR SYSTEM:", error);
      res.status(500).json({ message: error.message });
  }
};

// UPDATE USER (Misal ganti Nama/Role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, nama_lengkap } = req.body; 

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Update data basic
    await user.update({ username, role, nama_lengkap });

    // TODO: Jika role asisten, update juga DataAsisten (Opsional, dikembangkan nanti)

    // === TAMBAHAN BARU: CATAT RIWAYAT UPDATE ===
    // Cek apakah ada req.user dari token yang melakukan aksi ini
    if (req.user) {
      const actorId = req.user.id_users || req.user.id || req.user.userId;
      await Riwayat.create({
          id_users: actorId, 
          aktivitas: `Mengedit data User: ${user.nama_lengkap} (${user.role})`,
          waktu_aktivitas: new Date()
      });
    }
    // ============================================

    res.json({ message: "User berhasil diupdate", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const myId = req.user.id_users || req.user.id || req.user.userId;
    if (parseInt(id) === parseInt(myId)) {
        return res.status(403).json({ message: "Anda tidak dapat menghapus akun Anda sendiri!" });
    }
    // ===================================================
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Simpan nama dan role user SEBELUM dihapus untuk dicatat di log
    const namaUserYangDihapus = user.nama_lengkap;
    const roleUserYangDihapus = user.role;

    await user.destroy(); 

    // === TAMBAHAN BARU: CATAT RIWAYAT DELETE ===
    if (req.user) {
      const actorId = req.user.id_users || req.user.id || req.user.userId;
      await Riwayat.create({
          id_users: actorId, 
          aktivitas: `Menghapus User: ${namaUserYangDihapus} (${roleUserYangDihapus})`,
          waktu_aktivitas: new Date()
      });
    }
    // ============================================

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};