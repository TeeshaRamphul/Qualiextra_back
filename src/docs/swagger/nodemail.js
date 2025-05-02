import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// Création d'un transporteur nodemailer qui va permettre d'envoyer des emails
export const transporter = nodemailer.createTransport({
  // Configuration du serveur SMTP Mailtrap utilisé pour tester l'envoi d'emails en développement
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER, // Utilisateur (clé d'API) pour l'authentification avec Mailtrap
        pass: process.env.MAILTRAP_PASS  // Mot de passe associé à l'utilisateur (clé d'API) de Mailtrap
    }
});

// Fonction pour envoyer un email de vérification d'adresse email
export const sendEmail = async ({ email, firstname, verificationUrl }) => {
    try {
       // Utilisation du transporteur créé précédemment pour envoyer un email
        await transporter.sendMail({
          from: '"Qualiextra" <no-reply@qualiextra.com>',
          to: email,
          subject: "Vérification de votre adresse email",
          text: `Bonjour ${ firstname }, veuillez cliquer sur ce lien pour vérifier votre adresse : ${verificationUrl}`,
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw error;
    }
};