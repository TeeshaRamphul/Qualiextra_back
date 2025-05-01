/*import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({ 
    host: "smtpp-mail.gmail.com",
    secureConnexion: false,
    port: 3000,
    tls: { ciphers: "SSLv3" },
    auth: { 
        user: "teesha.rh@gmail.com",
        pass: "test_111"
    }
})

const mailOptions = { 
    from: "teesha.rh@gmail.com",
    to: "teesha.rh@gmail.com",
    subject: "E-mail automatique",
    text: "cet E-mail est un E-mail automatique"
}

transporter.sendMail(mailOptions, (error, info) => { 
    if (error){
        console.log(error)
    } else { 
        console.log("E-mail envoyé" + info.response)
    }
})

import nodemailer from "nodemailer";

// Génère un compte test à la volée
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: testAccount.smtp.host,
  port: testAccount.smtp.port,
  secure: testAccount.smtp.secure,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});

const info = await transporter.sendMail({
  from: '"Test App" <test@example.com>',
  to: "someone@example.com",
  subject: "Hello",
  text: "Ceci est un test",
});

console.log("Message sent:", info.messageId);
console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
*/

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);