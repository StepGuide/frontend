// ✅ src/utils/useWebSocketGuardian.js
if (typeof global === 'undefined') {
  window.global = window;
}

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ref } from "vue";

export const useWebSocketGuardian = () => {
  const connected = ref(false);
  const userState = ref(null);
  const highlightState = ref(null);
  const guardianMessage = ref("");
  let subscriptions = [];
  let currentCode = null;

  const client = new Client({
    webSocketFactory: () => new SockJS("/ws"),
    debug: (str) => console.log("STOMP DEBUG:", str),
    reconnectDelay: 3000,
    onConnect: () => {
      connected.value = true;
      console.log("✅ 보호자 WebSocket 연결됨");

      if (!currentCode) return;

      // ✅ 연결 후 구독 경로 설정
      subscribeToTopics(currentCode);
    },
    onStompError: (frame) => {
      console.error("❌ STOMP 오류:", frame.headers["message"]);
    },
    onWebSocketClose: () => {
      connected.value = false;
      console.warn("🔌 WebSocket 종료");
    },
  });

  // ✅ 동적 subscribe 함수
  const subscribeToTopics = (code) => {
    subscriptions.push(
      client.subscribe(`/topic/state/${code}`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📥 사용자 위치 상태:", data);
        userState.value = data;
      })
    );

    subscriptions.push(
      client.subscribe(`/topic/highlight/${code}`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📥 사용자 강조 상태:", data);
        highlightState.value = data;
      })
    );

    subscriptions.push(
      client.subscribe(`/topic/message/${code}`, (msg) => {
        console.log("📥 사용자 메시지:", msg.body);
        guardianMessage.value = msg.body;
      })
    );
  };

  const connect = (code) => {
    currentCode = code;
    client.activate();
  };

  const disconnect = () => {
    subscriptions.forEach((s) => s.unsubscribe());
    subscriptions = [];
    client.deactivate();
    connected.value = false;
    userState.value = null;
    highlightState.value = null;
    guardianMessage.value = "";
    currentCode = null;
  };

  const sendMessageToUser = (text) => {
    if (currentCode) {
      client.publish({
        destination: `/app/message/${currentCode}`,
        body: text,
      });
    }
  };

  return {
    connect,
    disconnect,
    sendMessageToUser,
    userState,
    highlightState,
    guardianMessage,
    connected,
  };
};
