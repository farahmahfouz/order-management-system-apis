const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Farah Mahfouz <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return nodemailer.createTransport({
        // service: 'SendGrid',
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, data = {}) {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/email/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...data,
        },
      );

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.htmlToText(html),
      };

      const result = await this.newTransport().sendMail(mailOptions);
      return result;
    } catch (err) {
      console.error('❌ EMAIL ERROR:', err.message);
      throw err;
    }
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'You can reset your password in 10 min');
  }
};
