import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * COACH DIGITAL - Database Schema
 * Plateforme de gestion de coaching pour avocats et chefs d'entreprise
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "client"]).default("user").notNull(),
  clientId: int("clientId"), // Lien vers client si role=client
  avatarUrl: text("avatarUrl"),
  defaultHourlyRate: decimal("defaultHourlyRate", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// CLIENTS
// ============================================================================

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  postalCode: varchar("postalCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatarUrl"),
  userId: int("userId"), // Lien vers user si compte créé
  notes: text("notes"),
  tags: json("tags").$type<string[]>(),
  category: mysqlEnum("category", ["prospect", "active", "inactive", "vip"]).default("prospect").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  siret: varchar("siret", { length: 14 }),
  tvaNumber: varchar("tvaNumber", { length: 20 }),
  defaultHourlyRate: decimal("defaultHourlyRate", { precision: 10, scale: 2 }),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================================
// COMPANY (Entreprise de Gilles)
// ============================================================================

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  legalForm: mysqlEnum("legalForm", ["EI", "EIRL", "EURL", "SARL", "SAS", "SASU", "SA", "SNC", "SCI", "Auto-entrepreneur"]),
  address: text("address"),
  postalCode: varchar("postalCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  siret: varchar("siret", { length: 14 }).notNull(),
  tvaNumber: varchar("tvaNumber", { length: 20 }),
  tvaApplicable: boolean("tvaApplicable").default(true).notNull(),
  capital: decimal("capital", { precision: 12, scale: 2 }),
  rcs: varchar("rcs", { length: 50 }),
  apeCode: varchar("apeCode", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logoUrl"),
  bankName: varchar("bankName", { length: 100 }),
  bankIban: varchar("bankIban", { length: 34 }),
  bankBic: varchar("bankBic", { length: 11 }),
  defaultPaymentTerms: int("defaultPaymentTerms").default(30).notNull(),
  defaultInvoiceFooter: text("defaultInvoiceFooter"),
  defaultQuoteFooter: text("defaultQuoteFooter"),
  invoicePrefix: varchar("invoicePrefix", { length: 10 }).default("FAC").notNull(),
  quotePrefix: varchar("quotePrefix", { length: 10 }).default("DEV").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================================================
// PROJECTS
// ============================================================================

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId").notNull(),
  status: mysqlEnum("status", ["draft", "active", "on_hold", "completed", "cancelled"]).default("draft").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  deadline: timestamp("deadline"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  estimatedHours: decimal("estimatedHours", { precision: 10, scale: 2 }),
  color: varchar("color", { length: 7 }),
  tags: json("tags").$type<string[]>(),
  repositoryUrl: text("repositoryUrl"),
  stagingUrl: text("stagingUrl"),
  productionUrl: text("productionUrl"),
  notes: text("notes"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================================================
// TASKS
// ============================================================================

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId"),
  projectId: int("projectId"),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done", "cancelled"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  type: mysqlEnum("type", ["task", "bug", "feature", "meeting", "call", "email", "other"]).default("task").notNull(),
  productionDate: timestamp("productionDate"),
  timeSlot: mysqlEnum("timeSlot", ["morning", "afternoon", "evening"]),
  startTime: varchar("startTime", { length: 5 }),
  endTime: varchar("endTime", { length: 5 }),
  estimatedHours: decimal("estimatedHours", { precision: 10, scale: 2 }),
  actualHours: decimal("actualHours", { precision: 10, scale: 2 }),
  progress: int("progress").default(0),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  isBillable: boolean("isBillable").default(true).notNull(),
  isInvoiced: boolean("isInvoiced").default(false).notNull(),
  invoicedDocumentId: int("invoicedDocumentId"),
  tags: json("tags").$type<string[]>(),
  checklist: json("checklist").$type<Array<{ text: string; completed: boolean; order: number }>>(),
  attachments: json("attachments").$type<Array<{ name: string; url: string; type: string; size: number }>>(),
  notes: text("notes"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================================================
// TASK ACTIVITIES (Suivi temps)
// ============================================================================

export const taskActivities = mysqlTable("taskActivities", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId"),
  clientId: int("clientId"),
  projectId: int("projectId"),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  isBillable: boolean("isBillable").default(true).notNull(),
  isInvoiced: boolean("isInvoiced").default(false).notNull(),
  invoicedDocumentId: int("invoicedDocumentId"),
  notes: text("notes"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskActivity = typeof taskActivities.$inferSelect;
export type InsertTaskActivity = typeof taskActivities.$inferInsert;

// ============================================================================
// DOCUMENTS (Devis/Factures)
// ============================================================================

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["quote", "invoice", "credit_note", "proforma"]).notNull(),
  number: varchar("number", { length: 50 }).notNull().unique(),
  companyId: int("companyId").notNull(),
  clientId: int("clientId").notNull(),
  projectId: int("projectId"),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "rejected", "paid", "partial", "overdue", "cancelled"]).default("draft").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  validityDate: timestamp("validityDate"),
  subject: varchar("subject", { length: 255 }),
  introduction: text("introduction"),
  conclusion: text("conclusion"),
  totalHt: decimal("totalHt", { precision: 12, scale: 2 }).default("0").notNull(),
  totalTva: decimal("totalTva", { precision: 12, scale: 2 }).default("0").notNull(),
  totalTtc: decimal("totalTtc", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  paymentTerms: int("paymentTerms").default(30),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "check", "card", "cash", "other"]),
  isAcompteRequired: boolean("isAcompteRequired").default(false).notNull(),
  acomptePercentage: decimal("acomptePercentage", { precision: 5, scale: 2 }),
  acompteAmount: decimal("acompteAmount", { precision: 12, scale: 2 }),
  pdfUrl: text("pdfUrl"),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  acceptedAt: timestamp("acceptedAt"),
  notes: text("notes"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================================
// DOCUMENT LINES
// ============================================================================

export const documentLines = mysqlTable("documentLines", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  order: int("order").notNull(),
  type: mysqlEnum("type", ["product", "service", "section", "comment"]).default("service").notNull(),
  prestationId: int("prestationId"),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unit: mysqlEnum("unit", ["unit", "hour", "day", "month", "forfait", "word", "page"]).default("unit").notNull(),
  unitPriceHt: decimal("unitPriceHt", { precision: 12, scale: 2 }).default("0").notNull(),
  tvaRate: decimal("tvaRate", { precision: 5, scale: 2 }).default("20").notNull(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).default("0"),
  totalHt: decimal("totalHt", { precision: 12, scale: 2 }).default("0").notNull(),
  totalTva: decimal("totalTva", { precision: 12, scale: 2 }).default("0").notNull(),
  totalTtc: decimal("totalTtc", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentLine = typeof documentLines.$inferSelect;
export type InsertDocumentLine = typeof documentLines.$inferInsert;

// ============================================================================
// PAYMENTS
// ============================================================================

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  clientId: int("clientId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "check", "card", "cash", "other"]).notNull(),
  transactionReference: varchar("transactionReference", { length: 100 }),
  notes: text("notes"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================================
// PRESTATIONS (Catalogue services)
// ============================================================================

export const famillePrestations = mysqlTable("famillePrestations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamillePrestation = typeof famillePrestations.$inferSelect;
export type InsertFamillePrestation = typeof famillePrestations.$inferInsert;

export const prestations = mysqlTable("prestations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  familleId: int("familleId"),
  unitPriceHt: decimal("unitPriceHt", { precision: 12, scale: 2 }).notNull(),
  unit: mysqlEnum("unit", ["unit", "hour", "day", "month", "forfait", "word", "page", "package"]).default("hour").notNull(),
  defaultTvaRate: decimal("defaultTvaRate", { precision: 5, scale: 2 }).default("20").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prestation = typeof prestations.$inferSelect;
export type InsertPrestation = typeof prestations.$inferInsert;

// ============================================================================
// NOTES
// ============================================================================

export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  clientId: int("clientId"),
  projectId: int("projectId"),
  taskId: int("taskId"),
  category: mysqlEnum("category", ["general", "meeting", "call", "email", "idea", "technical", "other"]).default("general").notNull(),
  tags: json("tags").$type<string[]>(),
  isPinned: boolean("isPinned").default(false).notNull(),
  color: varchar("color", { length: 7 }),
  attachments: json("attachments").$type<Array<{ name: string; url: string; type: string; size: number }>>(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// ============================================================================
// MESSAGES
// ============================================================================

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  clientId: int("clientId"),
  projectId: int("projectId"),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// SECRETS (Coffre-fort)
// ============================================================================

export const secrets = mysqlTable("secrets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: int("clientId"),
  projectId: int("projectId"),
  category: mysqlEnum("category", ["hosting", "database", "api", "social", "email", "ftp", "ssh", "other", "security", "server", "crm"]).default("other").notNull(),
  url: text("url"),
  login: varchar("login", { length: 255 }),
  password: text("password"), // À chiffrer en production
  notes: text("notes"),
  isSharedWithClient: boolean("isSharedWithClient").default(false).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Secret = typeof secrets.$inferSelect;
export type InsertSecret = typeof secrets.$inferInsert;

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export const calendarEvents = mysqlTable("calendarEvents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId"),
  projectId: int("projectId"),
  taskId: int("taskId"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  allDay: boolean("allDay").default(false).notNull(),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["meeting", "call", "deadline", "reminder", "event", "other"]).default("event").notNull(),
  color: varchar("color", { length: 7 }),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// ============================================================================
// CLIENT INTERACTIONS
// ============================================================================

export const clientInteractions = mysqlTable("clientInteractions", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  type: mysqlEnum("type", ["call", "email", "meeting", "note", "task", "document", "payment", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  durationMinutes: int("durationMinutes"),
  outcome: text("outcome"),
  nextSteps: text("nextSteps"),
  relatedId: int("relatedId"),
  relatedType: varchar("relatedType", { length: 50 }),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type InsertClientInteraction = typeof clientInteractions.$inferInsert;
