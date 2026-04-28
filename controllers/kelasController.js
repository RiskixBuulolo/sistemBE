const { Kelas, Riwayat } = require('../models');
const xlsx = require('xlsx');
const fs = require('fs');

// === 1. GET ALL KELAS ===
exports.getAllKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findAll({
        order: [['createdAt', 'DESC']]
    });
    res.json({ message: "Berhasil memuat data kelas", data: kelas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === 2. CREATE KELAS (MANUAL) ===
exports.createKelas = async (req, res) => {
  try {
    // TAMBAHAN: hari_jam & ruangan
    const { kode_mk, nama_mk, nama_dosen, nama_kelas, semester, sks, hari_jam, ruangan } = req.body;

    const newKelas = await Kelas.create({
        kode_mk, nama_mk, nama_dosen, nama_kelas, semester, sks,
        hari_jam, // Kolom baru
        ruangan   // Kolom baru
    });

    // === TAMBAHAN: CATAT RIWAYAT ===
    await Riwayat.create({
        id_users: req.user.id_users,
        aktivitas: `Menambah Kelas Baru: ${req.body.nama_mk} - ${req.body.nama_kelas}`,
        waktu_aktivitas: new Date()
    });
    // ==============================

    res.status(201).json({ message: 'Kelas berhasil ditambahkan', data: newKelas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === 3. IMPORT KELAS DARI EXCEL (FITUR UTAMA STAFF) ===
exports.importKelasExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Upload file excel!" });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const kelasToInsert = [];

    for (const row of data) {
      // Filter: Hanya ambil "Praktikum - 1 SKS"
      const jenis = row['Jenis Pertemuan'] || '';
      
      if (jenis.toLowerCase().includes('praktikum')) {
        kelasToInsert.push({
            nama_mk: row['Matakuliah'],
            nama_kelas: row['Kelas'],
            nama_dosen: row['Dosen'],
            ruangan: row['Ruangan'],
            // Gabung Hari & Jam
            hari_jam: `${row['Hari']} ${row['Jam']}`, 
            sks: 1, 
            kode_mk: '-', // Dummy
            semester: '-' // Dummy
        });
      }
    }

    if (kelasToInsert.length > 0) {
      await Kelas.bulkCreate(kelasToInsert);
      fs.unlinkSync(req.file.path); // Hapus file temp

      // === TAMBAHAN: CATAT RIWAYAT ===
      await Riwayat.create({
        id_users: req.user.id_users,
        aktivitas: `Melakukan Import Excel: ${kelasToInsert.length} Data Kelas`,
        waktu_aktivitas: new Date()
    });
    // ==============================
      return res.status(200).json({ 
          message: `Sukses import ${kelasToInsert.length} kelas praktikum!` 
      });
    } else {
      return res.status(400).json({ message: "Data praktikum tidak ditemukan di file." });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal import data." });
  }
};

// === 4. UPDATE KELAS ===
exports.updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    // TAMBAHAN: hari_jam & ruangan
    const { kode_mk, nama_mk, nama_dosen, nama_kelas, semester, sks, hari_jam, ruangan } = req.body;

    const kelas = await Kelas.findByPk(id);
    if (!kelas) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    await kelas.update({ 
        kode_mk, nama_mk, nama_dosen, nama_kelas, semester, sks,
        hari_jam, ruangan 
    });

        // === TAMBAHAN: CATAT RIWAYAT ===
        await Riwayat.create({
          id_users: req.user.id_users,
          aktivitas: `Mengedit data Kelas : ${req.body.nama_mk} - ${req.body.nama_kelas}`,
          waktu_aktivitas: new Date()
      });

    res.json({ message: "Data Kelas berhasil diperbarui", data: kelas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === 5. DELETE KELAS ===
exports.deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = await Kelas.findByPk(id);
    if (!kelas) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    // Simpan informasi kelas SEBELUM di-destroy untuk dicatat di riwayat
    const namaMkYangDihapus = kelas.nama_mk;
    const namaKelasYangDihapus = kelas.nama_kelas;

    await kelas.destroy();

    // === PERBAIKAN: CATAT RIWAYAT ===
    // Pastikan req.user ada untuk mencegah error jika token bermasalah
    if (req.user) {
        const actorId = req.user.id_users || req.user.id || req.user.userId;
        await Riwayat.create({
            id_users: actorId,
            // Gunakan variabel yang sudah disimpan di atas, BUKAN req.body
            aktivitas: `Menghapus Kelas : ${namaMkYangDihapus} - ${namaKelasYangDihapus}`,
            waktu_aktivitas: new Date()
        });
    }
    // =================================

    res.json({ message: "Kelas berhasil dihapus" });
  } catch (error) {
    console.error("Error Delete Kelas:", error); // Tambahkan log ini untuk debug jika terjadi error lagi
    res.status(500).json({ message: error.message });
  }
};
// === 6. DELETE ALL KELAS (RESET SEMESTER) ===
exports.deleteAllKelas = async (req, res) => {
  try {
    // Menghapus semua data tanpa kondisi (where: {})
    const totalDeleted = await Kelas.destroy({
        where: {}
    });

    // === CATAT RIWAYAT ===
    if (req.user) {
        const actorId = req.user.id_users || req.user.id || req.user.userId;
        await Riwayat.create({
            id_users: actorId,
            aktivitas: `MENGHAPUS SEMUA DATA KELAS (Reset Semester). Total: ${totalDeleted} kelas dihapus.`,
            waktu_aktivitas: new Date()
        });
    }

    res.json({ message: "Semua kelas berhasil dihapus", total: totalDeleted });
  } catch (error) {
    console.error("Error Delete All Kelas:", error);
    res.status(500).json({ message: "Gagal menghapus semua kelas." });
  }
};