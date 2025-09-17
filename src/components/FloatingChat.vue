<template>
  <!-- 우측 하단 고정 채팅창 -->
  <div class="floating-chat-container">
    <div v-if="!isChatOpen" class="chat-toggle-btn" @click="toggleChat">
      <div class="chat-icon">💬</div>
      <div v-if="hasNewMessage" class="new-message-indicator"></div>
    </div>
    
    <div v-if="isChatOpen" class="floating-chat-window">
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-icon">💬</span>
          <span>보호자와의 대화</span>
        </div>
        <button class="chat-close-btn" @click="toggleChat">×</button>
      </div>
      
      <div class="chat-messages" ref="chatMessages">
        <!-- 메시지 히스토리 -->
        <div v-for="(msg, index) in messageHistory" :key="index" class="message" :class="msg.isSystemMessage ? 'system-message' : 'guardian-message'">
          <div class="message-content" :class="{ 'system': msg.isSystemMessage }">
            <span v-if="msg.isSystemMessage" class="system-icon">⚠️</span>
            {{ msg.content }}
          </div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
        
        <!-- 연결 대기 상태 -->
        <div v-if="messageHistory.length === 0" class="no-messages">
          <div class="connection-status">
            <div class="status-icon">⏳</div>
            <span>보호자 연결을 기다리는 중...</span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWebSocketUser } from '@/utils/useWebSocketUser'
import { useHelpCodeStore } from '@/stores/helpCode'

// 라우트 정보 가져오기
const route = useRoute()

// 도움 요청 코드 store
const helpCodeStore = useHelpCodeStore()

// URL 쿼리 파라미터에서 코드 가져오기
// 또는 MainPage에서 생성된 코드 사용 (store에서)
const helpCode = computed(() => {
  return route.query.code || helpCodeStore.generatedCode
})

// 웹소켓 및 채팅 관련 상태
const isChatOpen = ref(false)
const hasNewMessage = ref(false)
const chatMessages = ref(null)
const messageHistory = ref([]) // 메시지 히스토리 배열

// 웹소켓 연결 (동적 코드로 연결)
const { connected: isWebSocketConnected, guardianMessage, connect: connectWebSocket, disconnect: disconnectWebSocket } = useWebSocketUser(helpCode.value)

// 채팅창 관련 함수들
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    hasNewMessage.value = false
    // 채팅창이 열릴 때 스크롤을 맨 아래로
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }
}

const formatTime = (date) => {
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 보호자 메시지 감지
watch(guardianMessage, (newMessage) => {
  if (newMessage && newMessage.trim()) {
    // 시스템 메시지 필터링 (채팅창에 표시하지 않음)
    const systemMessages = [
      'GUARDIAN_CONNECTED',
      'GUARDIAN_DISCONNECTED', 
      'USER_CONNECTION_CONFIRMED',
      'USER_CONNECTION_CHECK',
      'GUARDIAN_CONNECTION_ALIVE'
    ]
    
    if (systemMessages.includes(newMessage)) {
      console.log('📨 시스템 메시지 수신 (채팅창에 표시 안함):', newMessage)
      return // 채팅창에 표시하지 않음
    }
    
    hasNewMessage.value = true
    console.log('📨 보호자 메시지 수신:', newMessage)
    
    // 메시지 히스토리에 추가
    messageHistory.value.push({
      content: newMessage,
      timestamp: new Date()
    })
    
    // 메시지 히스토리 제한 (최대 50개)
    if (messageHistory.value.length > 50) {
      messageHistory.value = messageHistory.value.slice(-50)
    }
    
    // 보호자 메시지가 오면 자동으로 채팅창 열기
    if (!isChatOpen.value) {
      isChatOpen.value = true
      console.log('💬 보호자 메시지로 인해 채팅창 자동 열림')
    }
    
    // 채팅창이 열려있으면 자동으로 스크롤
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }
})

// 웹소켓 연결 상태 감지
watch(isWebSocketConnected, (connected) => {
  if (connected) {
    console.log('웹소켓 연결됨')
    
    // 웹소켓 연결되면 자동으로 채팅창 열기
    if (!isChatOpen.value) {
      isChatOpen.value = true
      console.log('💬 웹소켓 연결로 인해 채팅창 자동 열림')
    }
    
    // 연결되면 채팅창이 열려있으면 자동으로 스크롤
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  } else {
    console.log('웹소켓 연결 해제됨')
  }
})

// 코드 변경 감지
watch(helpCode, (newCode, oldCode) => {
  console.log('🔄 FloatingChat 코드 변경됨:', oldCode, '->', newCode)
  
  if (newCode && newCode !== oldCode) {
    // 기존 연결 해제 후 새 코드로 재연결
    disconnectWebSocket()
    
    // 메시지 히스토리 초기화
    messageHistory.value = []
    
    setTimeout(() => {
      connectWebSocket(newCode)
      console.log('🔗 새 코드로 웹소켓 재연결:', newCode)
    }, 500)
  } else if (!newCode && oldCode) {
    // 코드가 null이 되면 연결 종료 처리
    console.log('🔌 FloatingChat 코드가 null이 됨 - 연결 종료 처리')
    
    // 웹소켓이 실제로 연결되어 있었을 때만 종료 메시지 표시
    if (isWebSocketConnected.value) {
      // 웹소켓 연결 해제
      disconnectWebSocket()
      
      // 연결 종료 안내 메시지 추가
      const systemMessage = {
        content: '보호자와 연결이 종료되었습니다.',
        timestamp: new Date(),
        isSystemMessage: true
      }
      messageHistory.value.push(systemMessage)
      console.log('🔌 시스템 메시지 추가됨:', systemMessage)
      
      // 채팅창이 열려있지 않으면 열기
      if (!isChatOpen.value) {
        isChatOpen.value = true
        console.log('🔌 채팅창 자동 열림')
      }
      
      // 5초 후 채팅창 닫기
      setTimeout(() => {
        isChatOpen.value = false
        hasNewMessage.value = false
        console.log('🔌 5초 후 채팅창 자동 닫힘')
      }, 5000)
    } else {
      // 웹소켓이 연결되지 않았던 경우 단순히 연결 해제만
      disconnectWebSocket()
      console.log('🔌 웹소켓이 연결되지 않았으므로 종료 메시지 표시 안함')
    }
  }
}, { immediate: true })

// 연결 비활성화 상태 감지 (백업용 - 코드 변경 감지가 우선)
watch(() => helpCodeStore.isConnectionDisabled, (isDisabled, wasDisabled) => {
  console.log('🔌 FloatingChat 연결 상태 변경 (백업):', wasDisabled, '->', isDisabled)
  // 코드 변경 감지에서 처리하므로 여기서는 로그만 출력
})

// 컴포넌트 마운트 시 웹소켓 연결
onMounted(() => {
  console.log('🚀 FloatingChat 컴포넌트 마운트됨')
  console.log('📋 사용 중인 코드:', helpCode.value)
  // watch에서 이미 연결하므로 여기서는 연결하지 않음
})

// 컴포넌트 언마운트 시 웹소켓 연결 해제
onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<style scoped>

/* 우측 하단 고정 채팅창 스타일 */
.floating-chat-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  background: #FFBC00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 188, 0, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(255, 188, 0, 0.6);
}

.chat-icon {
  font-size: 24px;
  color: var(--white);
}

.new-message-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  border: 3px solid var(--white);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.floating-chat-window {
  width: 380px;
  height: 480px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  opacity: 1;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-header {
  background: #FFBC00;
  color: #ffffff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.chat-close-btn {
  background: none;
  border: none;
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.chat-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 2px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guardian-message {
  align-items: flex-end;
}

.message-content {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
  color: #424242;
  border: 1px solid #eeeeee;
}

.guardian-message .message-content {
  background: #FFBC00;
  color: #ffffff;
  border-radius: 16px 16px 4px 16px;
  border: none;
}

.message-time {
  font-size: 11px;
  color: var(--gray-500);
  margin-left: 16px;
  font-weight: 500;
}

.guardian-message .message-time {
  margin-left: 0;
  margin-right: 16px;
  text-align: right;
}

/* 시스템 메시지 스타일 */
.system-message {
  align-items: center;
  justify-content: center;
}

.system-message .message-content {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}

.system-icon {
  margin-right: 6px;
  font-size: 14px;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-500);
  font-size: 14px;
  font-style: italic;
}

.connection-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--gray-500);
}

.status-icon {
  font-size: 24px;
  opacity: 0.7;
}

.system-message {
  align-items: center;
}

.message-content.system {
  background: #4CAF50;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.system-icon {
  font-size: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .floating-chat-container {
    bottom: 24px;
    right: 24px;
  }
  
  .floating-chat-window {
    width: calc(100vw - 32px);
    max-width: 380px;
    height: 420px;
  }
  
  .chat-toggle-btn {
    width: 56px;
    height: 56px;
  }
  
  .chat-icon {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .floating-chat-container {
    bottom: 20px;
    right: 20px;
  }
  
  .floating-chat-window {
    width: calc(100vw - 24px);
    height: 360px;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-title {
    font-size: 14px;
  }
  
  .chat-messages {
    padding: 12px;
  }
}
</style>
