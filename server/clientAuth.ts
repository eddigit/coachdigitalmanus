import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { clientUsers, type InsertClientUser } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Authentification pour l'espace client séparé
 * Système login/password indépendant de l'OAuth Manus
 */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createClientUser(data: {
  clientId: number;
  email: string;
  password: string;
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Vérifier si l'email existe déjà
    const existing = await db
      .select()
      .from(clientUsers)
      .where(eq(clientUsers.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Email already exists" };
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(data.password);

    // Créer l'utilisateur client
    const result = await db.insert(clientUsers).values({
      clientId: data.clientId,
      email: data.email,
      passwordHash,
      isActive: true,
    });

    return { success: true, userId: Number(result[0].insertId) };
  } catch (error) {
    console.error("[ClientAuth] Error creating client user:", error);
    return { success: false, error: "Failed to create client user" };
  }
}

export async function authenticateClientUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Trouver l'utilisateur par email
    const users = await db
      .select()
      .from(clientUsers)
      .where(eq(clientUsers.email, email))
      .limit(1);

    if (users.length === 0) {
      return { success: false, error: "Invalid credentials" };
    }

    const user = users[0];

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return { success: false, error: "Account is inactive" };
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Mettre à jour la date de dernière connexion
    await db
      .update(clientUsers)
      .set({ lastLogin: new Date() })
      .where(eq(clientUsers.id, user.id));

    return {
      success: true,
      user: {
        id: user.id,
        clientId: user.clientId,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("[ClientAuth] Error authenticating client user:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function generateInvitationToken(clientId: number, email: string): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const token = nanoid(32);

  // Créer ou mettre à jour l'utilisateur client avec le token d'invitation
  const existing = await db
    .select()
    .from(clientUsers)
    .where(eq(clientUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    // Mettre à jour le token
    await db
      .update(clientUsers)
      .set({
        invitationToken: token,
        invitationSentAt: new Date(),
      })
      .where(eq(clientUsers.id, existing[0].id));
  } else {
    // Créer un nouvel utilisateur avec token (sans mot de passe encore)
    await db.insert(clientUsers).values({
      clientId,
      email,
      passwordHash: "", // Sera défini lors de l'acceptation de l'invitation
      invitationToken: token,
      invitationSentAt: new Date(),
      isActive: false, // Inactif jusqu'à l'acceptation
    });
  }

  return token;
}

export async function acceptInvitation(
  token: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Trouver l'utilisateur par token
    const users = await db
      .select()
      .from(clientUsers)
      .where(eq(clientUsers.invitationToken, token))
      .limit(1);

    if (users.length === 0) {
      return { success: false, error: "Invalid invitation token" };
    }

    const user = users[0];

    // Hasher le nouveau mot de passe
    const passwordHash = await hashPassword(password);

    // Activer le compte et définir le mot de passe
    await db
      .update(clientUsers)
      .set({
        passwordHash,
        isActive: true,
        invitationToken: null,
        invitationSentAt: null,
      })
      .where(eq(clientUsers.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("[ClientAuth] Error accepting invitation:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}
