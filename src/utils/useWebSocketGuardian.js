// ✅ src/utils/useWebSocketGuardian.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ref } from "vue";

export const useWebSocketGuardian = (initialCode = null) => {
  const connected = ref(false);
  const userState = ref(null);
  const highlightState = ref(null);
  const guardianMessage = ref("");
  let subscriptions = [];
  let currentCode = initialCode;

  const client = new Client({
    webSocketFactory: () => new SockJS("/ws"),
    debug: (str) => console.log("STOMP DEBUG:", str),
    reconnectDelay: 3000,
    onConnect: () => {
      connected.value = true;
      console.log("✅ 보호자 WebSocket 연결됨");
      
      // 코드가 있는 경우에만 구독
      if (currentCode) {
        setupSubscriptions(currentCode);
      }
    },
    onStompError: (frame) =>
      console.error("❌ STOMP 오류:", frame.headers["message"]),
    onWebSocketClose: () => {
      connected.value = false;
      console.warn("🔌 WebSocket 종료");
    },
  });

  const setupSubscriptions = (code) => {
    console.log("📡 보호자 구독 설정:", code);
    
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

  const connect = (code = null) => {
    if (code) {
      currentCode = code;
    }
    
    if (!client.active) {
      client.activate();
    } else if (currentCode) {
      // 이미 연결되어 있다면 새 코드로 구독만 설정
      setupSubscriptions(currentCode);
    }
  };
  const disconnect = () => {
    subscriptions.forEach((s) => s.unsubscribe());
    subscriptions = [];
    client.deactivate();
    connected.value = false;
    userState.value = null;
    highlightState.value = null;
    guardianMessage.value = "";
  };

  const sendMessageToUser = (text) => {
    if (currentCode) {
      client.publish({ destination: `/app/message/${currentCode}`, body: text });
    } else {
      console.warn("⚠️ 코드가 설정되지 않아 메시지를 보낼 수 없습니다");
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
    client, // WebRTC 시그널링을 위해 클라이언트 노출
  };
};
