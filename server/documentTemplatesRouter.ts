import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { documentTemplates } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const documentTemplatesRouter = router({
  // Récupérer le template par défaut de l'utilisateur
  getDefault: protectedProcedure
    .input(z.object({ type: z.enum(["quote", "invoice"]) }))
    .query(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      const templates = await db_inst
        .select()
        .from(documentTemplates)
        .where(
          and(
            eq(documentTemplates.userId, ctx.user!.id),
            eq(documentTemplates.type, input.type),
            eq(documentTemplates.isDefault, true)
          )
        )
        .limit(1);
      
      return templates[0] || null;
    }),
  
  // Récupérer tous les templates de l'utilisateur
  list: protectedProcedure
    .input(z.object({ type: z.enum(["quote", "invoice"]).optional() }))
    .query(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      const conditions = [eq(documentTemplates.userId, ctx.user!.id)];
      if (input.type) {
        conditions.push(eq(documentTemplates.type, input.type));
      }
      
      return await db_inst
        .select()
        .from(documentTemplates)
        .where(and(...conditions));
    }),
  
  // Récupérer un template par ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      const templates = await db_inst
        .select()
        .from(documentTemplates)
        .where(
          and(
            eq(documentTemplates.id, input.id),
            eq(documentTemplates.userId, ctx.user!.id)
          )
        )
        .limit(1);
      
      return templates[0] || null;
    }),
  
  // Créer un nouveau template
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["quote", "invoice"]),
      name: z.string().min(1),
      logoUrl: z.string().optional().nullable(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      companyName: z.string().optional().nullable(),
      companyAddress: z.string().optional().nullable(),
      companyPhone: z.string().optional().nullable(),
      companyEmail: z.string().email().optional().nullable(),
      companySiret: z.string().optional().nullable(),
      companyTva: z.string().optional().nullable(),
      legalMentions: z.string().optional().nullable(),
      termsAndConditions: z.string().optional().nullable(),
      footerText: z.string().optional().nullable(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      // Si isDefault est true, désactiver les autres templates par défaut du même type
      if (input.isDefault) {
        await db_inst
          .update(documentTemplates)
          .set({ isDefault: false })
          .where(
            and(
              eq(documentTemplates.userId, ctx.user!.id),
              eq(documentTemplates.type, input.type)
            )
          );
      }
      
      const result: any = await db_inst.insert(documentTemplates).values({
        ...input,
        userId: ctx.user!.id,
      });
      
      return { success: true, id: Number(result.insertId) };
    }),
  
  // Mettre à jour un template
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      logoUrl: z.string().optional().nullable(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      companyName: z.string().optional().nullable(),
      companyAddress: z.string().optional().nullable(),
      companyPhone: z.string().optional().nullable(),
      companyEmail: z.string().email().optional().nullable(),
      companySiret: z.string().optional().nullable(),
      companyTva: z.string().optional().nullable(),
      legalMentions: z.string().optional().nullable(),
      termsAndConditions: z.string().optional().nullable(),
      footerText: z.string().optional().nullable(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      const { id, ...data } = input;
      
      // Si isDefault est true, désactiver les autres templates par défaut du même type
      if (data.isDefault) {
        // Récupérer le type du template
        const template = await db_inst
          .select()
          .from(documentTemplates)
          .where(eq(documentTemplates.id, id))
          .limit(1);
        
        if (template[0]) {
          await db_inst
            .update(documentTemplates)
            .set({ isDefault: false })
            .where(
              and(
                eq(documentTemplates.userId, ctx.user!.id),
                eq(documentTemplates.type, template[0].type)
              )
            );
        }
      }
      
      await db_inst
        .update(documentTemplates)
        .set(data)
        .where(
          and(
            eq(documentTemplates.id, id),
            eq(documentTemplates.userId, ctx.user!.id)
          )
        );
      
      return { success: true };
    }),
  
  // Supprimer un template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db_inst = await getDb();
      if (!db_inst) throw new Error("Database not available");
      
      await db_inst
        .delete(documentTemplates)
        .where(
          and(
            eq(documentTemplates.id, input.id),
            eq(documentTemplates.userId, ctx.user!.id)
          )
        );
      
      return { success: true };
    }),
});
