import { Express, Request, Response } from "express";
import { getDb } from "./db";
import { emailTracking, emailBlacklist } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Routes publiques pour le tracking des emails
 */
export function registerTrackingRoutes(app: Express) {
  // Pixel invisible pour le tracking d'ouverture
  app.get("/api/track/open/:trackingId", async (req: Request, res: Response) => {
    const { trackingId } = req.params;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.headers["x-forwarded-for"] as string;

    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Récupérer le tracking
      const trackingResult = await db
        .select()
        .from(emailTracking)
        .where(eq(emailTracking.trackingId, trackingId))
        .limit(1);

      if (trackingResult.length > 0) {
        const tracking = trackingResult[0];

        // Mettre à jour le tracking
        await db
          .update(emailTracking)
          .set({
            opened: true,
            openedAt: tracking.openedAt || new Date(),
            openCount: (tracking.openCount || 0) + 1,
            userAgent,
            ipAddress,
          })
          .where(eq(emailTracking.id, tracking.id));
      }
    } catch (error) {
      console.error("Error tracking email open:", error);
    }

    // Retourner un pixel transparent 1x1
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": pixel.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    res.end(pixel);
  });

  // Redirection pour le tracking des clics
  app.get("/api/track/click/:trackingId", async (req: Request, res: Response) => {
    const { trackingId } = req.params;
    const { url } = req.query;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.headers["x-forwarded-for"] as string;

    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Récupérer le tracking
      const trackingResult = await db
        .select()
        .from(emailTracking)
        .where(eq(emailTracking.trackingId, trackingId))
        .limit(1);

      if (trackingResult.length > 0) {
        const tracking = trackingResult[0];

        // Mettre à jour le tracking
        await db
          .update(emailTracking)
          .set({
            clicked: true,
            clickedAt: tracking.clickedAt || new Date(),
            clickCount: (tracking.clickCount || 0) + 1,
            userAgent,
            ipAddress,
          })
          .where(eq(emailTracking.id, tracking.id));
      }
    } catch (error) {
      console.error("Error tracking email click:", error);
    }

    // Rediriger vers l'URL cible
    const targetUrl = url as string || "https://www.google.com";
    res.redirect(targetUrl);
  });

  // Page de désabonnement
  app.get("/unsubscribe/:email/:token", async (req: Request, res: Response) => {
    const { email, token } = req.params;

    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Vérifier le token (simple hash de l'email)
      const expectedToken = Buffer.from(email).toString("base64");
      if (token !== expectedToken) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Erreur de désabonnement</title>
              <style>
                body { font-family: Inter, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
                h1 { color: #ef4444; }
              </style>
            </head>
            <body>
              <h1>❌ Lien invalide</h1>
              <p>Ce lien de désabonnement n'est pas valide.</p>
            </body>
          </html>
        `);
      }

      // Ajouter à la blacklist
      try {
        await db.insert(emailBlacklist).values({
          email,
          reason: "Unsubscribed via email link",
        });
      } catch (error) {
        // Déjà blacklisté, ignorer l'erreur
      }

      // Page de confirmation
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Désabonnement réussi</title>
            <style>
              body { font-family: Inter, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              h1 { color: #10b981; }
              p { color: #6b7280; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>✅ Désabonnement réussi</h1>
            <p>L'adresse <strong>${email}</strong> a été retirée de notre liste de diffusion.</p>
            <p>Vous ne recevrez plus d'emails de notre part.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Erreur</title>
            <style>
              body { font-family: Inter, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              h1 { color: #ef4444; }
            </style>
          </head>
          <body>
            <h1>❌ Erreur</h1>
            <p>Une erreur s'est produite lors du désabonnement.</p>
          </body>
        </html>
      `);
    }
  });
}
