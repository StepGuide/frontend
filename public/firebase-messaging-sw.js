// 백그라운드 메시지 수신 시 실행됨
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.notification?.title || '알림';
  const body = data.notification?.body || '메시지가 도착했습니다.';
  const icon = data.notification?.icon || '/favicon.ico';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      data: data.data || {}, // 클릭 시 활용할 추가 데이터
    })
  );
});

// 알림 클릭 시 동작
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const clickUrl = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(clickUrl));
});
