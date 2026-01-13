import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const reviewsRouter = router({
  /**
   * Créer un nouvel avis (client uniquement)
   */
  create: publicProcedure
    .input(z.object({
      clientId: z.number(),
      projectId: z.number().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createReview(input);
      return { success: true, id };
    }),

  /**
   * Récupérer tous les avis (avec filtres optionnels)
   */
  list: publicProcedure
    .input(z.object({
      clientId: z.number().optional(),
      projectId: z.number().optional(),
      isPublic: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getReviews(input);
    }),

  /**
   * Récupérer un avis par ID
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getReviewById(input.id);
    }),

  /**
   * Mettre à jour un avis (client uniquement)
   */
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      rating: z.number().min(1).max(5).optional(),
      comment: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateReview(id, data);
      return { success: true };
    }),

  /**
   * Supprimer un avis (coach uniquement)
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.deleteReview(input.id);
      return { success: true };
    }),

  /**
   * Répondre à un avis (coach uniquement)
   */
  respond: protectedProcedure
    .input(z.object({
      id: z.number(),
      response: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.respondToReview(input.id, input.response);
      return { success: true };
    }),

  /**
   * Récupérer la note moyenne
   */
  getAverageRating: publicProcedure
    .query(async () => {
      return await db.getAverageRating();
    }),

  /**
   * Récupérer les avis d'un client avec les projets associés
   */
  getClientReviewsWithProjects: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getClientReviewsWithProjects(input.clientId);
    }),
});
