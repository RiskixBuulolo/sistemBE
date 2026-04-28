// file: controllers/riwayatController.js
const { Riwayat, User } = require('../models');

exports.getAllRiwayat = async (req, res) => {
  try {
    const data = await Riwayat.findAll({
      include: [
        { 
          model: User, 
          as: 'User', // Pastikan ini cocok dengan model (opsional jika default)
          attributes: ['nama_lengkap', 'role'] 
        }
      ],
      order: [['waktu_aktivitas', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data riwayat.' });
  }
};

// Fungsi untuk menghapus SEMUA data riwayat
exports.clearAllRiwayat = async (req, res) => {
  try {
      // Asumsi Anda menggunakan Sequelize ORM.
      // destroy({ where: {} }) akan menghapus semua baris di tabel tersebut.
      await Riwayat.destroy({ 
          where: {} 
      });

      // Alternatif jika ingin menyisakan data 30 hari terakhir (SANGAT DISARANKAN):
      /*
      const { Op } = require('sequelize');
      const thirtyDaysAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
      await Riwayat.destroy({
          where: {
              waktu_aktivitas: { [Op.lt]: thirtyDaysAgo } // Hapus yang lebih lama dari 30 hari
          }
      });
      */

      res.status(200).json({ 
          success: true, 
          message: "Data riwayat aktivitas berhasil dibersihkan dari database." 
      });
      
  } catch (error) {
      console.error("Error saat menghapus riwayat:", error);
      res.status(500).json({ 
          success: false, 
          message: "Terjadi kesalahan pada server saat menghapus data riwayat.",
          error: error.message 
      });
  }
};