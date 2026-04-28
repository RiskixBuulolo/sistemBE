const { User, Riwayat } = require('../models');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken'); // Tambah ini diatas

// 1. LOGIN
exports.login = async (req, res) => {
  try {
    // 1. DEBUG: LIHAT APA YANG DIKIRIM FRONTEND
    console.log("-------------------------------");
    console.log("LOGIN REQUEST BODY:", req.body); 
    console.log("Type of req.body:", typeof req.body);
    console.log("-------------------------------");

    const { email, password } = req.body;

    // 2. Validasi Input Manual (Pencegahan Error Undefined)
    if (!email || !password) {
        return res.status(400).json({ 
            message: "email dan Password wajib diisi!",
            received: req.body // Kirim balik biar tau apa yang salah
        });
    }

    // Cari User
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 2. Cek Password (Antisipasi jika password di DB null/rusak)
    if (!user.password) {
        return res.status(500).json({ message: "Password user korup/kosong. Hubungi admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // === 2. TAMBAHKAN KODE PENCATATAN RIWAYAT DISINI ===
    await Riwayat.create({
      id_users: user.id_users,
      aktivitas: 'Melakukan Login ke sistem',
      waktu_aktivitas: new Date(),
      id_laporan: null // Null karena ini bukan kegiatan laporan
  });
  // ===================================================

    // 3. Buat Token
    const token = jwt.sign(
      { 
        id_users: user.id_users, // Pastikan pakai id_users
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || 'secretkey', // Ganti sesuai env Anda
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login berhasil",
      token: token,
      user: {
        nama_lengkap: user.nama_lengkap,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error); // Cek terminal backend untuk detail
    res.status(500).json({ message: error.message });
  }
};

// 2. REQUEST OTP (Lupa Password)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'Email tidak terdaftar' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    
    // Set expired 10 menit dari sekarang
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);

    // Simpan ke database
    user.otp_code = otp;
    user.otp_expiration = expiration;
    await user.save();

    // Kirim Email
    const message = `Halo ${user.nama_lengkap}, kode OTP untuk reset password Anda adalah: <b>${otp}</b>`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Password OTP - Sistem Labor',
        message: message
      });

      res.status(200).json({ message: 'OTP telah dikirim ke email Anda' });
    } catch (err) {
      user.otp_code = null;
      user.otp_expiration = null;
      await user.save();
      return res.status(500).json({ message: 'Gagal mengirim email. Coba lagi nanti.' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. VERIFIKASI OTP (Versi Debugging)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("--- DEBUG START ---");
    console.log("1. Menerima Data:", { email, otp });

    // A. Cari User Dulu (Cuma pakai Email)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("Error: Email tidak ditemukan di DB");
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }

    console.log("2. Data di Database:");
    console.log("   - OTP Tersimpan:", user.otp_code);
    console.log("   - Expired Tersimpan:", user.otp_expiration);
    console.log("   - Waktu Sekarang (Server):", new Date());

    // B. Cek Apakah Kode OTP Cocok?
    if (user.otp_code !== otp) {
      console.log("Error: Kode OTP tidak cocok!");
      return res.status(400).json({ 
        message: 'OTP Salah!', 
        detail: `Kamu kirim ${otp}, tapi di database isinya ${user.otp_code}` 
      });
    }

    // C. Cek Apakah Expired?
    const now = new Date();
    const expiredTime = new Date(user.otp_expiration);

    if (now > expiredTime) {
      console.log("Error: Waktu sudah habis (Expired)");
      return res.status(400).json({ 
        message: 'OTP Sudah Kadaluarsa',
        server_time: now,
        expire_time: expiredTime
      });
    }

    console.log("Sukses: OTP Valid");
    res.status(200).json({ message: 'OTP Valid. Silakan buat password baru.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 4. RESET PASSWORD BARU
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok' });
    }

    // Cek lagi validitas user & OTP (untuk keamanan ganda)
    const user = await User.findOne({ 
      where: { 
        email, 
        otp_code: otp,
        otp_expiration: { [Op.gt]: new Date() }
      } 
    });

    if (!user) return res.status(400).json({ message: 'Permintaan tidak valid atau sesi habis' });

    // Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update User & Hapus OTP
    user.password = hashedPassword;
    user.otp_code = null;
    user.otp_expiration = null;
    await user.save();

    res.status(200).json({ message: 'Password berhasil diubah. Silakan login.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};