import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { projectNotes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const projectNotesRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return db
        .select()
        .from(projectNotes)
        .where(eq(projectNotes.projectId, input.projectId));
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        content: z.string(),
        tags: z.string().optional(),
        isPinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(projectNotes).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.string().optional().nullable(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db
        .update(projectNotes)
        .set(data)
        .where(eq(projectNotes.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(projectNotes)
        .where(eq(projectNotes.id, input.id));
      return { success: true };
    }),
});
