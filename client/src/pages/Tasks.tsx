import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Tasks() {
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground mt-2">Gérez vos tâches et activités</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Tâche
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {task.description && <CardDescription>{task.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.status === "done"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.priority && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune tâche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
