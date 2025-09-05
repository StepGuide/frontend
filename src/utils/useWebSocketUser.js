// ✅ src/utils/useWebSocketUser.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ref } from "vue";

export const useWebSocketUser = (code = null) => {
  const connected = ref(false);
  const lastMessage = ref("");
  const guardianMessage = ref("");
  let pongSubscription = null;
  let subscriptions = [];
  let currentCode = ref(code);

  const client = new Client({
    webSocketFactory: () => new SockJS("/ws"),
    debug: (str) => console.log("STOMP DEBUG:", str),
    reconnectDelay: 3000,
    onConnect: () => {
      console.log("✅ WebSocket 연결 성공");
      connected.value = true;

      // 기존 구독 정리
      subscriptions.forEach((s) => s.unsubscribe());
      subscriptions = [];

      pongSubscription = client.subscribe("/topic/pong", (message) => {
        lastMessage.value = message.body;
        console.log("📥 pong 수신:", message.body);
      });

      // 보호자 메시지 구독
      const sub = client.subscribe(`/topic/message/${currentCode.value}`, (msg) => {
        console.log("📥 보호자 메시지 수신:", msg.body);
        guardianMessage.value = msg.body;
      });
      subscriptions.push(sub);
      
      console.log(`🔔 메시지 구독 경로: /topic/message/${currentCode.value}`);
    },
    onStompError: (frame) =>
      console.error("❌ STOMP 오류:", frame.headers["message"]),
    onWebSocketClose: () => {
      console.warn("🔌 WebSocket 종료");
      connected.value = false;
    },
  });

  const connect = (newCode = null) => {
    if (newCode) {
      currentCode.value = newCode;
      console.log(`🔗 웹소켓 연결 시도 (코드: ${newCode})`);
      client.activate();
    } else {
      console.log('❌ 코드가 없어서 웹소켓 연결하지 않음');
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
    if (!connected.value) return;
    client.publish({
      destination: `/app/state/${currentCode.value}`,
      body: JSON.stringify(state),
    });
    console.log("📤 사용자 상태 전송됨:", state);
  };

  const sendHighlight = (highlight) => {
    if (!connected.value) return;
    client.publish({
      destination: `/app/state/highlight/${currentCode.value}`,
      body: JSON.stringify(highlight),
    });
    console.log("📤 강조 상태 전송됨:", highlight);
  };

  const sendDisconnectSignal = () => {
    if (!connected.value || !currentCode.value) return;
    client.publish({
      destination: `/app/disconnect/${currentCode.value}`,
      body: "USER_DISCONNECT",
    });
    console.log("📤 연결 해제 신호 전송됨:", currentCode.value);
  };

  return {
    connect,
    disconnect,
    sendPing,
    sendState,
    sendHighlight,
    sendDisconnectSignal,
    lastMessage,
    connected,
    guardianMessage,
  };
};
