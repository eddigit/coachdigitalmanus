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
                      <span>{doc.number}</span>
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
                    <div>Total HT: {doc.totalHt} €</div>
                    <div>Total TTC: {doc.totalTtc} €</div>
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
