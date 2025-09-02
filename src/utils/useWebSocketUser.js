// ✅ src/utils/useWebSocketUser.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ref } from "vue";

export const useWebSocketUser = (code = "123456") => {
  const connected = ref(false);
  const lastMessage = ref("");
  const guardianMessage = ref("");
  let pongSubscription = null;
  let subscriptions = [];

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

      // 보호자 메시지 구독
      const sub = client.subscribe(`/topic/message/${code}`, (msg) => {
        console.log("📥 보호자 메시지 수신:", msg.body);
        guardianMessage.value = msg.body;
      });
      subscriptions.push(sub);
    },
    onStompError: (frame) =>
      console.error("❌ STOMP 오류:", frame.headers["message"]),
    onWebSocketClose: () => {
      console.warn("🔌 WebSocket 종료");
      connected.value = false;
    },
  });

  const connect = () => client.activate();

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
      destination: `/app/state/${code}`,
      body: JSON.stringify(state),
    });
    console.log("📤 사용자 상태 전송됨:", state);
  };

  const sendHighlight = (highlight) => {
    if (!connected.value) return;
    client.publish({
      destination: `/app/state/highlight/${code}`,
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
  };
};
