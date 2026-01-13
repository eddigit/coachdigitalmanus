import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { projectVariables } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const projectVariablesRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return db
        .select()
        .from(projectVariables)
        .where(eq(projectVariables.projectId, input.projectId));
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string(),
        value: z.string(),
        type: z.string(),
        description: z.string().optional(),
        isSecret: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(projectVariables).values(input);
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        value: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional().nullable(),
        isSecret: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db
        .update(projectVariables)
        .set(data)
        .where(eq(projectVariables.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(projectVariables)
        .where(eq(projectVariables.id, input.id));
      return { success: true };
    }),
});
