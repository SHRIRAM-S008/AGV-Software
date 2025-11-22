// Unregister all service workers and clear caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered:', registration.scope);
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for(let name of names) {
      caches.delete(name);
      console.log('Cache deleted:', name);
    }
  });
}

// Clear localStorage
localStorage.clear();
console.log('Local storage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('Session storage cleared');
