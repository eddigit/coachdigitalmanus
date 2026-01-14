import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import EmailTemplateEditor, { EmailBlock } from "@/components/EmailTemplateEditor";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Mail,
  FileText,
  Gift,
  Phone,
  RefreshCw,
  Heart,
  MoreHorizontal,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  voeux: { label: "Vœux", icon: <Gift className="h-4 w-4" />, color: "bg-purple-500" },
  presentation: { label: "Présentation", icon: <FileText className="h-4 w-4" />, color: "bg-blue-500" },
  relance: { label: "Relance", icon: <RefreshCw className="h-4 w-4" />, color: "bg-yellow-500" },
  rendez_vous: { label: "Rendez-vous", icon: <Phone className="h-4 w-4" />, color: "bg-green-500" },
  suivi: { label: "Suivi", icon: <Mail className="h-4 w-4" />, color: "bg-cyan-500" },
  remerciement: { label: "Remerciement", icon: <Heart className="h-4 w-4" />, color: "bg-pink-500" },
  autre: { label: "Autre", icon: <MoreHorizontal className="h-4 w-4" />, color: "bg-gray-500" },
};

export default function EmailTemplates() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: templates = [], isLoading } = trpc.emailTemplates.list.useQuery();

  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template créé avec succès");
      utils.emailTemplates.list.invalidate();
      setIsEditorOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Template mis à jour avec succès");
      utils.emailTemplates.list.invalidate();
      setIsEditorOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template supprimé");
      utils.emailTemplates.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSave = (data: {
    name: string;
    subject: string;
    category: string;
    blocks: EmailBlock[];
    html: string;
  }) => {
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        name: data.name,
        subject: data.subject,
        body: data.html,
        bodyJson: data.blocks,
        category: data.category as any,
        previewHtml: data.html,
      });
    } else {
      createMutation.mutate({
        name: data.name,
        subject: data.subject,
        body: data.html,
        bodyJson: data.blocks,
        category: data.category as any,
        previewHtml: data.html,
      });
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicate = (template: any) => {
    createMutation.mutate({
      name: `${template.name} (copie)`,
      subject: template.subject,
      body: template.body,
      bodyJson: template.bodyJson,
      category: template.category,
      previewHtml: template.previewHtml,
    });
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates d'Emails</h1>
            <p className="text-muted-foreground">
              Créez et gérez vos modèles d'emails avec l'éditeur drag & drop
            </p>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {templates.filter((t) => t.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(templates.map((t) => t.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des templates */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun template</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier template d'email avec l'éditeur drag & drop
              </p>
              <Button onClick={handleNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const categoryInfo = CATEGORY_LABELS[template.category] || CATEGORY_LABELS.autre;
              return (
                <Card key={template.id} className="group relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${categoryInfo.color} text-white`}>
                          {categoryInfo.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {categoryInfo.label}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      Objet: {template.subject}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{template.usageCount || 0} utilisations</span>
                      <span>
                        Modifié le {new Date(template.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog Éditeur */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
            <EmailTemplateEditor
              initialBlocks={editingTemplate?.bodyJson || []}
              initialSubject={editingTemplate?.subject || ""}
              initialName={editingTemplate?.name || ""}
              initialCategory={editingTemplate?.category || "presentation"}
              onSave={handleSave}
              onCancel={() => {
                setIsEditorOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Aperçu */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>Objet: {previewTemplate?.subject}</DialogDescription>
            </DialogHeader>
            <div
              className="border rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: previewTemplate?.body || previewTemplate?.previewHtml || "" }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
