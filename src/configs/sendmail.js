require('dotenv/config')

const fs = require('fs'), nodemailer = require('nodemailer')

const SendMail = async (toMail, subject) => {

  const options = {
    from: process.env.IFLEX_EMAIL_USERNAME,
    to: toMail,
    subject: subject, 
    // html: newPassword ? renderMailRegister : renderMailForgotPassword
  }

  const transporter = nodemailer.createTransport({
    host: process.env.IFLEX_EMAIL_HOST,
    port: process.env.IFLEX_EMAIL_PORT,
    // secure: true,
    services: 'gmail',
    auth: {
      user: process.env.IFLEX_EMAIL_USERNAME,
      pass: process.env.IFLEX_EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const info = await transporter.sendMail(options)

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return info 
}

module.exports = SendMail