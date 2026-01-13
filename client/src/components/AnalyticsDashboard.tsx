import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const { data: documents } = trpc.documents.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  // Calcul du chiffre d'affaires par mois (6 derniers mois)
  const getRevenueByMonth = () => {
    if (!documents) return { labels: [], data: [] };

    const now = new Date();
    const months: string[] = [];
    const revenues: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
      months.push(monthLabel);

      const monthRevenue = documents
        .filter((doc) => {
          if (doc.type !== "invoice" || doc.status !== "paid") return false;
          const docDate = new Date(doc.date);
          return (
            docDate.getMonth() === date.getMonth() &&
            docDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, doc) => sum + parseFloat(doc.totalTtc || "0"), 0);

      revenues.push(monthRevenue);
    }

    return { labels: months, data: revenues };
  };

  // Répartition des clients par catégorie
  const getClientsByCategory = () => {
    if (!clients) return { labels: [], data: [] };

    const categories = ["prospect", "active", "vip", "inactive"];
    const counts = categories.map(
      (cat) => clients.filter((c) => c.category === cat).length
    );

    const labels = ["Prospects", "Actifs", "VIP", "Inactifs"];

    return { labels, data: counts };
  };

  // Taux de conversion devis → factures
  const getConversionRate = () => {
    if (!documents) return { labels: [], data: [] };

    const quotes = documents.filter((d) => d.type === "quote");
    const acceptedQuotes = quotes.filter((d) => d.status === "accepted");
    const invoices = documents.filter((d) => d.type === "invoice");

    const totalQuotes = quotes.length;
    const converted = invoices.length;
    const notConverted = totalQuotes - converted;

    return {
      labels: ["Convertis en factures", "Non convertis"],
      data: [converted, notConverted > 0 ? notConverted : 0],
    };
  };

  const revenueData = getRevenueByMonth();
  const clientsData = getClientsByCategory();
  const conversionData = getConversionRate();

  // Configuration des graphiques
  const revenueChartData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: "Chiffre d'affaires (€)",
        data: revenueData.data,
        backgroundColor: "rgba(230, 126, 80, 0.8)", // Orange Coach Digital
        borderColor: "rgba(230, 126, 80, 1)",
        borderWidth: 2,
      },
    ],
  };

  const clientsChartData = {
    labels: clientsData.labels,
    datasets: [
      {
        data: clientsData.data,
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Bleu
          "rgba(34, 197, 94, 0.8)", // Vert
          "rgba(230, 126, 80, 0.8)", // Orange
          "rgba(156, 163, 175, 0.8)", // Gris
        ],
        borderWidth: 0,
      },
    ],
  };

  const conversionChartData = {
    labels: conversionData.labels,
    datasets: [
      {
        data: conversionData.data,
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Vert
          "rgba(239, 68, 68, 0.8)", // Rouge
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "rgb(156, 163, 175)",
          font: {
            family: "Inter",
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgb(156, 163, 175)",
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "rgb(156, 163, 175)",
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "rgb(156, 163, 175)",
          font: {
            family: "Inter",
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tableau de Bord Analytique</h2>
        <p className="text-muted-foreground">
          Visualisez vos performances et statistiques clés
        </p>
      </div>

      {/* Graphique chiffre d'affaires */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
          <p className="text-sm text-muted-foreground">
            Factures payées sur les 6 derniers mois
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Graphiques répartition et conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition clients */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Clients</CardTitle>
            <p className="text-sm text-muted-foreground">
              Par catégorie (Prospect, Actif, VIP, Inactif)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={clientsChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Taux de conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de Conversion</CardTitle>
            <p className="text-sm text-muted-foreground">
              Devis convertis en factures
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={conversionChartData} options={doughnutOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {conversionData.data[0] > 0
                  ? Math.round(
                      (conversionData.data[0] /
                        (conversionData.data[0] + conversionData.data[1])) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-muted-foreground">Taux de conversion</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
