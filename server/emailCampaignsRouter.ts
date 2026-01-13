import { router, protectedProcedure } from "./_core/trpc.js";
import { z } from "zod";
import { getDb } from "./db.js";
import { emailCampaigns, emailQueue } from "../drizzle/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "./emailService.js";

export const emailCampaignsRouter = router({
  // Lister toutes les campagnes avec statistiques
  list: protectedProcedure.query(async ({ ctx }) => {
    const dbPromise = getDb();
    const db = await dbPromise;
    if (!db) throw new Error("Database not available");
    
    const campaigns = await db
      .select({
        id: emailCampaigns.id,
        name: emailCampaigns.name,
        templateId: emailCampaigns.templateId,
        subject: emailCampaigns.subject,
        body: emailCampaigns.body,
        createdAt: emailCampaigns.createdAt,
      })
      .from(emailCampaigns)
      .orderBy(sql`${emailCampaigns.createdAt} DESC`);

    // Pour chaque campagne, compter les emails par statut
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign: any) => {
        const stats = await db
          .select({
            status: emailQueue.status,
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(emailQueue)
          .where(eq(emailQueue.campaignId, campaign.id))
          .groupBy(emailQueue.status);

        const sentCount = stats.find((s: any) => s.status === "sent")?.count || 0;
        const failedCount = stats.find((s: any) => s.status === "failed")?.count || 0;
        const pendingCount = stats.find((s: any) => s.status === "pending")?.count || 0;

        return {
          ...campaign,
          sentCount: Number(sentCount),
          failedCount: Number(failedCount),
          pendingCount: Number(pendingCount),
        };
      })
    );

    return campaignsWithStats;
  }),

  // Relancer les emails échoués d'une campagne
  retryFailed: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const dbPromise = getDb();
      const db = await dbPromise;
      if (!db) throw new Error("Database not available");

      // Récupérer tous les emails échoués de la campagne
      const failedEmails = await db
        .select()
        .from(emailQueue)
        .where(
          and(
            eq(emailQueue.campaignId, input.campaignId),
            eq(emailQueue.status, "failed")
          )
        );

      if (failedEmails.length === 0) {
        throw new Error("Aucun email échoué à relancer");
      }

      // Relancer chaque email
      let successCount = 0;
      for (const email of failedEmails) {
        try {
          // Récupérer l'email du lead
          const lead = await db
            .select()
            .from(emailQueue)
            .where(eq(emailQueue.id, email.id))
            .limit(1);

          if (!lead[0]) continue;

          await sendEmail({
            to: lead[0].subject, // Utiliser un champ temporaire
            subject: email.subject,
            html: email.body,
          });

          // Mettre à jour le statut
          await db
            .update(emailQueue)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(emailQueue.id, email.id));

          successCount++;
        } catch (error) {
          console.error(`Erreur lors de la relance de l'email ${email.id}:`, error);
          // Garder le statut "failed"
        }

        // Délai de 1 seconde entre chaque envoi
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return {
        total: failedEmails.length,
        success: successCount,
        failed: failedEmails.length - successCount,
      };
    }),
});
