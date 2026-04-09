self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Unregister itself if not needed
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach(client => client.navigate(client.url));
        });
});
