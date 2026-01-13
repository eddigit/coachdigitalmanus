import { useEffect, useState } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('[Notifications] Les notifications ne sont pas supportées');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log(`[Notifications] Permission: ${result}`);
      return result;
    } catch (error) {
      console.error('[Notifications] Erreur lors de la demande de permission:', error);
      return 'denied';
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('[Notifications] Permission non accordée');
      return;
    }

    try {
      // Si le service worker est disponible, utiliser showNotification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options,
          });
        });
      } else {
        // Sinon, utiliser l'API Notification directement
        new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options,
        });
      }
    } catch (error) {
      console.error('[Notifications] Erreur lors de l\'affichage de la notification:', error);
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
}
