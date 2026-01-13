import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import StarRating from './StarRating';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ReviewFormProps {
  clientId: number;
  projectId?: number;
  projectName?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({
  clientId,
  projectId,
  projectName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Merci pour votre avis !", {
        description: "Votre évaluation a été enregistrée avec succès.",
      });
      setRating(0);
      setComment('');
      setIsPublic(true);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message || "Impossible d'enregistrer votre avis.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Note requise", {
        description: "Veuillez sélectionner une note avant de soumettre.",
      });
      return;
    }

    createReview.mutate({
      clientId,
      projectId,
      rating,
      comment: comment.trim() || undefined,
      isPublic,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {projectName ? `Évaluer : ${projectName}` : 'Laisser un avis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Votre note</Label>
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size={32}
            />
          </div>

          <div>
            <Label htmlFor="comment">Votre commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
            />
            <Label
              htmlFor="isPublic"
              className="text-sm font-normal cursor-pointer"
            >
              Rendre cet avis public
            </Label>
          </div>

          <Button
            type="submit"
            disabled={createReview.isPending || rating === 0}
            className="w-full"
          >
            {createReview.isPending ? 'Envoi en cours...' : 'Envoyer mon avis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
