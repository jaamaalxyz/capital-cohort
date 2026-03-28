// Service worker for Capital Cohort web push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'Capital Cohort';
  const options = {
    body: data.body ?? '',
    icon: '/assets/icon.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
