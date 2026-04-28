const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fungsi pembantu
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Konfigurasi Storage
const storage = (folderName) => multer.diskStorage({
  destination: (req, file, cb) => {
    // --- PERBAIKAN DISINI ---
    // Gunakan process.cwd() untuk mengambil path dari ROOT project.
    // path.join akan otomatis menyesuaikan slash (/) atau backslash (\) sesuai OS.
    const dir = path.join(process.cwd(), 'public', 'uploads', folderName);
    
    // Debugging: Lihat di terminal path mana yang sebenarnya dipakai
    console.log(`[Multer] Mencoba menyimpan ke: ${dir}`);

    try {
      ensureDirectoryExists(dir);
      cb(null, dir);
    } catch (error) {
      console.error("[Multer Error] Gagal membuat folder:", error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitasi nama file asli agar tidak ada spasi/karakter aneh
    const cleanName = file.originalname.replace(/\s+/g, '-');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(cleanName));
  }
});

// Filter File (Tetap sama)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',// .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya Gambar & PDF.'), false);
  }
};

module.exports = {
  uploadAbsen: multer({ 
    storage: storage('absensi'),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
  }),

  uploadDokumen: multer({ 
    storage: storage('dokumen'), // Ini akan masuk ke public/uploads/dokumen
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  })
};