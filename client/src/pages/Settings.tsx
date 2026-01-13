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
