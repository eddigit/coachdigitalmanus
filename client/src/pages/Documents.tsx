import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Documents() {
  const { data: documents, isLoading } = trpc.documents.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">Devis, factures et documents commerciaux</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Document
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{doc.number}</CardTitle>
                {doc.subject && <CardDescription>{doc.subject}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      doc.type === "invoice"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {doc.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : doc.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun document</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
