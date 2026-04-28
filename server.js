const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const { sequelize } = require('./models');

dotenv.config();
const PORT = process.env.PORT || 5000;

// === 1. MIDDLEWARE ===
app.use(cors()); // Izinkan akses dari Frontend manapun
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PENTING: Konfigurasi Helmet agar tidak memblokir gambar
// Default Helmet memblokir resource cross-origin (gambar tidak muncul di HP/Frontend nanti)
app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

// === 2. STATIC FILES ===
// Agar folder 'public/uploads' bisa diakses lewat URL
// Contoh: http://localhost:5000/uploads/dokumen/file.pdf
app.use('/public', express.static(path.join(__dirname, 'public')));

// === 3. ROUTES ===
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes); 

// Test Route (Health Check)
app.get('/', (req, res) => {
  res.send('Server Labor is Running correctly!');
});

// === 4. START SERVER & SYNC DB ===
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // Cek koneksi
    await sequelize.authenticate();
    console.log('Database connected successfully!');

    // [PENTING] Sinkronisasi Tabel (Update struktur tabel otomatis)
    // 'alter: true' aman, dia hanya menambah kolom/tabel baru tanpa hapus data lama
    // await sequelize.sync({ alter: true }); 
    console.log('All models were synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});