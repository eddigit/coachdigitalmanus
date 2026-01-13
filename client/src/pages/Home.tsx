import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CheckSquare, FileText, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery();
  const { data: documents, isLoading: documentsLoading } = trpc.documents.list.useQuery();

  const stats = [
    {
      title: "Clients Actifs",
      value: clients?.filter((c) => c.status === "active").length || 0,
      icon: Users,
      description: "Clients en cours",
      color: "text-blue-600",
    },
    {
      title: "Projets",
      value: projects?.filter((p) => p.status === "active").length || 0,
      icon: Briefcase,
      description: "Projets actifs",
      color: "text-green-600",
    },
    {
      title: "Tâches",
      value: tasks?.filter((t) => t.status !== "done" && t.status !== "cancelled").length || 0,
      icon: CheckSquare,
      description: "Tâches en cours",
      color: "text-orange-600",
    },
    {
      title: "Documents",
      value: documents?.filter((d) => d.status === "draft" || d.status === "sent").length || 0,
      icon: FileText,
      description: "Devis/Factures actifs",
      color: "text-purple-600",
    },
  ];

  const recentClients = clients?.slice(0, 5) || [];
  const recentProjects = projects?.slice(0, 5) || [];
  const upcomingTasks = tasks?.filter((t) => t.status === "todo" || t.status === "in_progress").slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de votre activité de coaching
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Clients Récents</CardTitle>
            <CardDescription>Derniers clients ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun client</p>
            ) : (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {client.firstName} {client.lastName}
                      </p>
                      {client.company && (
                        <p className="text-xs text-muted-foreground">{client.company}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        client.category === "vip"
                          ? "bg-yellow-100 text-yellow-800"
                          : client.category === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {client.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projets Récents</CardTitle>
            <CardDescription>Derniers projets créés</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun projet</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.status === "active" ? "En cours" : project.status}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        project.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : project.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {project.priority || "normal"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tâches à venir</CardTitle>
            <CardDescription>Prochaines tâches</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.status === "todo" ? "À faire" : "En cours"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.priority || "normal"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/clients"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Nouveau Client</p>
                <p className="text-xs text-muted-foreground">Ajouter un client</p>
              </div>
            </a>
            <a
              href="/projects"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Briefcase className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Nouveau Projet</p>
                <p className="text-xs text-muted-foreground">Créer un projet</p>
              </div>
            </a>
            <a
              href="/tasks"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <CheckSquare className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Nouvelle Tâche</p>
                <p className="text-xs text-muted-foreground">Ajouter une tâche</p>
              </div>
            </a>
            <a
              href="/documents"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Nouveau Devis</p>
                <p className="text-xs text-muted-foreground">Créer un devis</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
