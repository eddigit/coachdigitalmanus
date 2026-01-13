import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";

export default function Reviews() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [response, setResponse] = useState("");

  const { data: reviews, isLoading, refetch } = trpc.reviews.list.useQuery({});
  const { data: averageRating } = trpc.reviews.getAverageRating.useQuery();

  const respondMutation = trpc.reviews.respond.useMutation({
    onSuccess: () => {
      toast.success("Réponse publiée", {
        description: "Votre réponse a été ajoutée à l'avis.",
      });
      setSelectedReview(null);
      setResponse("");
      refetch();
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de publier la réponse.",
      });
    },
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Avis supprimé", {
        description: "L'avis a été supprimé avec succès.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer l'avis.",
      });
    },
  });

  const handleRespond = (reviewId: number) => {
    if (!response.trim()) {
      toast.error("Réponse vide", {
        description: "Veuillez saisir une réponse avant de publier.",
      });
      return;
    }

    respondMutation.mutate({
      id: reviewId,
      response: response.trim(),
    });
  };

  const handleDelete = (reviewId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      deleteMutation.mutate({ id: reviewId });
    }
  };

  const publicReviews = reviews?.filter((r) => r.isPublic) || [];
  const privateReviews = reviews?.filter((r) => !r.isPublic) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Avis Clients</h1>
          <p className="text-muted-foreground">
            Gérez les évaluations et retours de vos clients
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {averageRating?.average.toFixed(1) || "0.0"}
                </div>
                <StarRating rating={averageRating?.average || 0} size={16} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Avis</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avis Publics</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicReviews.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des avis publics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Avis Publics</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : publicReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun avis public pour le moment
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {publicReviews.map((review) => (
                <div key={review.id} className="relative">
                  <ReviewCard review={review} showClientName showProjectName />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {!review.response && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReview(review.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Répondre
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Répondre à l'avis</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Votre réponse..."
                              rows={4}
                            />
                            <Button
                              onClick={() => handleRespond(review.id)}
                              disabled={respondMutation.isPending}
                              className="w-full"
                            >
                              {respondMutation.isPending ? "Envoi..." : "Publier la réponse"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des avis privés */}
        {privateReviews.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Avis Privés</h2>
            <div className="grid gap-4">
              {privateReviews.map((review) => (
                <div key={review.id} className="relative opacity-70">
                  <ReviewCard review={review} showClientName showProjectName />
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
