import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Service d'envoi d'emails via SMTP Gmail
 */

let transporter: Transporter | null = null;

/**
 * Initialise le transporteur SMTP avec les credentials
 */
export function initializeEmailService() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.warn("⚠️  SMTP non configuré : variables d'environnement manquantes");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true pour port 465, false pour 587
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    console.log(`✅ Service SMTP initialisé: ${smtpHost}:${smtpPort}`);
    return transporter;
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation SMTP:", error);
    return null;
  }
}

/**
 * Vérifie si le service SMTP est configuré et opérationnel
 */
export async function isEmailServiceReady(): Promise<boolean> {
  if (!transporter) {
    transporter = initializeEmailService();
  }

  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("❌ Erreur de vérification SMTP:", error);
    return false;
  }
}

/**
 * Envoie un email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}): Promise<boolean> {
  if (!transporter) {
    transporter = initializeEmailService();
  }

  if (!transporter) {
    console.error("❌ Service SMTP non configuré");
    return false;
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log("✅ Email envoyé:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email:", error);
    return false;
  }
}

/**
 * Teste la configuration SMTP
 */
export async function testEmailConfiguration(testEmail: string): Promise<{
  success: boolean;
  message: string;
}> {
  const isReady = await isEmailServiceReady();
  
  if (!isReady) {
    return {
      success: false,
      message: "Service SMTP non configuré ou inaccessible. Vérifiez vos credentials.",
    };
  }

  try {
    await sendEmail({
      to: testEmail,
      subject: "Test de configuration SMTP - Coach Digital",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a8a;">✅ Configuration SMTP réussie</h2>
          <p>Votre service d'envoi d'emails est correctement configuré et opérationnel.</p>
          <p>Vous pouvez maintenant envoyer des factures de temps et des notifications à vos clients.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">Coach Digital - Accompagnement numérique et intégration IA</p>
        </div>
      `,
      text: "✅ Configuration SMTP réussie. Votre service d'envoi d'emails est opérationnel.",
    });

    return {
      success: true,
      message: "Email de test envoyé avec succès !",
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de l'envoi : ${error}`,
    };
  }
}

// Initialiser au démarrage du serveur
initializeEmailService();
