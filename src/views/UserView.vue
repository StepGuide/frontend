<template>
  <div>
    <h2>👤 사용자 화면</h2>
    <button @click="connect">연결</button>
    <button @click="disconnect">연결 종료</button>
    <button @click="sendPing">핑 테스트</button>
    <button @click="sendState({ currentLocation: '/send', highlightedArea: 'amount' , userName: 'jsy1021'})">
      상태 전송
    </button>

    <p>📬 마지막 메시지: {{ lastMessage }}</p>
    <p>🟦 보호자 메시지: {{ guardianMessage }}</p> <!-- ✅ 메시지 표시 -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWebSocketUser } from '@/utils/useWebSocketUser';

const {
  connect,
  disconnect,
  sendPing,
  sendState,
  lastMessage,
  guardianMessage,
} = useWebSocketUser("123456");

onMounted(() => {
  connect();
});
</script>
