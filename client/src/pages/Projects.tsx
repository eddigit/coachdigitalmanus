import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-2">Gérez vos projets clients</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Projet
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.description && <CardDescription>{project.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          project.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : project.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {project.priority}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun projet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
