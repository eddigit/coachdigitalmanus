# COACH DIGITAL - TODO

## Phase 1 : Infrastructure & Base de données
- [x] Créer schéma Drizzle pour Clients
- [x] Créer schéma Drizzle pour Projets
- [x] Créer schéma Drizzle pour Tâches
- [x] Créer schéma Drizzle pour TaskActivities (suivi temps)
- [x] Créer schéma Drizzle pour Documents (devis/factures)
- [x] Créer schéma Drizzle pour DocumentLines
- [x] Créer schéma Drizzle pour Payments
- [x] Créer schéma Drizzle pour Prestations
- [x] Créer schéma Drizzle pour FamillePrestations
- [x] Créer schéma Drizzle pour Notes
- [x] Créer schéma Drizzle pour Messages
- [x] Créer schéma Drizzle pour Secrets (coffre-fort)
- [x] Créer schéma Drizzle pour CalendarEvents
- [x] Créer schéma Drizzle pour ClientInteractions
- [x] Créer schéma Drizzle pour Company (infos entreprise Gilles)
- [x] Pousser migrations DB (pnpm db:push)

## Phase 2 : API Backend (tRPC)
- [ ] Créer queries DB pour Clients
- [ ] Créer queries DB pour Projets
- [ ] Créer queries DB pour Tâches
- [ ] Créer queries DB pour TaskActivities
- [ ] Créer queries DB pour Documents
- [ ] Créer queries DB pour Prestations
- [ ] Créer queries DB pour Notes
- [ ] Créer queries DB pour Messages
- [ ] Créer queries DB pour Secrets
- [ ] Créer queries DB pour CalendarEvents
- [ ] Créer queries DB pour Company
- [ ] Créer router tRPC pour Clients (CRUD)
- [ ] Créer router tRPC pour Projets (CRUD)
- [ ] Créer router tRPC pour Tâches (CRUD)
- [ ] Créer router tRPC pour TaskActivities (CRUD)
- [ ] Créer router tRPC pour Documents (CRUD + PDF + Email)
- [ ] Créer router tRPC pour Prestations (CRUD)
- [ ] Créer router tRPC pour Notes (CRUD)
- [ ] Créer router tRPC pour Messages (CRUD)
- [ ] Créer router tRPC pour Secrets (CRUD)
- [ ] Créer router tRPC pour CalendarEvents (CRUD)
- [ ] Créer router tRPC pour Company (CRUD)

## Phase 3 : Interface Administrateur
- [ ] Créer layout DashboardLayout avec sidebar
- [ ] Créer page Dashboard (vue d'ensemble)
- [ ] Créer page Clients (liste + formulaire)
- [ ] Créer page ClientDetail (détail client)
- [ ] Créer page Projects (liste + formulaire)
- [ ] Créer page ProjectDetail (détail projet)
- [ ] Créer page Tasks (liste + Kanban)
- [ ] Créer page TaskDetail (détail tâche)
- [ ] Créer page Productions (TaskActivities facturable)
- [ ] Créer page Documents (liste devis/factures)
- [ ] Créer page CreateDocument (création devis/facture)
- [ ] Créer page EditDocument (édition document)
- [ ] Créer page Prestations (catalogue services)
- [ ] Créer page Notes (liste notes)
- [ ] Créer page Messages (messagerie)
- [ ] Créer page Calendar (agenda)
- [ ] Créer page Vault (coffre-fort secrets)
- [ ] Créer page Treasury (trésorerie)
- [ ] Créer page Settings (paramètres + Company)

## Phase 4 : Documents Commerciaux
- [ ] Implémenter génération PDF (jsPDF)
- [ ] Implémenter calculs automatiques (HT, TVA, TTC)
- [ ] Implémenter numérotation automatique
- [ ] Implémenter envoi email documents
- [ ] Implémenter duplication documents
- [ ] Implémenter conversion devis → facture
- [ ] Implémenter facturation depuis production

## Phase 5 : Espace Client
- [ ] Créer layout ClientPortal
- [ ] Créer page MyProjects (projets client)
- [ ] Créer page MyTasks (tâches client)
- [ ] Créer page MyDocuments (documents client)
- [ ] Créer page MyProfile (profil client)
- [ ] Implémenter acceptation devis en ligne
- [ ] Implémenter accès secrets partagés

## Phase 6 : Fonctionnalités Avancées
- [ ] Implémenter upload fichiers (Cloudinary)
- [ ] Implémenter gestion paiements
- [ ] Implémenter historique interactions clients
- [ ] Implémenter filtres et recherche avancés
- [ ] Implémenter statistiques et analytics
- [ ] Implémenter notifications

## Phase 7 : Tests & Finalisation
- [ ] Tester CRUD Clients
- [ ] Tester CRUD Projets
- [ ] Tester CRUD Tâches
- [ ] Tester création documents
- [ ] Tester génération PDF
- [ ] Tester espace client
- [ ] Tester responsive mobile
- [ ] Vérifier sécurité et permissions
- [ ] Optimiser performances
- [ ] Créer données de démonstration


## Progression actuelle (13 janvier 2026)
- [x] Base de données complète avec 16 tables
- [x] API tRPC complète avec tous les routers
- [x] Interface administrateur de base (Dashboard, Clients, Projets, Tâches, Documents)
- [x] Pages de navigation (Calendrier, Suivi temps, Notes, Secrets, Paramètres)
- [ ] Formulaires de création/édition (en cours)
- [ ] Génération PDF documents
- [ ] Espace client
