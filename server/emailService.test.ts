import { describe, it, expect } from "vitest";
import { isEmailServiceReady, testEmailConfiguration } from "./emailService";

describe("Email Service SMTP", () => {
  it("devrait vérifier que le service SMTP est configuré", async () => {
    const isReady = await isEmailServiceReady();
    expect(isReady).toBe(true);
  }, 30000); // Timeout de 30 secondes pour la connexion SMTP

  it("devrait envoyer un email de test", async () => {
    const testEmail = process.env.SMTP_USER || "test@example.com";
    const result = await testEmailConfiguration(testEmail);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain("succès");
  }, 30000); // Timeout de 30 secondes pour l'envoi
});
