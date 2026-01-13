import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPermissionPrompt() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le prompt
    const wasDismissed = localStorage.getItem('notification-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Afficher le prompt après 5 secondes si les notifications sont supportées et pas encore accordées
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAllow = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setShowPrompt(false);
      setDismissed(true);
    } else if (result === 'denied') {
      setShowPrompt(false);
      setDismissed(true);
      localStorage.setItem('notification-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Ne pas afficher si pas supporté, déjà accordé, fermé, ou pas encore temps
  if (!isSupported || permission !== 'default' || dismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Activer les notifications
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Recevez des alertes pour vos tâches échues et rendez-vous à venir
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAllow}
              size="sm"
              className="flex-1"
            >
              Activer
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
