import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CreditCard, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClientPaymentsProps {
  clientUserId: number;
}

export default function ClientPayments({ clientUserId }: ClientPaymentsProps) {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);
  
  const { data: documents, isLoading } = trpc.documents.listByClientUser.useQuery({
    clientUserId,
  });

  const createCheckout = (trpc.stripe as any).createCheckoutSession.useMutation({
    onSuccess: (data: any) => {
      // Ouvrir Stripe Checkout dans un nouvel onglet
      window.open(data.checkoutUrl, "_blank");
      toast.success("Redirection vers la page de paiement...");
      setPayingInvoiceId(null);
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
      setPayingInvoiceId(null);
    },
  });

  const handlePayInvoice = (invoiceId: number) => {
    setPayingInvoiceId(invoiceId);
    createCheckout.mutate({
      invoiceId,
      clientUserId,
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      quote: "Devis",
      invoice: "Facture",
      credit_note: "Avoir",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      draft: { variant: "outline", label: "Brouillon" },
      sent: { variant: "secondary", label: "Envoyé" },
      accepted: { variant: "default", label: "Accepté" },
      rejected: { variant: "destructive", label: "Refusé" },
      paid: { variant: "default", label: "Payé" },
      cancelled: { variant: "outline", label: "Annulé" },
    };

    const { variant, label } = config[status] || config.draft;
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Filtrer uniquement les factures
  const invoices = documents?.filter((doc) => doc.type === "invoice") || [];
  const unpaidInvoices = invoices.filter((inv) => inv.status !== "paid");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes Paiements</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucune facture disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes Paiements</CardTitle>
            {unpaidInvoices.length > 0 && (
              <Badge variant="destructive">{unpaidInvoices.length} facture(s) impayée(s)</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 bg-background/50 rounded-lg flex items-center justify-between hover:bg-background/80 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">
                        Facture {invoice.number}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground text-lg">
                      {parseFloat(invoice.totalTtc || "0").toFixed(2)} €
                    </span>
                    {invoice.dueDate && (
                      <span>
                        Échéance: {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {invoice.status !== "paid" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handlePayInvoice(invoice.id)}
                      disabled={payingInvoiceId === invoice.id}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {payingInvoiceId === invoice.id ? "Chargement..." : "Payer"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc(invoice)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog visualisation facture */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Facture {selectedDoc.number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedDoc.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedDoc.status)}</div>
                </div>
                {selectedDoc.dueDate && (
                  <div>
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-medium">
                      {new Date(selectedDoc.dueDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Montant total TTC</p>
                  <p className="font-medium text-lg">
                    {parseFloat(selectedDoc.totalTtc || "0").toFixed(2)} €
                  </p>
                </div>
              </div>

              {selectedDoc.subject && (
                <div>
                  <p className="text-muted-foreground text-sm">Objet</p>
                  <p className="mt-1">{selectedDoc.subject}</p>
                </div>
              )}

              {selectedDoc.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedDoc.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  Fermer
                </Button>
                {selectedDoc.status !== "paid" && (
                  <Button onClick={() => {
                    setSelectedDoc(null);
                    handlePayInvoice(selectedDoc.id);
                  }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer maintenant
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
