import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import * as db from "./db";

/**
 * Router pour l'upload d'images (avatars, logos)
 */
export const uploadRouter = router({
  /**
   * Upload avatar client
   */
  uploadClientAvatar: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      imageData: z.string(), // Base64 encoded image
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Décoder le base64
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Générer un nom de fichier unique
      const extension = input.mimeType.split("/")[1];
      const fileName = `client-${input.clientId}-avatar-${Date.now()}.${extension}`;
      const fileKey = `avatars/clients/${fileName}`;
      
      // Upload vers S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Mettre à jour le client
      await db.updateClient(input.clientId, { avatarUrl: url });
      
      return { url };
    }),
  
  /**
   * Upload logo projet
   */
  uploadProjectLogo: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      imageData: z.string(), // Base64 encoded image
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Décoder le base64
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Générer un nom de fichier unique
      const extension = input.mimeType.split("/")[1];
      const fileName = `project-${input.projectId}-logo-${Date.now()}.${extension}`;
      const fileKey = `logos/projects/${fileName}`;
      
      // Upload vers S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Mettre à jour le projet
      await db.updateProject(input.projectId, { logoUrl: url });
      
      return { url };
    }),
  
  /**
   * Upload avatar admin
   */
  uploadAdminAvatar: protectedProcedure
    .input(z.object({
      imageData: z.string(), // Base64 encoded image
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Décoder le base64
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Générer un nom de fichier unique
      const extension = input.mimeType.split("/")[1];
      const fileName = `admin-${ctx.user.id}-avatar-${Date.now()}.${extension}`;
      const fileKey = `avatars/admin/${fileName}`;
      
      // Upload vers S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Mettre à jour l'utilisateur
      await db.updateUser(ctx.user.id, { avatarUrl: url });
      
      return { url };
    }),
});
