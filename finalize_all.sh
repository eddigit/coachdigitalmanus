#!/bin/bash

# Tasks.tsx - Page complète avec CRUD
cat > client/src/pages/Tasks.tsx << 'EOF'
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Plus, CheckSquare, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Tasks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tâche créée");
      setIsDialogOpen(false);
      utils.tasks.list.invalidate();
      utils.stats.get.invalidate();
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tâche modifiée");
      setIsDialogOpen(false);
      setEditingTask(null);
      utils.tasks.list.invalidate();
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tâche supprimée");
      utils.tasks.list.invalidate();
      utils.stats.get.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectId = formData.get("projectId") as string;
    const clientId = formData.get("clientId") as string;
    
    const data = {
      projectId: projectId ? parseInt(projectId) : null,
      clientId: clientId ? parseInt(clientId) : null,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as any) || "todo",
      priority: (formData.get("priority") as any) || "normal",
      dueDate: null,
      completedAt: null,
      estimatedHours: (formData.get("estimatedHours") as string) || null,
      isBillable: formData.get("isBillable") === "on",
      hourlyRate: (formData.get("hourlyRate") as string) || null,
    };

    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data });
    } else {
      createTask.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "review": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tâches</h1>
            <p className="text-muted-foreground">Gérez vos tâches et suivez votre temps</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingTask(null);
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nouvelle Tâche</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Modifier" : "Créer"} une tâche</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input name="title" defaultValue={editingTask?.title} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editingTask?.description || ""} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projet</Label>
                    <Select name="projectId" defaultValue={editingTask?.projectId?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun projet</SelectItem>
                        {projects?.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select name="clientId" defaultValue={editingTask?.clientId?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun client</SelectItem>
                        {clients?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.firstName} {c.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select name="status" defaultValue={editingTask?.status || "todo"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="review">En revue</SelectItem>
                        <SelectItem value="done">Terminé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priorité</Label>
                    <Select name="priority" defaultValue={editingTask?.priority || "normal"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heures estimées</Label>
                    <Input name="estimatedHours" type="number" step="0.5" defaultValue={editingTask?.estimatedHours || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux horaire (€)</Label>
                    <Input name="hourlyRate" type="number" step="0.01" defaultValue={editingTask?.hourlyRate || ""} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isBillable" name="isBillable" defaultChecked={editingTask?.isBillable !== false} />
                  <Label htmlFor="isBillable" className="cursor-pointer">Facturable</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">{editingTask ? "Modifier" : "Créer"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              const project = projects?.find(p => p.id === task.projectId);
              const client = clients?.find(c => c.id === task.clientId);
              return (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span className="truncate">{task.title}</span>
                      <CheckSquare className="h-5 w-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {project && <div className="text-sm">Projet: {project.name}</div>}
                    {client && <div className="text-sm">Client: {client.firstName} {client.lastName}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}>
                        <Pencil className="h-3 w-3 mr-1" />Modifier
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Supprimer ?")) deleteTask.mutate({ id: task.id }); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">Aucune tâche</CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
EOF

# Documents.tsx - Page documents
cat > client/src/pages/Documents.tsx << 'EOF'
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FileText, Download } from "lucide-react";

export default function Documents() {
  const { data: documents, isLoading } = trpc.documents.list.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground">Devis et factures</p>
          </div>
          <Button>Nouveau Document</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : documents && documents.length > 0 ? (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>{doc.documentNumber}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Type: {doc.type}</div>
                    <div>Statut: {doc.status}</div>
                    <div>Total HT: {doc.totalHT} €</div>
                    <div>Total TTC: {doc.totalTTC} €</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">Aucun document</CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
EOF

# Settings.tsx - Page paramètres
cat > client/src/pages/Settings.tsx << 'EOF'
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  const { data: company, isLoading } = trpc.company.get.useQuery();
  const utils = trpc.useUtils();
  
  const upsertCompany = trpc.company.upsert.useMutation({
    onSuccess: () => {
      toast.success("Informations enregistrées");
      utils.company.get.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    upsertCompany.mutate({
      name: formData.get("name") as string,
      legalName: (formData.get("legalName") as string) || null,
      siret: (formData.get("siret") as string) || null,
      tvaNumber: (formData.get("tvaNumber") as string) || null,
      address: (formData.get("address") as string) || null,
      postalCode: (formData.get("postalCode") as string) || null,
      city: (formData.get("city") as string) || null,
      country: (formData.get("country") as string) || "France",
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      website: (formData.get("website") as string) || null,
      logoUrl: (formData.get("logoUrl") as string) || null,
      bankName: (formData.get("bankName") as string) || null,
      iban: (formData.get("iban") as string) || null,
      bic: (formData.get("bic") as string) || null,
      defaultTvaRate: (formData.get("defaultTvaRate") as string) || "20.00",
      defaultPaymentTerms: parseInt(formData.get("defaultPaymentTerms") as string) || 30,
      legalMentions: (formData.get("legalMentions") as string) || null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Chargement...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Informations de votre entreprise</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations Entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom commercial *</Label>
                  <Input name="name" defaultValue={company?.name || ""} required />
                </div>
                <div className="space-y-2">
                  <Label>Raison sociale</Label>
                  <Input name="legalName" defaultValue={company?.legalName || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input name="siret" defaultValue={company?.siret || ""} />
                </div>
                <div className="space-y-2">
                  <Label>N° TVA</Label>
                  <Input name="tvaNumber" defaultValue={company?.tvaNumber || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input name="address" defaultValue={company?.address || ""} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Code Postal</Label>
                  <Input name="postalCode" defaultValue={company?.postalCode || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input name="city" defaultValue={company?.city || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input name="country" defaultValue={company?.country || "France"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input name="phone" defaultValue={company?.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={company?.email || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Site web</Label>
                <Input name="website" defaultValue={company?.website || ""} />
              </div>

              <div className="space-y-2">
                <Label>URL Logo</Label>
                <Input name="logoUrl" defaultValue={company?.logoUrl || ""} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Banque</Label>
                  <Input name="bankName" defaultValue={company?.bankName || ""} />
                </div>
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input name="iban" defaultValue={company?.iban || ""} />
                </div>
                <div className="space-y-2">
                  <Label>BIC</Label>
                  <Input name="bic" defaultValue={company?.bic || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TVA par défaut (%)</Label>
                  <Input name="defaultTvaRate" type="number" step="0.01" defaultValue={company?.defaultTvaRate || "20.00"} />
                </div>
                <div className="space-y-2">
                  <Label>Délai de paiement (jours)</Label>
                  <Input name="defaultPaymentTerms" type="number" defaultValue={company?.defaultPaymentTerms || 30} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mentions légales</Label>
                <Textarea name="legalMentions" rows={4} defaultValue={company?.legalMentions || ""} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={upsertCompany.isPending}>
                  {upsertCompany.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "Toutes les pages finalisées"
