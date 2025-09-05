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
      
      // 보호자 연결 알림을 사용자에게 전송
      setTimeout(() => {
        sendMessageToUser("보호자가 연결되었습니다. 도움이 필요하시면 언제든 말씀해주세요.");
      }, 500);
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

    subscriptions.push(
      client.subscribe(`/topic/disconnect/${code}`, (msg) => {
        console.log("📥 연결 해제 신호 수신:", msg.body);
        if (msg.body === "USER_DISCONNECT") {
          console.log("🔌 사용자가 연결을 해제했습니다. GuardianView 연결 해제 처리");
          disconnect();
        }
      })
    );
  };

  const connect = (code) => {
    currentCode = code;
    console.log(`🔗 보호자가 코드 ${code}로 연결 시도`);
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
      console.log(`📤 보호자 메시지 전송: ${text} (코드: ${currentCode})`);
      client.publish({
        destination: `/app/message/${currentCode}`,
        body: text,
      });
    } else {
      console.error('❌ 현재 코드가 없어서 메시지를 보낼 수 없습니다');
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
