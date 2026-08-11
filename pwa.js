(() => {
  'use strict';

  let installPrompt = null;
  let registration = null;
  let reloading = false;
  let updateCheckTimer = null;

  function dispatchUpdate(reg = registration) {
    if (!reg?.waiting) return false;
    window.dispatchEvent(new CustomEvent('bo-pwa-update', { detail: reg }));
    return true;
  }

  async function checkForUpdate() {
    if (!registration) return false;
    try {
      await registration.update();
      return dispatchUpdate(registration);
    } catch (error) {
      console.warn('Não foi possível verificar atualização do PWA.', error);
      return false;
    }
  }

  const api = {
    get canInstall() {
      return Boolean(installPrompt) && !api.isStandalone();
    },
    get registration() {
      return registration;
    },
    get hasUpdate() {
      return Boolean(registration?.waiting);
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
    },
    async checkForUpdate() {
      return checkForUpdate();
    },
    async applyUpdate(reg = registration) {
      const target = reg || registration;
      if (!target?.waiting) return false;
      target.waiting.postMessage({ tipo: 'SKIP_WAITING' });
      return true;
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
      dispatchUpdate(registration);

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            dispatchUpdate(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });

      // Confere ao abrir e periodicamente enquanto o app estiver em uso.
      setTimeout(checkForUpdate, 1800);
      clearInterval(updateCheckTimer);
      updateCheckTimer = setInterval(checkForUpdate, 15 * 60 * 1000);
    } catch (error) {
      console.warn('Service Worker não registrado.', error);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });

  window.addEventListener('load', registerServiceWorker);
})();
