import { readFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Créer la connexion à la base de données
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('✅ Connected to database');

// Charger les données JSON
const jsonData = JSON.parse(readFileSync('/home/ubuntu/upload/GKAC_Export_2026-01-09(2).json', 'utf-8'));

console.log('\n📊 Données à importer:');
Object.keys(jsonData.entities).forEach(entity => {
  console.log(`  - ${entity}: ${jsonData.entities[entity].record_count} records`);
});

const stats = {
  clients: { imported: 0, skipped: 0, errors: 0 },
  projects: { imported: 0, skipped: 0, errors: 0 },
  tasks: { imported: 0, skipped: 0, errors: 0 },
  documents: { imported: 0, skipped: 0, errors: 0 },
  leads: { imported: 0, skipped: 0, errors: 0 },
  emailTemplates: { imported: 0, skipped: 0, errors: 0 },
};

// Mapping des IDs anciens vers nouveaux
const clientIdMap = new Map();
const projectIdMap = new Map();

console.log('\n🔄 Import en cours...\n');

// 1. Importer les Clients
console.log('📥 Import des Clients...');
for (const oldClient of jsonData.entities.Client.data) {
  try {
    // Vérifier si le client existe déjà par email
    const existing = await db.select().from(schema.clients).where(eq(schema.clients.email, oldClient.email)).limit(1);
    
    if (existing.length > 0) {
      clientIdMap.set(oldClient.id, existing[0].id);
      stats.clients.skipped++;
      continue;
    }

    const result = await db.insert(schema.clients).values({
      firstName: oldClient.first_name || '',
      lastName: oldClient.last_name || '',
      email: oldClient.email || null,
      phone: oldClient.phone || null,
      company: oldClient.company || null,
      position: null,
      address: oldClient.address || null,
      postalCode: oldClient.postal_code || null,
      city: oldClient.city || null,
      country: 'France',
      category: oldClient.category === 'client_actif' ? 'active' : 'prospect',
      status: 'active',
      notes: oldClient.notes || null,
      avatarUrl: oldClient.avatar_url || null,
    });

    const newId = typeof result === 'object' && 'insertId' in result ? result.insertId : result[0];
    clientIdMap.set(oldClient.id, newId);
    stats.clients.imported++;
    console.log(`  ✓ ${oldClient.first_name} ${oldClient.last_name}`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${oldClient.first_name} ${oldClient.last_name}:`, error.message);
    stats.clients.errors++;
  }
}

// 2. Importer les Opportunités Commerciales comme Leads
console.log('\n📥 Import des Opportunités Commerciales (Leads)...');
for (const opp of jsonData.entities.CommercialOpportunity.data) {
  try {
    // Vérifier si le lead existe déjà
    const existing = await db.select().from(schema.leads).where(
      and(
        eq(schema.leads.firstName, opp.first_name || ''),
        eq(schema.leads.lastName, opp.last_name || '')
      )
    ).limit(1);
    
    if (existing.length > 0) {
      stats.leads.skipped++;
      continue;
    }

    // Mapper le statut
    let status = 'suspect';
    if (opp.status === 'qualified') status = 'analyse';
    else if (opp.status === 'proposal') status = 'negociation';
    else if (opp.status === 'negotiation') status = 'negociation';
    else if (opp.status === 'won') status = 'conclusion';

    await db.insert(schema.leads).values({
      firstName: opp.first_name || '',
      lastName: opp.last_name || '',
      email: opp.email || null,
      phone: opp.phone || null,
      company: opp.company || null,
      position: opp.position || null,
      status,
      potentialAmount: opp.estimated_value?.toString() || null,
      probability: opp.probability || 25,
      source: opp.source || 'Import ancien système',
      notes: opp.notes || null,
      lastContactDate: opp.last_contact_date ? new Date(opp.last_contact_date) : null,
      nextFollowUpDate: opp.next_follow_up_date ? new Date(opp.next_follow_up_date) : null,
    });

    stats.leads.imported++;
    console.log(`  ✓ ${opp.first_name} ${opp.last_name} (${status})`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${opp.first_name} ${opp.last_name}:`, error.message);
    stats.leads.errors++;
  }
}

// 3. Importer les Projets
console.log('\n📥 Import des Projets...');
for (const oldProject of jsonData.entities.Project.data) {
  try {
    // Trouver le client correspondant
    const clientId = clientIdMap.get(oldProject.client_id);
    if (!clientId) {
      console.log(`  ⚠ Projet "${oldProject.name}" ignoré (client non trouvé)`);
      stats.projects.skipped++;
      continue;
    }

    // Mapper le statut
    let status = 'active';
    if (oldProject.status === 'completed') status = 'completed';
    else if (oldProject.status === 'cancelled') status = 'cancelled';
    else if (oldProject.status === 'on_hold') status = 'on_hold';

    const result = await db.insert(schema.projects).values({
      name: oldProject.name || 'Projet sans nom',
      description: oldProject.description || null,
      clientId: clientId,
      type: 'other',
      status,
      priority: 'normal',
      startDate: oldProject.start_date ? new Date(oldProject.start_date) : null,
      endDate: oldProject.end_date ? new Date(oldProject.end_date) : null,
      budgetEstimate: oldProject.budget?.toString() || null,
      notes: oldProject.notes || null,
      logoUrl: null,
    });

    const newId = typeof result === 'object' && 'insertId' in result ? result.insertId : result[0];
    projectIdMap.set(oldProject.id, newId);
    stats.projects.imported++;
    console.log(`  ✓ ${oldProject.name}`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${oldProject.name}:`, error.message);
    stats.projects.errors++;
  }
}

// 4. Importer les Tâches
console.log('\n📥 Import des Tâches...');
for (const oldTask of jsonData.entities.Task.data) {
  try {
    // Trouver le projet correspondant
    const projectId = projectIdMap.get(oldTask.project_id);
    if (!projectId) {
      console.log(`  ⚠ Tâche "${oldTask.title}" ignorée (projet non trouvé)`);
      stats.tasks.skipped++;
      continue;
    }

    // Mapper le statut
    let status = 'todo';
    if (oldTask.status === 'in_progress') status = 'in_progress';
    else if (oldTask.status === 'completed') status = 'done';
    else if (oldTask.status === 'cancelled') status = 'cancelled';

    // Mapper la priorité
    let priority = 'medium';
    if (oldTask.priority === 'high' || oldTask.priority === 'urgent') priority = 'high';
    else if (oldTask.priority === 'low') priority = 'low';

    await db.insert(schema.tasks).values({
      title: oldTask.title || 'Tâche sans titre',
      description: oldTask.description || null,
      projectId,
      status,
      priority,
      dueDate: oldTask.due_date ? new Date(oldTask.due_date) : null,
      assignedTo: null, // À mapper manuellement si nécessaire
      estimatedHours: oldTask.estimated_hours || null,
      actualHours: oldTask.actual_hours || null,
    });

    stats.tasks.imported++;
    console.log(`  ✓ ${oldTask.title}`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${oldTask.title}:`, error.message);
    stats.tasks.errors++;
  }
}

// 5. Importer les Documents (Devis/Factures)
console.log('\n📥 Import des Documents...');
for (const oldDoc of jsonData.entities.Document.data) {
  try {
    // Trouver le client correspondant
    const clientId = clientIdMap.get(oldDoc.client_id);
    if (!clientId) {
      console.log(`  ⚠ Document "${oldDoc.number}" ignoré (client non trouvé)`);
      stats.documents.skipped++;
      continue;
    }

    // Mapper le type
    let type = 'invoice';
    if (oldDoc.type === 'quote' || oldDoc.type === 'devis') type = 'quote';
    else if (oldDoc.type === 'invoice' || oldDoc.type === 'facture') type = 'invoice';

    // Mapper le statut
    let status = 'draft';
    if (oldDoc.status === 'sent') status = 'sent';
    else if (oldDoc.status === 'paid') status = 'paid';
    else if (oldDoc.status === 'cancelled') status = 'cancelled';

    await db.insert(schema.documents).values({
      number: oldDoc.number || `DOC-${Date.now()}`,
      type,
      status,
      clientId,
      projectId: oldDoc.project_id ? projectIdMap.get(oldDoc.project_id) : null,
      date: oldDoc.issue_date ? new Date(oldDoc.issue_date) : new Date(),
      dueDate: oldDoc.due_date ? new Date(oldDoc.due_date) : null,
      validityDate: null,
      subject: null,
      introduction: null,
      conclusion: null,
      notes: oldDoc.notes || null,
      totalHt: oldDoc.total_amount?.toString() || '0',
      totalTva: '0',
      totalTtc: oldDoc.total_amount?.toString() || '0',
      discountAmount: '0',
      paymentTerms: 30,
      paymentMethod: null,
      isAcompteRequired: false,
      acomptePercentage: null,
      acompteAmount: null,
      pdfUrl: null,
      stripePaymentIntentId: null,
      stripeCheckoutSessionId: null,
      paidAt: oldDoc.status === 'paid' && oldDoc.paid_date ? new Date(oldDoc.paid_date) : null,
    });

    stats.documents.imported++;
    console.log(`  ✓ ${oldDoc.number} (${type})`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${oldDoc.number}:`, error.message);
    stats.documents.errors++;
  }
}

// 6. Importer les Templates d'Emails
console.log('\n📥 Import des Templates d\'Emails...');
for (const oldTemplate of jsonData.entities.EmailTemplate.data) {
  try {
    // Vérifier si le template existe déjà
    const existing = await db.select().from(schema.emailTemplates).where(
      eq(schema.emailTemplates.name, oldTemplate.name)
    ).limit(1);
    
    if (existing.length > 0) {
      stats.emailTemplates.skipped++;
      continue;
    }

    // Mapper la catégorie
    let category = 'autre';
    if (oldTemplate.category === 'voeux') category = 'voeux';
    else if (oldTemplate.category === 'presentation') category = 'presentation';
    else if (oldTemplate.category === 'relance') category = 'relance';
    else if (oldTemplate.category === 'rendez_vous') category = 'rendez_vous';

    await db.insert(schema.emailTemplates).values({
      name: oldTemplate.name || 'Template sans nom',
      subject: oldTemplate.subject || '',
      body: oldTemplate.body || '',
      category,
      isActive: oldTemplate.is_active !== false,
    });

    stats.emailTemplates.imported++;
    console.log(`  ✓ ${oldTemplate.name}`);
  } catch (error) {
    console.error(`  ✗ Erreur pour ${oldTemplate.name}:`, error.message);
    stats.emailTemplates.errors++;
  }
}

// Afficher le rapport final
console.log('\n📊 RAPPORT D\'IMPORT\n');
console.log('Clients:');
console.log(`  ✓ Importés: ${stats.clients.imported}`);
console.log(`  ⚠ Ignorés (doublons): ${stats.clients.skipped}`);
console.log(`  ✗ Erreurs: ${stats.clients.errors}`);

console.log('\nLeads (Opportunités):');
console.log(`  ✓ Importés: ${stats.leads.imported}`);
console.log(`  ⚠ Ignorés (doublons): ${stats.leads.skipped}`);
console.log(`  ✗ Erreurs: ${stats.leads.errors}`);

console.log('\nProjets:');
console.log(`  ✓ Importés: ${stats.projects.imported}`);
console.log(`  ⚠ Ignorés (client manquant): ${stats.projects.skipped}`);
console.log(`  ✗ Erreurs: ${stats.projects.errors}`);

console.log('\nTâches:');
console.log(`  ✓ Importés: ${stats.tasks.imported}`);
console.log(`  ⚠ Ignorés (projet manquant): ${stats.tasks.skipped}`);
console.log(`  ✗ Erreurs: ${stats.tasks.errors}`);

console.log('\nDocuments:');
console.log(`  ✓ Importés: ${stats.documents.imported}`);
console.log(`  ⚠ Ignorés (client manquant): ${stats.documents.skipped}`);
console.log(`  ✗ Erreurs: ${stats.documents.errors}`);

console.log('\nTemplates d\'Emails:');
console.log(`  ✓ Importés: ${stats.emailTemplates.imported}`);
console.log(`  ⚠ Ignorés (doublons): ${stats.emailTemplates.skipped}`);
console.log(`  ✗ Erreurs: ${stats.emailTemplates.errors}`);

const totalImported = Object.values(stats).reduce((sum, s) => sum + s.imported, 0);
const totalSkipped = Object.values(stats).reduce((sum, s) => sum + s.skipped, 0);
const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

console.log('\n═══════════════════════════════════════');
console.log(`TOTAL: ${totalImported} importés, ${totalSkipped} ignorés, ${totalErrors} erreurs`);
console.log('═══════════════════════════════════════\n');

await connection.end();
console.log('✅ Import terminé');
