// ✅ src/utils/useWebSocketUser.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ref } from "vue";

export const useWebSocketUser = (initialCode = null) => {
  const connected = ref(false);
  const lastMessage = ref("");
  const guardianMessage = ref("");
  let pongSubscription = null;
  let subscriptions = [];
  let currentCode = initialCode;

  const client = new Client({
    webSocketFactory: () => new SockJS("/ws"),
    debug: (str) => console.log("STOMP DEBUG:", str),
    reconnectDelay: 3000,
    onConnect: () => {
      console.log("✅ WebSocket 연결 성공");
      connected.value = true;

      pongSubscription = client.subscribe("/topic/pong", (message) => {
        lastMessage.value = message.body;
        console.log("📥 pong 수신:", message.body);
      });

      // 코드가 있는 경우에만 구독
      if (currentCode) {
        setupSubscriptions(currentCode);
      }
    },
    onStompError: (frame) =>
      console.error("❌ STOMP 오류:", frame.headers["message"]),
    onWebSocketClose: () => {
      console.warn("🔌 WebSocket 종료");
      connected.value = false;
    },
  });

  const setupSubscriptions = (code) => {
    console.log("📡 사용자 구독 설정:", code);
    
    // 보호자 메시지 구독
    const sub = client.subscribe(`/topic/message/${code}`, (msg) => {
      console.log("📥 보호자 메시지 수신:", msg.body);
      guardianMessage.value = msg.body;
    });
    subscriptions.push(sub);
  };

  const connect = (code = null) => {
    if (code) {
      currentCode = code;
    }
    
    if (!client.active) {
      client.activate();
    } else if (currentCode) {
      // 기존 구독 해제
      subscriptions.forEach((s) => s.unsubscribe());
      subscriptions = [];
      
      // 새 코드로 구독 설정
      setupSubscriptions(currentCode);
    }
  };

  const disconnect = () => {
    pongSubscription?.unsubscribe();
    subscriptions.forEach((s) => s.unsubscribe());
    subscriptions = [];
    client.deactivate();
    connected.value = false;
    lastMessage.value = "";
    guardianMessage.value = "";
  };

  const sendPing = () => {
    if (!connected.value) return;
    client.publish({ destination: "/app/ping", body: "hello from user" });
  };

  const sendState = (state) => {
    if (!connected.value || !currentCode) return;
    client.publish({
      destination: `/app/state/${currentCode}`,
      body: JSON.stringify(state),
    });
    console.log("📤 사용자 상태 전송됨:", state);
  };

  const sendHighlight = (highlight) => {
    if (!connected.value || !currentCode) return;
    client.publish({
      destination: `/app/state/highlight/${currentCode}`,
      body: JSON.stringify(highlight),
    });
    console.log("📤 강조 상태 전송됨:", highlight);
  };

  return {
    connect,
    disconnect,
    sendPing,
    sendState,
    sendHighlight,
    lastMessage,
    connected,
    guardianMessage,
    client, // WebRTC 시그널링을 위해 클라이언트 노출
  };
};
