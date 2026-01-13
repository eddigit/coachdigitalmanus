import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPWABanner() {
  const { canInstall, isInstalled, installPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le banner
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé, pas installable, ou fermé
  if (isInstalled || !canInstall || dismissed) {
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
        <div className="w-12 h-12 border-2 border-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-xl">G</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Installer Coach Digital
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Accédez rapidement à votre plateforme depuis votre écran d'accueil
          </p>
          
          <Button
            onClick={handleInstall}
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Installer l'application
          </Button>
        </div>
      </div>
    </div>
  );
}
