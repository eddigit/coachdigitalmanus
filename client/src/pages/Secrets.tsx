import { Card, CardContent } from "@/components/ui/card";

export default function Secrets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coffre-fort</h1>
        <p className="text-muted-foreground mt-2">Stockez vos identifiants en sécurité</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
