import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
} from 'firebase/messaging';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';
const firebaseConfig = {
  apiKey: 'AIzaSyDIgpMNSLOx85rjITeSiC52BJr9oMdhpvA',
  authDomain: 'kbhack-1d170.firebaseapp.com',
  projectId: 'kbhack-1d170',
  storageBucket: 'kbhack-1d170.firebasestorage.app',
  messagingSenderId: '658940548430',
  appId: '1:658940548430:web:42be702a3ad53ac415ba1f',
  measurementId: 'G-2KYHSRL6DT',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export async function setupPushNotifications() {
  const auth = useAuthStore();
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('알림 권한이 거절되었습니다.');
    return;
  }

  const registration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js'
  );

  const token = await getToken(messaging, {
    vapidKey:
      'BMmznBwuzElf4OOBzzIp5uDRNnjKK2VBzc8tOHk7Dn1xa-Mtbu9neizAvEn1M8dvO1nvbav868tIe5kon8FAu7Q',
    serviceWorkerRegistration: registration,
  });

  console.log('FCM 토큰:', token);

  if (token) {
    await api.post(
      '/push/register-token',
      { token },
      {
        headers: { Authorization: `Bearer ${auth.token}` }, // 인터셉터 + 수동 이중 안전
      }
    );
  }
  onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지:', payload);
  });
}

export async function unregisterPushNotifications() {
  const auth = useAuthStore();
  try {
    const registration =
      (await navigator.serviceWorker.getRegistration(
        '/firebase-messaging-sw.js'
      )) ||
      (await navigator.serviceWorker.register('/firebase-messaging-sw.js'));

    const token = await getToken(messaging, {
      vapidKey:
        'BMmznBwuzElf4OOBzzIp5uDRNnjKK2VBzc8tOHk7Dn1xa-Mtbu9neizAvEn1M8dvO1nvbav868tIe5kon8FAu7Q',
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await api.post(
        '/push/unregister-token',
        { token },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      try {
        await deleteToken(messaging);
      } catch {}
    }
  } catch (e) {
    console.debug('[push] unregister skipped:', e);
  }
}
