import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Eye, EyeOff, Plus, Trash2, Shield, Server, Mail, Globe, Database, Code } from "lucide-react";

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

export default function Vault() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("hosting");

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: credentials, refetch } = trpc.vault.list.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const createMutation = trpc.vault.create.useMutation({
    onSuccess: () => {
      toast.success("Credential ajouté avec succès");
      setShowAddDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vault.delete.useMutation({
    onSuccess: () => {
      toast.success("Credential supprimé");
      refetch();
    },
  });

  const { data: decryptedCredential } = trpc.vault.decrypt.useQuery(
    { id: selectedCredential?.id },
    { 
      enabled: !!selectedCredential && showDecrypted,
    }
  );

  // Mettre à jour decryptedData quand les données arrivent
  if (decryptedCredential && showDecrypted && !decryptedData) {
    setDecryptedData(decryptedCredential.decryptedData);
  }

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
    <DashboardLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coffre-fort RGPD</h1>
            <p className="text-muted-foreground mt-1">
              Gestion sécurisée des credentials et accès clients
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>

        {/* Sélection du projet */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un projet</CardTitle>
            <CardDescription>
              Choisissez un projet pour voir ses credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedProject?.toString() || ""} onValueChange={(v) => setSelectedProject(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un projet..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Liste des credentials */}
        {selectedProject && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Credentials du projet</CardTitle>
                  <CardDescription>
                    {credentials?.length || 0} credential(s) enregistré(s)
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
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
                            setSelectedCredential(cred);
                            setShowViewDialog(true);
                            setShowDecrypted(false);
                            setDecryptedData(null);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Supprimer ce credential ?")) {
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
                    Aucun credential enregistré pour ce projet
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
              <DialogTitle>Ajouter un credential</DialogTitle>
              <DialogDescription>
                Les données seront chiffrées avec AES-256
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Nom du credential *</Label>
                <Input id="label" name="label" required placeholder="Ex: Serveur OVH Production" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">Hébergement</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="domain">Domaine</SelectItem>
                    <SelectItem value="cms">CMS</SelectItem>
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
                      <Label>Username *</Label>
                      <Input name="username" required placeholder="Nom d'utilisateur" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input name="password" type="password" required placeholder="Mot de passe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input name="port" placeholder="Ex: 21, 22, 3306..." />
                    </div>
                    {selectedCategory === "database" && (
                      <div className="space-y-2">
                        <Label>Database Name</Label>
                        <Input name="database" placeholder="Nom de la base de données" />
                      </div>
                    )}
                  </>
                )}

                {selectedCategory === "api" && (
                  <>
                    <div className="space-y-2">
                      <Label>API Key *</Label>
                      <Input name="apiKey" required placeholder="Clé API" />
                    </div>
                    <div className="space-y-2">
                      <Label>API Secret</Label>
                      <Input name="apiSecret" type="password" placeholder="Secret API (optionnel)" />
                    </div>
                  </>
                )}

                {selectedCategory === "smtp" && (
                  <>
                    <div className="space-y-2">
                      <Label>SMTP Host *</Label>
                      <Input name="smtpHost" required placeholder="Ex: smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port *</Label>
                      <Input name="smtpPort" required placeholder="Ex: 587, 465" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP User *</Label>
                      <Input name="smtpUser" required placeholder="Email ou username" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password *</Label>
                      <Input name="smtpPassword" type="password" required placeholder="Mot de passe SMTP" />
                    </div>
                  </>
                )}

                {selectedCategory === "domain" && (
                  <>
                    <div className="space-y-2">
                      <Label>Registrar *</Label>
                      <Input name="registrar" required placeholder="Ex: OVH, Gandi, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label>Username *</Label>
                      <Input name="username" required placeholder="Identifiant" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input name="password" type="password" required placeholder="Mot de passe" />
                    </div>
                  </>
                )}

                {selectedCategory === "other" && (
                  <div className="space-y-2">
                    <Label>Valeur *</Label>
                    <Textarea name="value" required placeholder="Credential ou informations..." />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Notes additionnelles..." />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCredential?.label}</DialogTitle>
              <DialogDescription>
                Credential chiffré - Cliquez pour déchiffrer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Catégorie</Label>
                <Badge variant="outline" className="mt-1">
                  {selectedCredential && categoryLabels[selectedCredential.category as keyof typeof categoryLabels]}
                </Badge>
              </div>

              {!showDecrypted ? (
                <Button onClick={() => setShowDecrypted(true)} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Déchiffrer et afficher
                </Button>
              ) : (
                <div className="space-y-2">
                  {decryptedData && Object.entries(decryptedData).map(([key, value]) => (
                    <div key={key}>
                      <Label className="capitalize">{key}</Label>
                      <Input value={value as string} readOnly className="font-mono" />
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setShowDecrypted(false)} className="w-full">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Masquer
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
