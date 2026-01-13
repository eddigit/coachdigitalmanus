import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: clients, isLoading } = trpc.clients.list.useQuery();

  const filteredClients = clients?.filter((client) =>
    `${client.firstName} ${client.lastName} ${client.company || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">Gérez vos clients et prospects</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {client.firstName} {client.lastName}
                </CardTitle>
                {client.company && <CardDescription>{client.company}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {client.email && <p className="text-muted-foreground">{client.email}</p>}
                  {client.phone && <p className="text-muted-foreground">{client.phone}</p>}
                  <div className="flex gap-2 mt-3">
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
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        client.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun client trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
