import CryptoJS from "crypto-js";

/**
 * Module de chiffrement AES-256 pour les credentials
 * Conformité RGPD/CNIL/ANSSI
 */

// Clé de chiffrement (en production, utiliser une variable d'environnement sécurisée)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "coach-digital-secret-key-2025-change-me-in-production";

/**
 * Chiffre des données sensibles en AES-256
 * @param data Données à chiffrer (objet JSON)
 * @returns Chaîne chiffrée
 */
export function encryptCredentials(data: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Erreur chiffrement:", error);
    throw new Error("Échec du chiffrement des credentials");
  }
}

/**
 * Déchiffre des données chiffrées en AES-256
 * @param encryptedData Chaîne chiffrée
 * @returns Objet JSON déchiffré
 */
export function decryptCredentials(encryptedData: string): Record<string, any> {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error("Déchiffrement invalide");
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erreur déchiffrement:", error);
    throw new Error("Échec du déchiffrement des credentials");
  }
}

/**
 * Valide la structure des credentials selon la catégorie
 * @param category Catégorie du credential
 * @param data Données à valider
 * @returns true si valide, sinon lance une erreur
 */
export function validateCredentialData(category: string, data: Record<string, any>): boolean {
  const requiredFields: Record<string, string[]> = {
    hosting: ["host", "username", "password"],
    api: ["apiKey"],
    smtp: ["host", "port", "username", "password"],
    domain: ["registrar", "loginUrl"],
    cms: ["url", "username", "password"],
    database: ["host", "database", "username", "password"],
    other: [],
  };

  const required = requiredFields[category] || [];
  
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Champ requis manquant: ${field}`);
    }
  }
  
  return true;
}

/**
 * Masque partiellement un credential pour l'affichage
 * @param value Valeur à masquer
 * @returns Valeur masquée (ex: "abc***xyz")
 */
export function maskCredential(value: string): string {
  if (!value || value.length < 6) {
    return "***";
  }
  
  const start = value.substring(0, 3);
  const end = value.substring(value.length - 3);
  return `${start}***${end}`;
}
