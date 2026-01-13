import { Card, CardContent, CardHeader } from './ui/card';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    comment?: string | null;
    createdAt: Date | string;
    response?: string | null;
    respondedAt?: Date | string | null;
    client?: {
      firstName: string;
      lastName: string;
    };
    project?: {
      name: string;
    };
  };
  showClientName?: boolean;
  showProjectName?: boolean;
}

export default function ReviewCard({
  review,
  showClientName = false,
  showProjectName = true,
}: ReviewCardProps) {
  const createdDate = typeof review.createdAt === 'string' 
    ? new Date(review.createdAt) 
    : review.createdAt;

  const respondedDate = review.respondedAt 
    ? (typeof review.respondedAt === 'string' ? new Date(review.respondedAt) : review.respondedAt)
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showClientName && review.client && (
              <p className="font-semibold text-sm mb-1">
                {review.client.firstName} {review.client.lastName}
              </p>
            )}
            {showProjectName && review.project && (
              <p className="text-sm text-muted-foreground mb-2">
                {review.project.name}
              </p>
            )}
            <StarRating rating={review.rating} />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdDate, { addSuffix: true, locale: fr })}
          </span>
        </div>
      </CardHeader>

      {review.comment && (
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        </CardContent>
      )}

      {review.response && (
        <CardContent className="pt-3 border-t bg-muted/30">
          <div className="flex gap-2">
            <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1">Réponse du coach</p>
              <p className="text-sm text-muted-foreground">{review.response}</p>
              {respondedDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(respondedDate, { addSuffix: true, locale: fr })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
