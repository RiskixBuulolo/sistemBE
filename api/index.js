const express = require('express');
const cors = require('cors');
const app = express();
const helmet = require('helmet');

// Vercel otomatis membaca Environment Variables dari Dashboard,
// dotenv hanya berguna saat testing di komputer lokal.
require('dotenv').config();

// === 1. MIDDLEWARE ===
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

// --- PERUBAHAN VERCEL ---
// express.static('/public') DIHAPUS karena file upload sudah tidak dihosting di lokal Vercel.

// === 2. ROUTES ===
const apiRoutes = require('../routes/apiRoutes');
app.use('/api', apiRoutes); 

app.get('/', (req, res) => {
  res.send('Server Labor is Running on Vercel Serverless!');
});

// === 3. EXPORT UNTUK VERCEL ===
// HAPUS app.listen() dan sequelize.sync()
// Cukup ekspor instance aplikasi Express ini:
module.exports = app;
