// controllers/dashboardController.js
const { User, LaporanKegiatan, LaporanRps, LaporanKontrak, LaporanAbsensiMonitoring, LaporanModul, Jadwal, Absensi, DataAsisten, Kelas } = require('../models');

exports.getKepalaSummary = async (req, res) => {
  try {
    console.log("📊 Mengambil data statistik Real-time...");

    // ==========================================
    // 1. HITUNG STAFF AKTIF
    // Menggunakan model 'User' dengan filter role 'staff_labor'
    // ==========================================
    const totalStaff = await User.count({
      where: { role: 'staff_labor' }
    });
    const totalAsisten = await User.count({
      where: { role: 'asisten' }
    });

    // ==========================================
    // 2. HITUNG LAPORAN KEGIATAN
    // Menggunakan model 'LaporanKegiatan'
    // Ini mewakili kartu "Laporan Kegiatan" di dashboard
    // ==========================================
    const totalKegiatan = await LaporanKegiatan.count();

    // ==========================================
    // 3. HITUNG DOKUMEN (VALIDASI)
    // Menggunakan model 'LaporanRps' dan 'LaporanKontrak'
    // ==========================================
    // Catatan: Karena di model kamu belum ada kolom 'status' (pending/valid),
    // sementara kita hitung TOTAL dokumen yang masuk saja.
    const countRPS = await LaporanRps.count();
    const countKontrak = await LaporanKontrak.count();
    
    // Gabungan total dokumen
    const countAbsensi = await Absensi.count();
    const countJadwal = await Jadwal.count();
    const countKelas = await Kelas.count();
    const countAbsmon = await LaporanAbsensiMonitoring.count();
    const countModul = await LaporanModul.count();


    // ==========================================
    // 4. SUSUN RESPONSE
    // ==========================================
    const dataRingkasan = {
      total_kegiatan: totalKegiatan,   // Data dari tabel laporan_kegiatan
      total_rps: countRPS, 
      total_kontrak: countKontrak, 
      total_absensi: countAbsensi, 
      total_jadwal: countJadwal, 
      total_kelas: countKelas,
      total_modul: countModul,
      total_absmon: countAbsmon,// Data dari tabel laporan_rps + laporan_kontrak
      staff_aktif: totalStaff,         // Data dari tabel users (staff)
      asisten_aktif: totalAsisten,
      pesan_baru: 0                    // Belum ada tabel pesan, set 0
    };

    console.log("✅ Data Dashboard Terkirim:", dataRingkasan);

    res.status(200).json({
      message: 'Berhasil mengambil data dashboard kepala',
      data: dataRingkasan
    });

  } catch (error) {
    console.error("❌ Error Dashboard:", error);
    res.status(500).json({ 
        message: 'Gagal memuat data dashboard',
        error: error.message 
    });
  }
};

// === TAMBAHKAN INI UNTUK ASISTEN ===
exports.getAsistenSummary = async (req, res) => {
  try {
    const userId = req.user.id_users; // ID dari Token Login (misal: 4)
    console.log(`👤 Mencari Profil Asisten untuk User ID: ${userId}`);

    // ==========================================
    // 1. CARI ID ASISTEN DULU
    // Kita cari di tabel data_asisten yang id_users-nya cocok
    // ==========================================
    const asistenProfile = await DataAsisten.findOne({
      where: { id_users: userId }
    });

    // Jika user ini role-nya asisten tapi datanya belum diinput admin ke tabel data_asisten
    if (!asistenProfile) {
      console.log("⚠️ User ini login sebagai asisten, tapi belum ada di tabel data_asisten.");
      return res.status(200).json({
        message: 'Data asisten belum lengkap',
        data: {
          jadwal_saya: 0,
          absensi_saya: 0,
          laporan_saya: 0,
          pesan_baru: 0
        }
      });
    }

    const realIdAsisten = asistenProfile.id_asisten; // Inilah ID yang dipakai di tabel Jadwal (misal: 1)
    console.log(`✅ ID Asisten Ditemukan: ${realIdAsisten} (Linked to User ID: ${userId})`);

    // ==========================================
    // 2. HITUNG JADWAL SAYA
    // Gunakan realIdAsisten yang baru didapat
    // ==========================================
    const totalJadwal = await Jadwal.count({
      where: { id_asisten: realIdAsisten } 
    });

    // ==========================================
    // 3. HITUNG TOTAL ABSENSI SAYA
    // Join ke Jadwal, filter berdasarkan realIdAsisten
    // ==========================================
    const totalAbsensi = await Absensi.count({
      include: [{
        model: Jadwal,
        where: { id_asisten: realIdAsisten }, 
        required: true 
      }]
    });

    // ==========================================
    // 4. HITUNG LAPORAN HARIAN SAYA
    // Join ke Jadwal, filter berdasarkan realIdAsisten
    // ==========================================
    const totalLaporan = await LaporanKegiatan.count({
      include: [{
        model: Jadwal,
        where: { id_asisten: realIdAsisten },
        required: true
      }]
    });

    const dataRingkasan = {
      jadwal_saya: totalJadwal,
      absensi_saya: totalAbsensi,
      laporan_saya: totalLaporan,
      pesan_baru: 0
    };

    console.log("📊 Data Dashboard Asisten Terkirim:", dataRingkasan);

    res.status(200).json({
      message: 'Berhasil mengambil data dashboard asisten',
      data: dataRingkasan
    });

  } catch (error) {
    console.error("❌ Error Dashboard Asisten:", error);
    res.status(500).json({ 
        message: 'Gagal memuat data dashboard',
        error: error.message 
    });
  }
};

exports.getStaffSummary = async (req, res) => {
  try {
    // 1. Hitung Total Kegiatan (Laporan Masuk)
    const totalKegiatan = await LaporanKegiatan.count();
    const totalRps = await LaporanRps.count();
    const totalKontrak = await LaporanKontrak.count();
    const totalAbsMon = await LaporanAbsensiMonitoring.count();
    const totalModul = await LaporanModul.count();
    const totalAbsen = await Absensi.count();
    const totalJadwal = await Jadwal.count();
    const totalKelas = await Kelas.count();

    // 3. Hitung Asisten Aktif
    const asistenAktif = await DataAsisten.count({ where: { status: 'Aktif' } });

    res.json({
      message: 'Data dashboard staff',
      data: {
        total_kegiatan: totalKegiatan,
        total_rps: totalRps,
        total_kontrak: totalKontrak,
        total_absmon: totalAbsMon,
        total_modul: totalModul,
        total_absen: totalAbsen,
        total_jadwal: totalJadwal,
        total_kelas: totalKelas,
        
        // dokumen_pending: dokumenPending > 0 ? dokumenPending : 0,
        asisten_aktif: asistenAktif
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};