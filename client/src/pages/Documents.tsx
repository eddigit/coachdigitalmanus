import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Card><CardContent className="py-12 text-center">Page en cours de développement</CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
