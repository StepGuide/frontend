<template>
  <div class="guardian-mode">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <span class="logo-icon">🏦</span>
          <span class="logo-text">KB 금융 도우미 - 보호자 모드</span>
        </div>
        <div class="nav-actions">
          <button class="mode-toggle-btn" @click="toggleMode">
            <span class="toggle-icon">👤</span>
            <span class="toggle-text">사용자 모드</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 연결되지 않은 상태 -->
      <div v-if="!connected" class="connection-section">
        <div class="connection-card">
          <div class="connection-header">
            <h2>🧓 보호자 연결</h2>
            <p>사용자의 6자리 도움 코드를 입력해주세요</p>
          </div>

          <div class="code-input-section">
            <div class="code-input-group">
              <input 
                v-for="(digit, index) in 6" 
                :key="index"
                v-model="connectionCode[index]"
                type="text"
                maxlength="1"
                class="code-digit"
                @input="onCodeInput(index, $event)"
                @keydown="onCodeKeydown(index, $event)"
                ref="codeInputs"
              />
            </div>
            <button class="connect-btn" @click="connectToUser" :disabled="!isCodeComplete">
              연결하기
            </button>
          </div>

          <div class="connection-info">
            <h3>연결 방법</h3>
            <ol>
              <li>사용자가 '도움 요청하기' 버튼을 클릭합니다</li>
              <li>6자리 도움 코드가 생성됩니다</li>
              <li>위 입력창에 코드를 입력하고 '연결하기'를 클릭합니다</li>
              <li>연결이 완료되면 실시간으로 사용자 화면을 확인할 수 있습니다</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- 연결된 상태 -->
      <div v-else class="connected-section">
        <!-- 연결 상태 헤더 -->
        <div class="connection-status">
          <div class="status-header">
            <h2>🧓 연결된 사용자</h2>
            <div class="status-indicator">
              <span class="status-dot connected"></span>
              <span class="status-text">연결됨 ({{ code }})</span>
            </div>
          </div>
        </div>

        <!-- 사용자 현재 상태 -->
        <div class="user-status-card">
          <div class="status-row">
            <span class="status-label">📍 현재 위치:</span>
            <span class="status-value">{{ userState?.currentLocation || '정보 없음' }}</span>
          </div>
          <div class="status-row">
            <span class="status-label">🎯 강조 영역:</span>
            <span class="status-value">{{ userState?.highighlightedAreahlight || '없음' }}</span>
          </div>
          <div class="status-row">
            <span class="status-label">🎯 사용자 정보 영역:</span>
            <span class="status-value">{{ userState?.userName || '없음' }}</span>
          </div>
        </div>

        <!-- 메시지 전송 -->
        <div class="message-section">
          <h3>💬 메시지 보내기</h3>
          <div class="message-input-group">
            <input 
              v-model="messageText" 
              type="text" 
              placeholder="사용자에게 보낼 메시지를 입력하세요"
              class="message-input"
            />
            <button class="send-btn" @click="sendMessageToUser(messageText)">전송</button>
          </div>
          <div class="quick-messages">
            <button 
              v-for="msg in quickMessages" 
              :key="msg"
              class="quick-msg-btn"
              @click="messageText = msg"
            >
              {{ msg }}
            </button>
          </div>
        </div>

        <!-- 화면 미리보기 -->
        <div class="screen-preview">
          <h3>🗺 화면 미리보기</h3>
          <div class="preview-container">
            <div class="preview-placeholder">
              <span class="preview-icon">📱</span>
              <p>사용자 화면이 여기에 표시됩니다</p>
              <p class="preview-detail">{{ userState?.currentPage }}</p>
            </div>
          </div>
        </div>

        <!-- 하단 액션 버튼들 -->
        <div class="action-buttons">
          <button class="action-btn disconnect" @click="disconnect">🔚 연결 종료</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useWebSocketGuardian } from '@/utils/useWebSocketGuardian';

const router = useRouter();
const connectionCode = ref(['', '', '', '', '', '']);
const code = ref('');
const messageText = ref('');
const codeInputs = ref([]);
const quickMessages = [
  '다음 버튼을 눌러주세요',
  '금액을 입력해주세요',
  '계좌번호를 확인해주세요',
  '비밀번호를 입력해주세요',
  '확인 버튼을 눌러주세요',
];

// WebSocket 연결 관리
const {
  connect,
  disconnect,
  sendMessageToUser,
  userState,
  guardianMessage,
  connected
} = useWebSocketGuardian();

const isCodeComplete = computed(() => connectionCode.value.every((digit) => digit !== ''));

const onCodeInput = (index, event) => {
  const value = event.target.value;
  if (value && index < 5) {
    nextTick(() => codeInputs.value[index + 1]?.focus());
  }
};

const onCodeKeydown = (index, event) => {
  if (event.key === 'Backspace' && !connectionCode.value[index] && index > 0) {
    nextTick(() => codeInputs.value[index - 1]?.focus());
  }
};

const connectToUser = () => {
  const fullCode = connectionCode.value.join('');
  if (fullCode.length === 6) {
    code.value = fullCode;
    connect(fullCode); // ✅ WebSocket 연결
  } else {
    alert('올바른 6자리 코드를 입력해주세요.');
  }
};

const toggleMode = () => {
  router.push('/user');
};
</script>


<style scoped>
/* CSS 변수 정의 */
.guardian-mode {
  --kb-yellow: #FFD700;
  --kb-orange: #FF8C00;
  --kb-orange-light: #FFE4B3;
  --kb-orange-dark: #E67300;
  --kb-blue: #0066B3;
  --kb-blue-light: #E6F0FA;
  --kb-blue-dark: #004C8C;
  --kb-gray: #F8F9FA;
  --kb-gray-light: #FFFFFF;
  --kb-gray-dark: #495057;
  --kb-text-primary: #1A1A1A;
  --kb-text-secondary: #666666;
  --kb-text-light: #999999;
  --kb-border: #E1E5E9;
  --kb-shadow: rgba(0, 0, 0, 0.08);
  --kb-shadow-hover: rgba(0, 0, 0, 0.12);
  --kb-success: #28A745;
  --kb-danger: #DC3545;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.guardian-mode {
  min-height: 100vh;
  background: var(--kb-gray);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--kb-text-primary);
}

/* 네비게이션 */
.navbar {
  background: var(--kb-gray-light);
  border-bottom: 3px solid var(--kb-orange);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: var(--kb-orange);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-orange);
}

.mode-toggle-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-toggle-btn:hover {
  background: var(--kb-orange-dark);
}

.toggle-icon {
  font-size: 18px;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* 연결되지 않은 상태 */
.connection-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.connection-card {
  background: var(--kb-gray-light);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--kb-orange);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.connection-header h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--kb-text-primary);
}

.connection-header p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  margin-bottom: 32px;
  font-weight: 600;
}

.code-input-section {
  margin-bottom: 32px;
}

.code-input-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.code-digit {
  width: 60px;
  height: 60px;
  border: 3px solid var(--kb-border);
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: var(--kb-text-primary);
  background: var(--kb-gray-light);
  transition: all 0.2s ease;
}

.code-digit:focus {
  outline: none;
  border-color: var(--kb-orange);
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.connect-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 16px 32px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.connect-btn:hover:not(:disabled) {
  background: var(--kb-orange-dark);
}

.connect-btn:disabled {
  background: var(--kb-text-light);
  cursor: not-allowed;
}

.connection-info {
  text-align: left;
  background: var(--kb-blue-light);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid var(--kb-blue);
}

.connection-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--kb-text-primary);
}

.connection-info ol {
  padding-left: 20px;
  color: var(--kb-text-secondary);
  font-weight: 500;
  line-height: 1.6;
}

.connection-info li {
  margin-bottom: 8px;
}

/* 연결된 상태 */
.connected-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.connection-status {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.connected {
  background: var(--kb-success);
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-success);
}

.user-status-card {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--kb-border);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

.status-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.message-section {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}

.message-section h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--kb-text-primary);
}

.message-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--kb-border);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--kb-text-primary);
  background: var(--kb-gray-light);
}

.message-input:focus {
  outline: none;
  border-color: var(--kb-orange);
}

.send-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover {
  background: var(--kb-orange-dark);
}

.quick-messages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-msg-btn {
  background: var(--kb-blue-light);
  color: var(--kb-blue);
  border: 1px solid var(--kb-blue);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-msg-btn:hover {
  background: var(--kb-blue);
  color: var(--kb-gray-light);
}

.screen-preview {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}

.screen-preview h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--kb-text-primary);
}

.preview-container {
  border: 2px solid var(--kb-border);
  border-radius: 12px;
  overflow: hidden;
}

.preview-header {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.preview-content {
  padding: 40px 20px;
  background: var(--kb-gray);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: var(--kb-text-secondary);
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.preview-placeholder p {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.preview-detail {
  font-size: 14px;
  color: var(--kb-text-light);
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 20px 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--kb-gray-light);
  border: 2px solid var(--kb-border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.action-btn:hover {
  border-color: var(--kb-orange);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

.action-btn.settings:hover {
  border-color: var(--kb-blue);
}

.action-btn.help:hover {
  border-color: var(--kb-blue);
}

.action-btn.disconnect:hover {
  border-color: var(--kb-danger);
}

.btn-icon {
  font-size: 24px;
}

.btn-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-primary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  
  .connection-card {
    padding: 24px;
    margin: 16px;
  }
  
  .code-input-group {
    gap: 8px;
  }
  
  .code-digit {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 8px;
  }
  
  .connection-card {
    padding: 20px;
    margin: 8px;
  }
  
  .code-digit {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
</style>
