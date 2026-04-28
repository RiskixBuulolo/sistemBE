const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
  // Gunakan SMTP Gmail (Wajib pakai App Password jika pakai Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Atau sesuaikan dengan SMTP hosting lain
    auth: {
      user: process.env.EMAIL_USER, // Simpan di .env
      pass: process.env.EMAIL_PASS  // Simpan di .env
    }
  });

  const emailOptions = {
    from: '"Sistem Labor" <no-reply@sistemlabor.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
    html: `<div>
            <h3>Sistem Informasi Laboratorium</h3>
            <p>${option.message}</p>
            <br>
            <p>Kode ini berlaku selama 5 menit.</p>
           </div>` 
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;