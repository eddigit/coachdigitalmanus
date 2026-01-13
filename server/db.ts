import { eq, and, desc, asc, like, or, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  clients,
  InsertClient,
  companies,
  InsertCompany,
  projects,
  InsertProject,
  tasks,
  InsertTask,
  taskActivities,
  InsertTaskActivity,
  documents,
  InsertDocument,
  documentLines,
  InsertDocumentLine,
  payments,
  InsertPayment,
  prestations,
  InsertPrestation,
  famillePrestations,
  InsertFamillePrestation,
  notes,
  InsertNote,
  messages,
  InsertMessage,
  secrets,
  InsertSecret,
  calendarEvents,
  InsertCalendarEvent,
  clientInteractions,
  InsertClientInteraction,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USERS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ============================================================================
// CLIENTS
// ============================================================================

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(clients).values(client);
  return Number(result.insertId);
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClients(filters?: { createdById?: number; status?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(clients);

  const conditions = [];
  if (filters?.createdById) {
    conditions.push(eq(clients.createdById, filters.createdById));
  }
  if (filters?.status) {
    conditions.push(eq(clients.status, filters.status as any));
  }
  if (filters?.category) {
    conditions.push(eq(clients.category, filters.category as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(clients.createdAt));
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(eq(clients.id, id));
}

// ============================================================================
// COMPANIES
// ============================================================================

export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(companies).values(company);
  return Number(result.insertId);
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(companies).set(data).where(eq(companies.id, id));
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(projects).values(project);
  return Number(result.insertId);
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProjects(filters?: { clientId?: number; status?: string; createdById?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(projects);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(projects.clientId, filters.clientId));
  }
  if (filters?.status) {
    conditions.push(eq(projects.status, filters.status as any));
  }
  if (filters?.createdById) {
    conditions.push(eq(projects.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(projects.createdAt));
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(projects).where(eq(projects.id, id));
}

// ============================================================================
// TASKS
// ============================================================================

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(tasks).values(task);
  return Number(result.insertId);
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTasks(filters?: {
  clientId?: number;
  projectId?: number;
  status?: string;
  createdById?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(tasks);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(tasks.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters?.status) {
    conditions.push(eq(tasks.status, filters.status as any));
  }
  if (filters?.createdById) {
    conditions.push(eq(tasks.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(tasks.createdAt));
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(tasks).where(eq(tasks.id, id));
}

// ============================================================================
// TASK ACTIVITIES
// ============================================================================

export async function createTaskActivity(activity: InsertTaskActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(taskActivities).values(activity);
  return Number(result.insertId);
}

export async function getTaskActivityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(taskActivities).where(eq(taskActivities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTaskActivities(filters?: {
  taskId?: number;
  clientId?: number;
  projectId?: number;
  isBillable?: boolean;
  isInvoiced?: boolean;
  createdById?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(taskActivities);

  const conditions = [];
  if (filters?.taskId) {
    conditions.push(eq(taskActivities.taskId, filters.taskId));
  }
  if (filters?.clientId) {
    conditions.push(eq(taskActivities.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(taskActivities.projectId, filters.projectId));
  }
  if (filters?.isBillable !== undefined) {
    conditions.push(eq(taskActivities.isBillable, filters.isBillable));
  }
  if (filters?.isInvoiced !== undefined) {
    conditions.push(eq(taskActivities.isInvoiced, filters.isInvoiced));
  }
  if (filters?.createdById) {
    conditions.push(eq(taskActivities.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(taskActivities.date));
}

export async function updateTaskActivity(id: number, data: Partial<InsertTaskActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(taskActivities).set(data).where(eq(taskActivities.id, id));
}

export async function deleteTaskActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(taskActivities).where(eq(taskActivities.id, id));
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function createDocument(document: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(documents).values(document);
  return Number(result.insertId);
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDocuments(filters?: {
  clientId?: number;
  projectId?: number;
  type?: string;
  status?: string;
  createdById?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(documents);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(documents.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(documents.projectId, filters.projectId));
  }
  if (filters?.type) {
    conditions.push(eq(documents.type, filters.type as any));
  }
  if (filters?.status) {
    conditions.push(eq(documents.status, filters.status as any));
  }
  if (filters?.createdById) {
    conditions.push(eq(documents.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(documents.date));
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(documents).where(eq(documents.id, id));
}

// ============================================================================
// DOCUMENT LINES
// ============================================================================

export async function createDocumentLine(line: InsertDocumentLine) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(documentLines).values(line);
  return Number(result.insertId);
}

export async function getDocumentLinesByDocumentId(documentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documentLines)
    .where(eq(documentLines.documentId, documentId))
    .orderBy(asc(documentLines.order));
}

export async function updateDocumentLine(id: number, data: Partial<InsertDocumentLine>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(documentLines).set(data).where(eq(documentLines.id, id));
}

export async function deleteDocumentLine(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(documentLines).where(eq(documentLines.id, id));
}

export async function deleteDocumentLinesByDocumentId(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(documentLines).where(eq(documentLines.documentId, documentId));
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(payments).values(payment);
  return Number(result.insertId);
}

export async function getPaymentsByDocumentId(documentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(payments)
    .where(eq(payments.documentId, documentId))
    .orderBy(desc(payments.paymentDate));
}

export async function getAllPayments(filters?: { clientId?: number; createdById?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(payments);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(payments.clientId, filters.clientId));
  }
  if (filters?.createdById) {
    conditions.push(eq(payments.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(payments.paymentDate));
}

// ============================================================================
// PRESTATIONS
// ============================================================================

export async function createPrestation(prestation: InsertPrestation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(prestations).values(prestation);
  return Number(result.insertId);
}

export async function getPrestationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(prestations).where(eq(prestations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPrestations(filters?: { familleId?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(prestations);

  const conditions = [];
  if (filters?.familleId) {
    conditions.push(eq(prestations.familleId, filters.familleId));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(prestations.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(asc(prestations.name));
}

export async function updatePrestation(id: number, data: Partial<InsertPrestation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(prestations).set(data).where(eq(prestations.id, id));
}

export async function deletePrestation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(prestations).where(eq(prestations.id, id));
}

// ============================================================================
// FAMILLE PRESTATIONS
// ============================================================================

export async function createFamillePrestation(famille: InsertFamillePrestation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(famillePrestations).values(famille);
  return Number(result.insertId);
}

export async function getAllFamillePrestations(filters?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(famillePrestations);

  if (filters?.isActive !== undefined) {
    query = query.where(eq(famillePrestations.isActive, filters.isActive)) as any;
  }

  return await query.orderBy(asc(famillePrestations.order));
}

export async function updateFamillePrestation(id: number, data: Partial<InsertFamillePrestation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(famillePrestations).set(data).where(eq(famillePrestations.id, id));
}

// ============================================================================
// NOTES
// ============================================================================

export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(notes).values(note);
  return Number(result.insertId);
}

export async function getNoteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllNotes(filters?: {
  clientId?: number;
  projectId?: number;
  taskId?: number;
  createdById?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(notes);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(notes.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(notes.projectId, filters.projectId));
  }
  if (filters?.taskId) {
    conditions.push(eq(notes.taskId, filters.taskId));
  }
  if (filters?.createdById) {
    conditions.push(eq(notes.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(notes.isPinned), desc(notes.createdAt));
}

export async function updateNote(id: number, data: Partial<InsertNote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notes).set(data).where(eq(notes.id, id));
}

export async function deleteNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(notes).where(eq(notes.id, id));
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(messages).values(message);
  return Number(result.insertId);
}

export async function getMessageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllMessages(filters?: { fromUserId?: number; toUserId?: number; clientId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(messages);

  const conditions = [];
  if (filters?.fromUserId) {
    conditions.push(eq(messages.fromUserId, filters.fromUserId));
  }
  if (filters?.toUserId) {
    conditions.push(eq(messages.toUserId, filters.toUserId));
  }
  if (filters?.clientId) {
    conditions.push(eq(messages.clientId, filters.clientId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(messages.createdAt));
}

export async function updateMessage(id: number, data: Partial<InsertMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(messages).set(data).where(eq(messages.id, id));
}

export async function deleteMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(messages).where(eq(messages.id, id));
}

// ============================================================================
// SECRETS
// ============================================================================

export async function createSecret(secret: InsertSecret) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(secrets).values(secret);
  return Number(result.insertId);
}

export async function getSecretById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(secrets).where(eq(secrets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSecrets(filters?: {
  clientId?: number;
  projectId?: number;
  createdById?: number;
  isSharedWithClient?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(secrets);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(secrets.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(secrets.projectId, filters.projectId));
  }
  if (filters?.createdById) {
    conditions.push(eq(secrets.createdById, filters.createdById));
  }
  if (filters?.isSharedWithClient !== undefined) {
    conditions.push(eq(secrets.isSharedWithClient, filters.isSharedWithClient));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(secrets.createdAt));
}

export async function updateSecret(id: number, data: Partial<InsertSecret>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(secrets).set(data).where(eq(secrets.id, id));
}

export async function deleteSecret(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(secrets).where(eq(secrets.id, id));
}

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export async function createCalendarEvent(event: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(calendarEvents).values(event);
  return Number(result.insertId);
}

export async function getCalendarEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCalendarEvents(filters?: {
  clientId?: number;
  projectId?: number;
  taskId?: number;
  createdById?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(calendarEvents);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(calendarEvents.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    conditions.push(eq(calendarEvents.projectId, filters.projectId));
  }
  if (filters?.taskId) {
    conditions.push(eq(calendarEvents.taskId, filters.taskId));
  }
  if (filters?.createdById) {
    conditions.push(eq(calendarEvents.createdById, filters.createdById));
  }
  if (filters?.startDate) {
    conditions.push(gte(calendarEvents.startDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(calendarEvents.startDate, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(asc(calendarEvents.startDate));
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ============================================================================
// CLIENT INTERACTIONS
// ============================================================================

export async function createClientInteraction(interaction: InsertClientInteraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(clientInteractions).values(interaction);
  return Number(result.insertId);
}

export async function getClientInteractionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clientInteractions).where(eq(clientInteractions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClientInteractions(filters?: { clientId?: number; createdById?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(clientInteractions);

  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(clientInteractions.clientId, filters.clientId));
  }
  if (filters?.createdById) {
    conditions.push(eq(clientInteractions.createdById, filters.createdById));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(clientInteractions.date));
}

export async function updateClientInteraction(id: number, data: Partial<InsertClientInteraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clientInteractions).set(data).where(eq(clientInteractions.id, id));
}

export async function deleteClientInteraction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clientInteractions).where(eq(clientInteractions.id, id));
}
