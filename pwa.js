(() => {
  'use strict';

  let installPrompt = null;
  let registration = null;
  let reloading = false;

  const api = {
    get canInstall() {
      return Boolean(installPrompt) && !api.isStandalone();
    },
    get registration() {
      return registration;
    },
    isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    },
    async install() {
      if (api.isStandalone()) return { outcome: 'already-installed' };
      if (!installPrompt) return { outcome: 'unavailable' };
      const prompt = installPrompt;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      installPrompt = null;
      window.dispatchEvent(new CustomEvent('bo-pwa-statechange'));
      return choice;
    }
  };

  window.BO_PWA = api;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    window.dispatchEvent(new CustomEvent('bo-pwa-statechange'));
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    window.dispatchEvent(new CustomEvent('bo-pwa-installed'));
    window.dispatchEvent(new CustomEvent('bo-pwa-statechange'));
  });

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      registration = await navigator.serviceWorker.register('./service-worker.js');
      if (registration.waiting) {
        window.dispatchEvent(new CustomEvent('bo-pwa-update', { detail: registration }));
      }
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('bo-pwa-update', { detail: registration }));
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });
    } catch (error) {
      console.warn('Service Worker não registrado.', error);
    }
  }

  window.addEventListener('load', registerServiceWorker);
})();
