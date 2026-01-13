import { Card, CardContent } from "@/components/ui/card";

export default function TimeTracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suivi du Temps</h1>
        <p className="text-muted-foreground mt-2">Suivez votre temps de travail</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
