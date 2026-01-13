import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RequestType = "coaching_ia" | "site_web" | "application" | "optimisation" | "autre";
type Priority = "basse" | "moyenne" | "haute" | "urgente";

interface FormData {
  type: RequestType | "";
  title: string;
  description: string;
  context: string;
  budget: string;
  deadline: string;
  priority: Priority | "";
}

const REQUEST_TYPES = [
  { value: "coaching_ia", label: "Coaching IA", description: "Accompagnement intégration IA et outils" },
  { value: "site_web", label: "Site Web", description: "Création ou refonte de site internet" },
  { value: "application", label: "Application Métier", description: "Développement application sur mesure" },
  { value: "optimisation", label: "Optimisation", description: "Amélioration processus et outils existants" },
  { value: "autre", label: "Autre", description: "Autre type de demande" },
];

const PRIORITIES = [
  { value: "basse", label: "Basse", color: "text-muted-foreground" },
  { value: "moyenne", label: "Moyenne", color: "text-blue-400" },
  { value: "haute", label: "Haute", color: "text-orange-400" },
  { value: "urgente", label: "Urgente", color: "text-red-400" },
];

export default function NewRequestForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    title: "",
    description: "",
    context: "",
    budget: "",
    deadline: "",
    priority: "",
  });

  const createRequest = trpc.clientRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Demande envoyée avec succès", {
        description: "Vous recevrez une réponse sous 24-48h",
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de l'envoi", {
        description: error.message,
      });
    },
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData.type !== "";
  const canProceedStep2 = formData.title.trim() !== "" && formData.description.trim() !== "";
  const canProceedStep3 = formData.budget.trim() !== "" && formData.deadline.trim() !== "" && formData.priority !== "";

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      toast.error("Veuillez sélectionner un type de besoin");
      return;
    }
    if (step === 2 && !canProceedStep2) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    if (step === 3 && !canProceedStep3) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.title || !formData.description || !formData.budget || !formData.deadline || !formData.priority) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    createRequest.mutate({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      context: formData.context,
      budget: parseFloat(formData.budget) || 0,
      deadline: formData.deadline,
      priority: formData.priority,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-sm flex items-center justify-center font-semibold transition-all ${
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Type</span>
          <span>Description</span>
          <span>Budget & Délai</span>
          <span>Récapitulatif</span>
        </div>
      </div>

      {/* Step 1: Type de besoin */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Quel est votre besoin ?</CardTitle>
            <CardDescription>Sélectionnez le type de service dont vous avez besoin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
              {REQUEST_TYPES.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`flex items-start gap-3 p-4 rounded-sm border-2 cursor-pointer transition-all hover:border-primary/50 ${
                    formData.type === type.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Description */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Décrivez votre projet</CardTitle>
            <CardDescription>Plus vous serez précis, mieux nous pourrons vous accompagner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du projet *</Label>
              <Input
                id="title"
                placeholder="Ex: Refonte site cabinet d'avocats"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez vos objectifs, vos attentes, les fonctionnalités souhaitées..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexte (optionnel)</Label>
              <Textarea
                id="context"
                placeholder="Informations complémentaires sur votre activité, votre situation actuelle..."
                value={formData.context}
                onChange={(e) => updateFormData("context", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Budget & Délai */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget et délai</CardTitle>
            <CardDescription>Ces informations nous aident à mieux planifier votre projet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget alloué (€) *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Ex: 5000"
                value={formData.budget}
                onChange={(e) => updateFormData("budget", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Montant indicatif, nous pourrons en discuter ensemble</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Date souhaitée de livraison *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => updateFormData("deadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité *</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la priorité" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Récapitulatif */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de votre demande</CardTitle>
            <CardDescription>Vérifiez les informations avant d'envoyer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Type de besoin</span>
                <span className="font-semibold">
                  {REQUEST_TYPES.find(t => t.value === formData.type)?.label}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Titre</span>
                <span className="font-semibold">{formData.title}</span>
              </div>
              <div className="py-2 border-b">
                <span className="text-muted-foreground block mb-2">Description</span>
                <p className="text-sm">{formData.description}</p>
              </div>
              {formData.context && (
                <div className="py-2 border-b">
                  <span className="text-muted-foreground block mb-2">Contexte</span>
                  <p className="text-sm">{formData.context}</p>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold">{parseFloat(formData.budget).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Date souhaitée</span>
                <span className="font-semibold">
                  {new Date(formData.deadline).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Priorité</span>
                <span className={`font-semibold ${PRIORITIES.find(p => p.value === formData.priority)?.color}`}>
                  {PRIORITIES.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-sm mt-6">
              <p className="text-sm text-muted-foreground">
                Après envoi, vous recevrez une confirmation par email et je reviendrai vers vous sous 24-48h pour échanger sur votre projet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={step === 1 ? onClose : handlePrevious}
          disabled={createRequest.isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {step === 1 ? "Annuler" : "Précédent"}
        </Button>

        {step < totalSteps ? (
          <Button onClick={handleNext}>
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createRequest.isPending}>
            {createRequest.isPending ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>
        )}
      </div>
    </div>
  );
}
