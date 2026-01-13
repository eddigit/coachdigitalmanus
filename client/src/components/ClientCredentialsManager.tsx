import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Plus, Trash2, Edit, Shield, Server, Mail, Globe, Database, Code, Lock } from "lucide-react";

const categoryIcons = {
  hosting: Server,
  api: Code,
  smtp: Mail,
  domain: Globe,
  cms: Globe,
  database: Database,
  other: Key,
};

const categoryLabels = {
  hosting: "Hébergement",
  api: "API",
  smtp: "SMTP",
  domain: "Domaine",
  cms: "CMS",
  database: "Base de données",
  other: "Autre",
};

interface ClientCredentialsManagerProps {
  clientId: number;
  projectId?: number;
}

export default function ClientCredentialsManager({ clientId, projectId }: ClientCredentialsManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("hosting");
  const [selectedProject, setSelectedProject] = useState<number | null>(projectId || null);

  // Récupérer les projets du client
  const { data: projects } = trpc.projects.list.useQuery();
  const clientProjects = projects?.filter(p => p.clientId === clientId);

  // Récupérer les credentials du projet sélectionné
  const { data: credentials, refetch } = trpc.vault.list.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const createMutation = trpc.vault.create.useMutation({
    onSuccess: () => {
      toast.success("Vos identifiants ont été partagés en toute sécurité");
      setShowAddDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vault.delete.useMutation({
    onSuccess: () => {
      toast.success("Identifiant supprimé");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const credentialData: Record<string, any> = {};
    const category = formData.get("category") as string;
    
    // Champs dynamiques selon la catégorie
    if (category === "hosting") {
      credentialData.host = formData.get("host");
      credentialData.username = formData.get("username");
      credentialData.password = formData.get("password");
      credentialData.port = formData.get("port");
    } else if (category === "api") {
      credentialData.apiKey = formData.get("apiKey");
      credentialData.apiSecret = formData.get("apiSecret");
    } else if (category === "smtp") {
      credentialData.smtpHost = formData.get("smtpHost");
      credentialData.smtpPort = formData.get("smtpPort");
      credentialData.smtpUser = formData.get("smtpUser");
      credentialData.smtpPassword = formData.get("smtpPassword");
    } else if (category === "domain") {
      credentialData.registrar = formData.get("registrar");
      credentialData.username = formData.get("username");
      credentialData.password = formData.get("password");
    } else if (category === "database") {
      credentialData.host = formData.get("host");
      credentialData.database = formData.get("database");
      credentialData.username = formData.get("username");
      credentialData.password = formData.get("password");
      credentialData.port = formData.get("port");
    } else if (category === "cms") {
      credentialData.url = formData.get("cmsUrl");
      credentialData.username = formData.get("username");
      credentialData.password = formData.get("password");
    } else {
      credentialData.value = formData.get("value");
    }

    createMutation.mutate({
      projectId: selectedProject!,
      category: category as any,
      label: formData.get("label") as string,
      description: formData.get("description") as string || null,
      credentialData,
      url: formData.get("url") as string || null,
      notes: formData.get("notes") as string || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Mes Identifiants Sécurisés
          </h2>
          <p className="text-muted-foreground mt-1">
            Partagez vos accès en toute sécurité avec votre coach
          </p>
        </div>
      </div>

      {/* Sélection du projet */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un projet</CardTitle>
          <CardDescription>
            Choisissez le projet pour lequel vous souhaitez partager des identifiants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject?.toString() || ""} onValueChange={(v) => setSelectedProject(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un projet..." />
            </SelectTrigger>
            <SelectContent>
              {clientProjects?.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Informations de sécurité */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lock className="h-5 w-5" />
            Sécurité RGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>✅ Vos identifiants sont chiffrés avec AES-256</p>
          <p>✅ Seul votre coach peut les déchiffrer</p>
          <p>✅ Aucun envoi par email</p>
          <p>✅ Conformité CNIL/ANSSI</p>
        </CardContent>
      </Card>

      {/* Liste des credentials */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Identifiants partagés</CardTitle>
                <CardDescription>
                  {credentials?.length || 0} identifiant(s) partagé(s)
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Partager un identifiant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {credentials?.map((cred) => {
                const Icon = categoryIcons[cred.category as keyof typeof categoryIcons];
                return (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{cred.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {cred.description || "Aucune description"}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {categoryLabels[cred.category as keyof typeof categoryLabels]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Supprimer cet identifiant ?")) {
                            deleteMutation.mutate({ id: cred.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {(!credentials || credentials.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun identifiant partagé pour ce projet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partager un identifiant</DialogTitle>
            <DialogDescription>
              Vos données seront chiffrées et accessibles uniquement par votre coach
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Nom de l'identifiant *</Label>
              <Input id="label" name="label" required placeholder="Ex: Serveur OVH Production" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Type d'accès *</Label>
              <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hosting">Hébergement (FTP, SSH)</SelectItem>
                  <SelectItem value="api">API Keys</SelectItem>
                  <SelectItem value="smtp">Email / SMTP</SelectItem>
                  <SelectItem value="domain">Nom de domaine</SelectItem>
                  <SelectItem value="cms">CMS (WordPress, etc.)</SelectItem>
                  <SelectItem value="database">Base de données</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Description optionnelle" />
            </div>

            {/* Champs dynamiques selon catégorie */}
            <div className="space-y-3 p-4 border rounded-lg bg-accent/20">
              <Label className="text-base font-semibold">Informations de connexion</Label>
              
              {(selectedCategory === "hosting" || selectedCategory === "database") && (
                <>
                  <div className="space-y-2">
                    <Label>Host / Serveur *</Label>
                    <Input name="host" required placeholder="Ex: ftp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom d'utilisateur *</Label>
                    <Input name="username" required placeholder="Username" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input name="password" type="password" required placeholder="Password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input name="port" placeholder="Ex: 21, 22, 3306..." />
                  </div>
                  {selectedCategory === "database" && (
                    <div className="space-y-2">
                      <Label>Nom de la base</Label>
                      <Input name="database" placeholder="Nom de la base de données" />
                    </div>
                  )}
                </>
              )}

              {selectedCategory === "api" && (
                <>
                  <div className="space-y-2">
                    <Label>API Key *</Label>
                    <Input name="apiKey" required placeholder="Votre clé API" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input name="apiSecret" type="password" placeholder="Secret API (si applicable)" />
                  </div>
                </>
              )}

              {selectedCategory === "smtp" && (
                <>
                  <div className="space-y-2">
                    <Label>Serveur SMTP *</Label>
                    <Input name="smtpHost" required placeholder="Ex: smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Port SMTP *</Label>
                    <Input name="smtpPort" required placeholder="Ex: 587, 465" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email / Username *</Label>
                    <Input name="smtpUser" required placeholder="votre@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input name="smtpPassword" type="password" required placeholder="Mot de passe SMTP" />
                  </div>
                </>
              )}

              {selectedCategory === "domain" && (
                <>
                  <div className="space-y-2">
                    <Label>Registrar *</Label>
                    <Input name="registrar" required placeholder="Ex: OVH, Gandi, Namecheap..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Identifiant *</Label>
                    <Input name="username" required placeholder="Username" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input name="password" type="password" required placeholder="Password" />
                  </div>
                </>
              )}

              {selectedCategory === "cms" && (
                <>
                  <div className="space-y-2">
                    <Label>URL du CMS *</Label>
                    <Input name="cmsUrl" required placeholder="https://monsite.com/wp-admin" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom d'utilisateur *</Label>
                    <Input name="username" required placeholder="Username" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input name="password" type="password" required placeholder="Password" />
                  </div>
                </>
              )}

              {selectedCategory === "other" && (
                <div className="space-y-2">
                  <Label>Informations *</Label>
                  <Textarea name="value" required placeholder="Vos identifiants ou informations..." rows={4} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL associée</Label>
              <Input id="url" name="url" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Informations complémentaires..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Envoi sécurisé..." : "Partager en toute sécurité"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
