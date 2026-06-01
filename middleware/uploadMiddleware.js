const multer = require('multer');

// --- PERUBAHAN VERCEL: Gunakan Memory Storage ---
// Vercel bersifat Read-Only. File ditangkap ke memori (buffer),
// lalu Controller kamu yang akan mengunggahnya ke Cloudinary/Supabase.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya Gambar & PDF.'), false);
  }
};

module.exports = {
  uploadAbsen: multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
  }),

  uploadDokumen: multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  })
};
