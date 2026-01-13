import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

/**
 * COACH DIGITAL - tRPC Routers
 * API complète pour la plateforme de gestion de coaching
 */

// ============================================================================
// AUTH ROUTER
// ============================================================================

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

// ============================================================================
// CLIENTS ROUTER
// ============================================================================

const clientsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.status) filters.status = input.status;
      if (input?.category) filters.category = input.category;

      return await db.getAllClients(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getClientById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        company: z.string().optional(),
        address: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        avatarUrl: z.string().optional(),
        notes: z.string().optional(),
        category: z.enum(["prospect", "active", "inactive", "vip"]).optional(),
        status: z.enum(["active", "inactive"]).optional(),
        siret: z.string().optional(),
        tvaNumber: z.string().optional(),
        defaultHourlyRate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createClient({
        ...input,
        createdById: ctx.user.id,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().optional(),
        notes: z.string().optional(),
        category: z.enum(["prospect", "active", "inactive", "vip"]).optional(),
        status: z.enum(["active", "inactive"]).optional(),
        siret: z.string().optional(),
        tvaNumber: z.string().optional(),
        defaultHourlyRate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateClient(id, data);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteClient(input.id);
    return { success: true };
  }),
});

// ============================================================================
// COMPANIES ROUTER
// ============================================================================

const companiesRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllCompanies();
  }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getCompanyById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        legalForm: z.enum(["EI", "EIRL", "EURL", "SARL", "SAS", "SASU", "SA", "SNC", "SCI", "Auto-entrepreneur"]).optional(),
        address: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        siret: z.string(),
        tvaNumber: z.string().optional(),
        tvaApplicable: z.boolean().optional(),
        capital: z.string().optional(),
        rcs: z.string().optional(),
        apeCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        bankName: z.string().optional(),
        bankIban: z.string().optional(),
        bankBic: z.string().optional(),
        defaultPaymentTerms: z.number().optional(),
        defaultInvoiceFooter: z.string().optional(),
        defaultQuoteFooter: z.string().optional(),
        invoicePrefix: z.string().optional(),
        quotePrefix: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await db.createCompany(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        legalForm: z.enum(["EI", "EIRL", "EURL", "SARL", "SAS", "SASU", "SA", "SNC", "SCI", "Auto-entrepreneur"]).optional(),
        address: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        siret: z.string().optional(),
        tvaNumber: z.string().optional(),
        tvaApplicable: z.boolean().optional(),
        capital: z.string().optional(),
        rcs: z.string().optional(),
        apeCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        bankName: z.string().optional(),
        bankIban: z.string().optional(),
        bankBic: z.string().optional(),
        defaultPaymentTerms: z.number().optional(),
        defaultInvoiceFooter: z.string().optional(),
        defaultQuoteFooter: z.string().optional(),
        invoicePrefix: z.string().optional(),
        quotePrefix: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCompany(id, data as any);
      return { success: true };
    }),
});

// ============================================================================
// PROJECTS ROUTER
// ============================================================================

const projectsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.status) filters.status = input.status;

      return await db.getAllProjects(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getProjectById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        clientId: z.number(),
        status: z.enum(["draft", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        deadline: z.date().optional(),
        budget: z.string().optional(),
        hourlyRate: z.string().optional(),
        estimatedHours: z.string().optional(),
        color: z.string().optional(),
        repositoryUrl: z.string().optional(),
        stagingUrl: z.string().optional(),
        productionUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createProject({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        deadline: z.date().optional(),
        budget: z.string().optional(),
        hourlyRate: z.string().optional(),
        estimatedHours: z.string().optional(),
        color: z.string().optional(),
        repositoryUrl: z.string().optional(),
        stagingUrl: z.string().optional(),
        productionUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateProject(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteProject(input.id);
    return { success: true };
  }),
});

// ============================================================================
// TASKS ROUTER
// ============================================================================

const tasksRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;
      if (input?.status) filters.status = input.status;

      return await db.getAllTasks(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getTaskById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        type: z.enum(["task", "bug", "feature", "meeting", "call", "email", "other"]).optional(),
        productionDate: z.date().optional(),
        timeSlot: z.enum(["morning", "afternoon", "evening"]).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        estimatedHours: z.string().optional(),
        hourlyRate: z.string().optional(),
        isBillable: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createTask({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        type: z.enum(["task", "bug", "feature", "meeting", "call", "email", "other"]).optional(),
        productionDate: z.date().optional(),
        timeSlot: z.enum(["morning", "afternoon", "evening"]).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        estimatedHours: z.string().optional(),
        actualHours: z.string().optional(),
        progress: z.number().optional(),
        hourlyRate: z.string().optional(),
        isBillable: z.boolean().optional(),
        isInvoiced: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTask(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteTask(input.id);
    return { success: true };
  }),
});

// ============================================================================
// TASK ACTIVITIES ROUTER
// ============================================================================

const taskActivitiesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          taskId: z.number().optional(),
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          isBillable: z.boolean().optional(),
          isInvoiced: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.taskId) filters.taskId = input.taskId;
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;
      if (input?.isBillable !== undefined) filters.isBillable = input.isBillable;
      if (input?.isInvoiced !== undefined) filters.isInvoiced = input.isInvoiced;

      return await db.getAllTaskActivities(filters);
    }),

  create: protectedProcedure
    .input(
      z.object({
        taskId: z.number().optional(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        durationMinutes: z.number(),
        hourlyRate: z.string().optional(),
        isBillable: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createTaskActivity({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        date: z.date().optional(),
        durationMinutes: z.number().optional(),
        hourlyRate: z.string().optional(),
        isBillable: z.boolean().optional(),
        isInvoiced: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTaskActivity(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteTaskActivity(input.id);
    return { success: true };
  }),
});

// ============================================================================
// DOCUMENTS ROUTER
// ============================================================================

const documentsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          type: z.string().optional(),
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;
      if (input?.type) filters.type = input.type;
      if (input?.status) filters.status = input.status;

      return await db.getAllDocuments(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getDocumentById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["quote", "invoice", "credit_note", "proforma"]),
        number: z.string(),
        companyId: z.number(),
        clientId: z.number(),
        projectId: z.number().optional(),
        status: z.enum(["draft", "sent", "viewed", "accepted", "rejected", "paid", "partial", "overdue", "cancelled"]).optional(),
        date: z.date().optional(),
        dueDate: z.date().optional(),
        validityDate: z.date().optional(),
        subject: z.string().optional(),
        introduction: z.string().optional(),
        conclusion: z.string().optional(),
        totalHt: z.string().optional(),
        totalTva: z.string().optional(),
        totalTtc: z.string().optional(),
        discountAmount: z.string().optional(),
        currency: z.string().optional(),
        paymentTerms: z.number().optional(),
        paymentMethod: z.enum(["bank_transfer", "check", "card", "cash", "other"]).optional(),
        isAcompteRequired: z.boolean().optional(),
        acomptePercentage: z.string().optional(),
        acompteAmount: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createDocument({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "viewed", "accepted", "rejected", "paid", "partial", "overdue", "cancelled"]).optional(),
        subject: z.string().optional(),
        introduction: z.string().optional(),
        conclusion: z.string().optional(),
        totalHt: z.string().optional(),
        totalTva: z.string().optional(),
        totalTtc: z.string().optional(),
        discountAmount: z.string().optional(),
        pdfUrl: z.string().optional(),
        sentAt: z.date().optional(),
        viewedAt: z.date().optional(),
        acceptedAt: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateDocument(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteDocument(input.id);
    return { success: true };
  }),

  getLines: protectedProcedure.input(z.object({ documentId: z.number() })).query(async ({ input }) => {
    return await db.getDocumentLinesByDocumentId(input.documentId);
  }),

  createLine: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        order: z.number(),
        type: z.enum(["product", "service", "section", "comment"]).optional(),
        prestationId: z.number().optional(),
        description: z.string(),
        quantity: z.string().optional(),
        unit: z.enum(["unit", "hour", "day", "month", "forfait", "word", "page"]).optional(),
        unitPriceHt: z.string().optional(),
        tvaRate: z.string().optional(),
        discountPercent: z.string().optional(),
        totalHt: z.string().optional(),
        totalTva: z.string().optional(),
        totalTtc: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await db.createDocumentLine(input as any);
      return { id };
    }),

  updateLine: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        order: z.number().optional(),
        description: z.string().optional(),
        quantity: z.string().optional(),
        unitPriceHt: z.string().optional(),
        tvaRate: z.string().optional(),
        discountPercent: z.string().optional(),
        totalHt: z.string().optional(),
        totalTva: z.string().optional(),
        totalTtc: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateDocumentLine(id, data as any);
      return { success: true };
    }),

  deleteLine: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteDocumentLine(input.id);
    return { success: true };
  }),
});

// ============================================================================
// PRESTATIONS ROUTER
// ============================================================================

const prestationsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          familleId: z.number().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await db.getAllPrestations(input);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getPrestationById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        familleId: z.number().optional(),
        unitPriceHt: z.string(),
        unit: z.enum(["unit", "hour", "day", "month", "forfait", "word", "page", "package"]).optional(),
        defaultTvaRate: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createPrestation({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        familleId: z.number().optional(),
        unitPriceHt: z.string().optional(),
        unit: z.enum(["unit", "hour", "day", "month", "forfait", "word", "page", "package"]).optional(),
        defaultTvaRate: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updatePrestation(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deletePrestation(input.id);
    return { success: true };
  }),

  listFamilles: protectedProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await db.getAllFamillePrestations(input);
    }),

  createFamille: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        color: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createFamillePrestation({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  updateFamille: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateFamillePrestation(id, data as any);
      return { success: true };
    }),
});

// ============================================================================
// NOTES ROUTER
// ============================================================================

const notesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          taskId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;
      if (input?.taskId) filters.taskId = input.taskId;

      return await db.getAllNotes(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getNoteById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        taskId: z.number().optional(),
        category: z.enum(["general", "meeting", "call", "email", "idea", "technical", "other"]).optional(),
        isPinned: z.boolean().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createNote({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["general", "meeting", "call", "email", "idea", "technical", "other"]).optional(),
        isPinned: z.boolean().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateNote(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteNote(input.id);
    return { success: true };
  }),
});

// ============================================================================
// MESSAGES ROUTER
// ============================================================================

const messagesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      // Admin voit tous les messages, client voit seulement ses messages
      if (ctx.user.role === "client") {
        filters.toUserId = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;

      return await db.getAllMessages(filters);
    }),

  create: protectedProcedure
    .input(
      z.object({
        toUserId: z.number(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        subject: z.string().optional(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createMessage({
        ...input,
        fromUserId: ctx.user.id,
      } as any);
      return { id };
    }),

  markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.updateMessage(input.id, { read: true, readAt: new Date() } as any);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteMessage(input.id);
    return { success: true };
  }),
});

// ============================================================================
// SECRETS ROUTER
// ============================================================================

const secretsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;

      return await db.getAllSecrets(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getSecretById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        category: z
          .enum(["hosting", "database", "api", "social", "email", "ftp", "ssh", "other", "security", "server", "crm"])
          .optional(),
        url: z.string().optional(),
        login: z.string().optional(),
        password: z.string().optional(),
        notes: z.string().optional(),
        isSharedWithClient: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createSecret({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z
          .enum(["hosting", "database", "api", "social", "email", "ftp", "ssh", "other", "security", "server", "crm"])
          .optional(),
        url: z.string().optional(),
        login: z.string().optional(),
        password: z.string().optional(),
        notes: z.string().optional(),
        isSharedWithClient: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSecret(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteSecret(input.id);
    return { success: true };
  }),
});

// ============================================================================
// CALENDAR EVENTS ROUTER
// ============================================================================

const calendarEventsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          taskId: z.number().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;
      if (input?.projectId) filters.projectId = input.projectId;
      if (input?.taskId) filters.taskId = input.taskId;
      if (input?.startDate) filters.startDate = input.startDate;
      if (input?.endDate) filters.endDate = input.endDate;

      return await db.getAllCalendarEvents(filters);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await db.getCalendarEventById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        clientId: z.number().optional(),
        projectId: z.number().optional(),
        taskId: z.number().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        allDay: z.boolean().optional(),
        location: z.string().optional(),
        type: z.enum(["meeting", "call", "deadline", "reminder", "event", "other"]).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createCalendarEvent({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        allDay: z.boolean().optional(),
        location: z.string().optional(),
        type: z.enum(["meeting", "call", "deadline", "reminder", "event", "other"]).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCalendarEvent(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteCalendarEvent(input.id);
    return { success: true };
  }),
});

// ============================================================================
// CLIENT INTERACTIONS ROUTER
// ============================================================================

const clientInteractionsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;

      return await db.getAllClientInteractions(filters);
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        type: z.enum(["call", "email", "meeting", "note", "task", "document", "payment", "other"]),
        title: z.string(),
        description: z.string().optional(),
        date: z.date().optional(),
        durationMinutes: z.number().optional(),
        outcome: z.string().optional(),
        nextSteps: z.string().optional(),
        relatedId: z.number().optional(),
        relatedType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createClientInteraction({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["call", "email", "meeting", "note", "task", "document", "payment", "other"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        durationMinutes: z.number().optional(),
        outcome: z.string().optional(),
        nextSteps: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateClientInteraction(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteClientInteraction(input.id);
    return { success: true };
  }),
});

// ============================================================================
// PAYMENTS ROUTER
// ============================================================================

const paymentsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          clientId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};
      if (ctx.user.role !== "admin") {
        filters.createdById = ctx.user.id;
      }
      if (input?.clientId) filters.clientId = input.clientId;

      return await db.getAllPayments(filters);
    }),

  getByDocumentId: protectedProcedure.input(z.object({ documentId: z.number() })).query(async ({ input }) => {
    return await db.getPaymentsByDocumentId(input.documentId);
  }),

  create: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        clientId: z.number(),
        amount: z.string(),
        paymentDate: z.date().optional(),
        paymentMethod: z.enum(["bank_transfer", "check", "card", "cash", "other"]),
        transactionReference: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await db.createPayment({
        ...input,
        createdById: ctx.user.id,
      } as any);
      return { id };
    }),
});

// ============================================================================
// APP ROUTER (Main)
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  clients: clientsRouter,
  companies: companiesRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  taskActivities: taskActivitiesRouter,
  documents: documentsRouter,
  prestations: prestationsRouter,
  notes: notesRouter,
  messages: messagesRouter,
  secrets: secretsRouter,
  calendarEvents: calendarEventsRouter,
  clientInteractions: clientInteractionsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
