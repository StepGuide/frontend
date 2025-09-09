<template>
  <div class="guardian-container">
    
    <!-- 1단계: 코드 입력 화면 -->
    <div class="code-input-screen" :class="{ 'screen-hidden': isConnectedToUser }">
      <div class="input-screen-content">
        <!-- 헤더 -->
        <div class="input-header">
          <h1 class="input-title">보호자 연결</h1>
          <p class="input-subtitle">사용자로부터 받은 6자리 도움 코드를 입력해주세요</p>
        </div>

        <!-- 6자리 코드 입력 (분리형) -->
        <div class="code-input-wrapper">
          <div class="code-inputs">
            <input
              v-for="(digit, index) in codeDigits"
              :key="index"
              :ref="el => codeInputRefs[index] = el"
              v-model="codeDigits[index]"
              type="text"
              inputmode="numeric"
              pattern="[0-9]"
              maxlength="1"
              class="code-digit-input"
              :class="{ 
                'filled': codeDigits[index],
                'error': errorMessage && !isConnecting
              }"
              @input="onDigitInput(index, $event)"
              @keydown="onDigitKeydown(index, $event)"
              @paste="onPaste"
              :disabled="isConnecting"
            />
          </div>
          
          <!-- 연결 버튼 -->
          <button 
            @click="connectWithCode" 
            :disabled="!isCodeComplete || isConnecting"
            class="connect-button"
            :class="{ 
              'loading': isConnecting,
              'ready': isCodeComplete && !isConnecting
            }"
          >
            <span v-if="isConnecting" class="loading-spinner"></span>
            <span class="button-text">
              {{ isConnecting ? '연결 중...' : '연결하기' }}
            </span>
          </button>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="error-message-modern">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ errorMessage }}</div>
        </div>

        <!-- 도움말 -->
        <div class="help-section">
          <div class="help-item">
            <span class="help-icon">🔐</span>
            <span class="help-text">사용자가 생성한 6자리 코드를 정확히 입력하세요</span>
          </div>
          <div class="help-item">
            <span class="help-icon">⚡</span>
            <span class="help-text">연결 후 실시간으로 화면을 공유받을 수 있습니다</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2단계: 모니터링 화면 -->
    <div class="monitoring-container" :class="{ 'screen-hidden': !isConnectedToUser }">
      <!-- 상단 헤더 (전체 폭) -->
      <div class="monitoring-header" style="grid-column: 1 / -1;">
        <h2>🖥️ 사용자 모니터링</h2>
        <button @click="disconnectFromUser" class="disconnect-button-header">
          연결 해제
        </button>
      </div>

      <!-- 화면 공유 모니터링 (메인 영역) -->
      <div class="screen-share-section main-video-area">
      <div class="screen-title-container">
        <h3>🖥️ 사용자 화면 모니터링</h3>
        <div v-if="isConnected" class="sharing-status">
          <span class="sharing-dot"></span>
          <span class="sharing-text">공유중</span>
        </div>
      </div>
      <div class="video-container">
        <div class="video-box">
          <h4>사용자 화면</h4>
          
          <!-- 비디오 요소는 항상 존재하되 조건부로 표시 -->
          <video 
            ref="remoteVideo" 
            autoplay 
            playsinline
            class="video-element"
            :style="{ 
              display: shouldShowVideo ? 'block' : 'none',
              opacity: shouldShowVideo ? 1 : 0
            }"
            @loadedmetadata="onVideoLoaded"
            @canplay="onVideoCanPlay"
            @error="onVideoError"
          ></video>
          
          <!-- 화면 공유 대기 중일 때 -->
          <div v-if="!shouldShowVideo" class="waiting-container">
            <div class="waiting-message">
              <h4>사용자 화면 공유 대기 중...</h4>
              <p>사용자가 화면 공유를 시작하면 여기에 표시됩니다</p>
              
              <!-- 디버깅 정보 -->
              <div class="debug-info" style="font-size: 12px; color: #666; margin-top: 10px;">
                <div>WebRTC 연결: {{ isConnected ? '✅' : '❌' }}</div>
                <div>화면 공유: {{ isSharing ? '✅' : '❌' }}</div>
                <div>비디오 스트림: {{ hasVideoStream ? '✅' : '❌' }}</div>
                <div>비디오 표시: {{ shouldShowVideo ? '✅' : '❌' }}</div>
                <div>사용자 연결: {{ isConnectedToUser ? '✅' : '❌' }}</div>
                <div>도움 코드: {{ helpCode || '없음' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- 사이드바 영역 (메시지만) -->
      <div class="sidebar-area">
        <!-- 메시지 전송 -->
        <div class="message-section">
          <h3>💬 메시지 전송</h3>
          <div class="message-input">
            <input 
              v-model="messageText" 
              placeholder="사용자에게 보낼 메시지" 
              class="message-text-input"
            />
            <button @click="sendMessageToUser(messageText)" class="btn-primary">
              메시지 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useWebSocketGuardian } from "@/utils/useWebSocketGuardian";
import { useWebRTC } from "@/utils/useWebRTC";

// 상태 관리
const messageText = ref("");
const helpCode = ref("");
const isConnecting = ref(false);
const isConnectedToUser = ref(false);
const errorMessage = ref("");

// 6자리 코드 분리형 입력
const codeDigits = ref(['', '', '', '', '', '']);
const codeInputRefs = ref([]);

// 코드 완성 여부
const isCodeComplete = computed(() => {
  return codeDigits.value.every(digit => digit !== '') && codeDigits.value.join('').length === 6;
});


// 웹소켓 연결 (초기에는 null로 시작)
const {
  connect,
  disconnect,
  sendMessageToUser,
  guardianMessage,
  client, // 웹소켓 클라이언트 추가
} = useWebSocketGuardian(null); // 초기에는 null

// WebRTC 관련
const remoteVideo = ref(null);

const {
  isSharing,
  isConnected,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  handleEnd,
  remoteVideo: webrtcRemoteVideo,
  updateCode: updateWebRTCCode
} = useWebRTC(null, client); // 초기에는 null

// remoteVideo ref를 WebRTC 유틸리티에 전달  
const setupRemoteVideoRef = () => {
  if (webrtcRemoteVideo && remoteVideo.value) {
    webrtcRemoteVideo.value = remoteVideo.value;
    console.log('✅ GuardianView: remoteVideo ref 설정 완료');
    console.log('📹 비디오 요소:', remoteVideo.value);
    return true;
  } else {
    console.warn('⚠️ GuardianView: remoteVideo ref 설정 실패');
    console.log('📹 webrtcRemoteVideo:', webrtcRemoteVideo);
    console.log('📹 remoteVideo.value:', remoteVideo.value);
    return false;
  }
};

onMounted(() => {
  // DOM이 완전히 렌더링된 후 ref 설정
  setTimeout(() => {
    if (!setupRemoteVideoRef()) {
      // 실패하면 다시 시도
      setTimeout(() => {
        setupRemoteVideoRef();
      }, 500);
    }
  }, 100);
});

// 분리형 코드 입력 처리
const onDigitInput = (index, event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  
  if (value.length > 0) {
    codeDigits.value[index] = value.slice(-1); // 마지막 한 글자만
    
    // 다음 필드로 자동 이동
    if (index < 5) {
      const nextInput = codeInputRefs.value[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  } else {
    codeDigits.value[index] = '';
  }
  
  // helpCode 업데이트
  helpCode.value = codeDigits.value.join('');
  errorMessage.value = '';
};

// 키보드 이벤트 처리
const onDigitKeydown = (index, event) => {
  if (event.key === 'Backspace' && codeDigits.value[index] === '' && index > 0) {
    // 이전 필드로 이동
    const prevInput = codeInputRefs.value[index - 1];
    if (prevInput) {
      prevInput.focus();
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    codeInputRefs.value[index - 1].focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    codeInputRefs.value[index + 1].focus();
  }
};

// 붙여넣기 처리
const onPaste = (event) => {
  event.preventDefault();
  const paste = event.clipboardData.getData('text').replace(/[^0-9]/g, '');
  
  if (paste.length >= 6) {
    for (let i = 0; i < 6; i++) {
      codeDigits.value[i] = paste[i] || '';
    }
    helpCode.value = codeDigits.value.join('');
    
    // 마지막 필드에 포커스
    const lastInput = codeInputRefs.value[5];
    if (lastInput) {
      lastInput.focus();
    }
  }
};

// 연결 상태 텍스트
const getConnectionStatusText = () => {
  if (isConnecting.value) return '사용자와 연결 중...';
  if (isConnectedToUser.value) return '사용자와 연결됨';
  return '연결 대기 중';
};

// 비디오 스트림이 있는지 확인
const hasVideoStream = computed(() => {
  return !!(remoteVideo.value?.srcObject);
});

// 비디오를 표시할지 결정
const shouldShowVideo = computed(() => {
  return isConnectedToUser.value || hasVideoStream.value;
});

// 코드로 연결
const connectWithCode = async () => {
  if (!helpCode.value || helpCode.value.length !== 6) {
    errorMessage.value = '6자리 코드를 정확히 입력해주세요.';
    return;
  }

  try {
    isConnecting.value = true;
    errorMessage.value = '';
    
    console.log('🔗 도움 코드로 연결 시도:', helpCode.value);
    
    // 웹소켓 연결
    await connect(helpCode.value);
    
    // WebRTC 코드 업데이트
    if (updateWebRTCCode) {
      updateWebRTCCode(helpCode.value);
      console.log('🔄 GuardianView WebRTC 코드 업데이트됨:', helpCode.value);
    }
    
    // remoteVideo ref 재설정 (연결 시점에)
    setupRemoteVideoRef();
    
    // 연결 완료 후 사용자에게 연결 알림 전송 (지연 시간 단축)
    setTimeout(() => {
      if (client && client.connected) {
        sendMessageToUser('GUARDIAN_CONNECTED'); // 보호자 연결 신호
        console.log('📤 보호자 연결 알림 전송됨');
        console.log('⏳ 사용자로부터 연결 확인 응답 대기 중...');
      }
    }, 300); // 1000ms → 300ms로 단축
    
    // WebRTC 시그널링 설정
    setupWebRTCSignaling();
    
    // 연결 상태는 사용자로부터 USER_CONNECTION_CONFIRMED를 받을 때까지 false 유지
    isConnectedToUser.value = false;
    console.log('⏳ 사용자 연결 확인 대기 중...');
    
  } catch (error) {
    console.error('❌ 연결 실패:', error);
    errorMessage.value = '연결에 실패했습니다. 코드를 확인해주세요.';
    isConnectedToUser.value = false;
  } finally {
    isConnecting.value = false;
  }
};

// 연결 해제
const disconnectFromUser = () => {
  // 연결 해제 알림 전송
  if (client && client.connected && helpCode.value) {
    sendMessageToUser('GUARDIAN_DISCONNECTED'); // 보호자 연결 해제 신호
    console.log('📤 보호자 연결 해제 알림 전송됨');
  }
  
  setTimeout(() => {
    disconnect();
    isConnectedToUser.value = false;
    helpCode.value = '';
    errorMessage.value = '';
    
    // 분리형 입력 초기화
    codeDigits.value = ['', '', '', '', '', ''];
    
    console.log('🔌 사용자와 연결 해제됨');
  }, 500);
};

// 사용자 메시지 감지하여 연결 상태 업데이트
watch(guardianMessage, (newMessage) => {
  if (newMessage && newMessage.trim()) {
    console.log('📨 GuardianView 사용자 메시지 수신:', newMessage);
    
    // 사용자 연결 확인 응답인지 체크
    if (newMessage === 'USER_CONNECTION_CONFIRMED') {
      console.log('✅ 사용자 연결 확인 응답 수신됨! 이제 연결 상태로 설정');
      isConnectedToUser.value = true;
    } else if (newMessage === 'USER_CONNECTION_CHECK') {
      // 사용자가 보호자 연결 상태를 확인하는 메시지
      console.log('📤 사용자 연결 상태 확인 요청 수신');
      console.log('🔍 현재 연결 상태 확인:', {
        clientConnected: client?.connected,
        hasHelpCode: !!helpCode.value,
        isConnectedToUser: isConnectedToUser.value
      });
      
      // 실제로 사용자와 연결된 상태일 때만 응답
      if (client && client.connected && helpCode.value && isConnectedToUser.value) {
        console.log('✅ 보호자가 실제로 연결된 상태 - 응답 전송');
        // 즉시 응답 전송 (지연 시간 최소화)
        setTimeout(() => {
          client.publish({
            destination: `/app/message/${helpCode.value}`,
            body: 'GUARDIAN_CONNECTION_ALIVE'
          });
          console.log('📤 보호자 연결 상태 응답 전송 완료');
        }, 20); // 50ms → 20ms로 대폭 단축
      } else {
        console.log('❌ 보호자가 연결되지 않은 상태 - 응답하지 않음');
      }
    } else {
      // 실제 사용자 메시지만 연결 상태로 판단 (시스템 메시지 제외)
      if (!isConnectedToUser.value && helpCode.value && 
          !newMessage.startsWith('USER_CONNECTION') && 
          newMessage.trim() !== '') {
        console.log('✅ 실제 사용자 메시지 수신으로 연결 상태 설정:', newMessage);
        isConnectedToUser.value = true;
      }
    }
  }
});

// WebRTC 시그널링 메시지 처리
const setupWebRTCSignaling = () => {
  if (!client) {
    console.log('⚠️ STOMP 클라이언트가 아직 준비되지 않음');
    return;
  }

  // STOMP 연결 상태 확인
  if (!client.connected) {
    console.log('⚠️ STOMP 연결이 아직 완료되지 않음. 2초 후 재시도...');
    setTimeout(() => {
      setupWebRTCSignaling();
    }, 2000);
    return;
  }

  if (!helpCode.value) {
    console.log('⚠️ 도움 코드가 없습니다');
    return;
  }

  console.log('✅ STOMP 연결 확인됨. WebRTC 시그널링 구독 시작...');

  try {
    // Offer 수신 (사용자로부터)
    client.subscribe(`/topic/webrtc/offer/${helpCode.value}`, (message) => {
      console.log('📥 Offer 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'offer') {
        console.log('✅ Offer 타입 확인됨, 처리 시작...');
        handleOffer(new RTCSessionDescription(data));
      } else {
        console.warn('⚠️ 잘못된 Offer 타입:', data.type);
      }
    });

    // ICE 후보 수신
    client.subscribe(`/topic/webrtc/ice/${helpCode.value}`, (message) => {
      console.log('📥 ICE 후보 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'ice-candidate') {
        console.log('✅ ICE 후보 타입 확인됨, 처리 시작...');
        handleIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        console.warn('⚠️ 잘못된 ICE 후보 타입:', data.type);
      }
    });

    // 연결 종료 수신
    client.subscribe(`/topic/webrtc/end/${helpCode.value}`, (message) => {
      console.log('📥 연결 종료 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'end') {
        console.log('✅ 연결 종료 타입 확인됨, 처리 시작...');
        handleEnd();
      } else {
        console.warn('⚠️ 잘못된 연결 종료 타입:', data.type);
      }
    });

    console.log('✅ WebRTC 시그널링 구독 완료');
  } catch (error) {
    console.error('❌ WebRTC 시그널링 구독 실패:', error);
  }
};

// 비디오 이벤트 핸들러
const onVideoLoaded = () => {
  console.log('✅ GuardianView: 비디오 메타데이터 로드됨');
  console.log('📹 비디오 크기:', remoteVideo.value?.videoWidth, 'x', remoteVideo.value?.videoHeight);
  console.log('📹 비디오 스트림:', remoteVideo.value?.srcObject);
  console.log('📹 상태 확인:', {
    isConnected: isConnected.value,
    isSharing: isSharing.value,
    hasVideoStream: hasVideoStream.value,
    shouldShowVideo: shouldShowVideo.value
  });
};

const onVideoCanPlay = () => {
  console.log('✅ GuardianView: 비디오 재생 준비됨');
  console.log('📹 비디오 요소 표시 상태:', window.getComputedStyle(remoteVideo.value).display);
};

const onVideoError = (error) => {
  console.error('❌ GuardianView: 비디오 에러:', error);
};

// WebRTC 상태 감시
watch([isConnected, isSharing], ([connected, sharing]) => {
  console.log('🔄 GuardianView WebRTC 상태 변경:', {
    connected,
    sharing,
    hasVideo: !!remoteVideo.value?.srcObject
  });
});

onMounted(() => {
  // DOM이 완전히 렌더링된 후 ref 설정은 이미 위에서 처리됨
  console.log('🚀 GuardianView 마운트됨');
});
</script>

<style scoped>
/* 전체 컨테이너 */
.guardian-container {
  /* KB국민은행 브랜드 컬러 */
  --kb-yellow-positive: #FFBC00;  /* KB Yellow Positive */
  --kb-yellow-negative: #FFCC00;  /* KB Yellow Negative */
  --kb-gray: #605850;             /* KB Gray */
  --kb-dark-gray: #545049;        /* KB Dark Gray */
  --primary: var(--kb-yellow-positive);
  --primary-light: #FFF4D6;
  --primary-dark: #E6A600;
  --secondary: var(--kb-yellow-negative);
  --accent: var(--kb-gray);
  --accent-light: #F5F4F2;
  
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-light) 0%, #ffffff 50%, var(--accent-light) 100%);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

/* 핵심: CSS로만 화면 전환 */
.screen-hidden {
  display: none !important;
}

/* 1단계: 코드 입력 화면 */
.code-input-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  z-index: 10;
}

.input-screen-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 480px;
  width: 100%;
  text-align: center;
}

/* 헤더 */
.input-header {
  margin-bottom: 40px;
}

.input-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--kb-gray);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.input-subtitle {
  font-size: 16px;
  color: var(--kb-dark-gray);
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

/* 코드 입력 영역 */
.code-input-wrapper {
  margin-bottom: 32px;
}

.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.code-digit-input {
  width: 56px;
  height: 64px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-gray);
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  caret-color: var(--primary);
}

.code-digit-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 188, 0, 0.1);
  transform: scale(1.05);
}

.code-digit-input.filled {
  border-color: var(--primary);
  background: var(--primary-light);
}

.code-digit-input.error {
  border-color: #ef4444;
  background: #fef2f2;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* 연결 버튼 */
.connect-button {
  width: 100%;
  height: 56px;
  background: var(--accent);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(96, 88, 80, 0.2);
}

.connect-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--kb-dark-gray);
  box-shadow: 0 8px 20px rgba(96, 88, 80, 0.3);
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.connect-button.loading {
  background: #9ca3af;
}

.connect-button.ready {
  background: var(--primary);
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.3);
}

.connect-button.ready:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: 0 8px 20px rgba(255, 188, 0, 0.4);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 에러 메시지 (현대적) */
.error-message-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  color: #dc2626;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

/* 도움말 섹션 */
.help-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.help-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.help-text {
  font-size: 14px;
  color: var(--kb-dark-gray);
  line-height: 1.5;
  font-weight: 500;
}

/* 2단계: 모니터링 화면 */
.monitoring-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 3fr 1fr; /* 비디오:메시지 = 3:1 비율로 더 크게 */
  gap: 20px;
  grid-template-rows: auto 1fr;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.monitoring-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-gray);
}

.disconnect-button-header {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disconnect-button-header:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* 메인 비디오 영역 */
.main-video-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 15px; /* 20px → 15px로 줄임 */
  height: fit-content;
  display: flex;
  flex-direction: column;
}

/* 사이드바 영역 */
.sidebar-area {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 20px → 15px로 줄임 */
  height: fit-content;
  justify-content: flex-start; /* 상단 정렬 */
}

/* 모니터링 섹션들 */
.monitoring-section,
.screen-share-section,
.message-section {
  margin: 0;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}


/* 화면 제목 컨테이너 */
.screen-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.screen-title-container h3 {
  margin: 0;
  color: var(--kb-gray);
  font-weight: 700;
  font-size: 20px;
}

/* 공유중 상태 표시 */
.sharing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4; /* 연한 초록 배경 */
  border: 1px solid #16a34a; /* 초록 테두리 */
  border-radius: 20px; /* 둥근 모서리 */
  padding: 6px 12px;
  animation: pulse-green 2s infinite;
}

.sharing-dot {
  width: 8px;
  height: 8px;
  background: #16a34a; /* 초록색 점 */
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

.sharing-text {
  font-size: 14px;
  font-weight: 600;
  color: #15803d; /* 어두운 초록 텍스트 */
}

/* 애니메이션 */
@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.monitoring-section h3,
.message-section h3 {
  margin-top: 0;
  color: var(--kb-gray);
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 16px;
}

/* 비디오 컨테이너 */
.video-container {
  margin: 8px 0; /* 16px → 8px로 줄임 */
  flex: 1; /* 남은 공간 모두 사용 */
}

.video-box {
  background: #000; /* 검은 배경으로 비디오 영역 강조 */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px; /* 20px → 10px로 줄임 */
  text-align: center;
  min-height: 70vh; /* 고정 600px → 뷰포트 높이의 70% */
  max-height: 75vh; /* 최대 높이도 뷰포트 기준 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  overflow: hidden; /* 넘치는 부분 숨김 */
}

.video-box h4 {
  margin: 0;
  color: white; /* 검은 배경에 맞게 흰색으로 변경 */
  font-weight: 600;
  position: absolute;
  top: 15px; /* 20px → 15px */
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  background: rgba(0, 0, 0, 0.7); /* 반투명 검은 배경 */
  padding: 6px 12px; /* 8px 16px → 6px 12px */
  border-radius: 6px; /* 8px → 6px */
  font-size: 14px; /* 크기 줄임 */
}

.video-element {
  width: calc(100% - 10px); /* 패딩 고려한 전체 폭 */
  height: calc(100% - 40px); /* 제목 영역 고려 */
  max-width: none; /* 최대 폭 제한 해제 */
  max-height: none; /* 최대 높이 제한 해제 */
  min-height: calc(70vh - 60px); /* 컨테이너 높이에서 여백 제외 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* 그림자 줄임 */
  object-fit: contain; /* 비율 유지하면서 전체 표시 */
  background: #111; /* 약간 밝은 검은색 */
  margin-top: 30px; /* 제목과의 간격 */
}

.waiting-container {
  text-align: center;
  color: #9ca3af; /* 검은 배경에서 더 잘 보이도록 밝게 */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.waiting-message h4 {
  color: white; /* 검은 배경에 맞게 흰색 */
  margin-bottom: 10px;
}

.waiting-message p {
  color: #d1d5db; /* 약간 어두운 회색 */
  margin-bottom: 15px;
}

.debug-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-info div {
  color: #e5e7eb !important; /* 디버그 정보도 밝게 */
}


/* 메시지 섹션 */
.message-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.message-input input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.1);
}

.message-input button {
  background: var(--primary);
  color: var(--kb-gray);
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-input button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.message-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .monitoring-container {
    grid-template-columns: 1fr; /* 세로 배치로 변경 */
    grid-template-rows: auto auto auto;
  }
  
  .main-video-area {
    order: 1;
  }
  
  .sidebar-area {
    order: 2;
    flex-direction: row;
    gap: 15px;
  }
  
  .sidebar-area > * {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .monitoring-container {
    padding: 10px; /* 15px → 10px */
    gap: 10px; /* 15px → 10px */
  }
  
  .sidebar-area {
    flex-direction: column;
    gap: 10px; /* 15px → 10px */
  }
  
  .video-box {
    min-height: 50vh; /* 300px → 뷰포트 높이의 50% */
    max-height: 60vh;
    padding: 8px; /* 15px → 8px */
  }
  
  .video-element {
    min-height: calc(50vh - 50px); /* 컨테이너에서 여백 제외 */
    margin-top: 25px; /* 30px → 25px */
  }
  
  .main-video-area {
    padding: 10px; /* 15px → 10px */
  }
}
</style>