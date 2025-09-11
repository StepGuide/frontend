<!-- src/components/common/TTSController.vue -->
<!-- 전역 TTS 컨트롤러 컴포넌트 -->

<template>
  <div class="tts-controller">
    <!-- 설정 버튼 (위쪽에 위치) -->
    <button
      @click="showSettings = !showSettings"
      class="settings-btn"
      title="TTS 설정"
      v-if="tts.isEnabled.value"
    >
      ⚙️
    </button>

    <!-- TTS 설정 패널 (확장 가능) -->
    <div v-if="showSettings" class="tts-settings">
      <h4>음성 설정</h4>

      <!-- 음성 선택 -->
      <div class="setting-item">
        <label>음성 선택:</label>
        <select v-model="tts.selectedVoice.value">
          <option
            v-for="voice in koreanVoices"
            :key="voice.name"
            :value="voice"
          >
            {{ voice.name }}
          </option>
        </select>
      </div>

      <!-- 테스트 버튼 -->
      <button @click="testTTS" class="test-btn">음성 테스트</button>
    </div>

    <!-- TTS 상태 표시 (읽는 중일 때만) -->
    <div v-if="tts.isReading.value" class="tts-status">
      <div class="reading-indicator">
        <span class="reading-dot"></span>
        <span class="reading-text">음성 안내 중</span>
      </div>

      <!-- 중지 버튼 -->
      <button @click="tts.stop()" class="stop-btn" title="음성 중지">⏹️</button>
    </div>

    <!-- TTS 토글 버튼 (맨 아래) -->
    <button
      @click="tts.toggle()"
      :class="['tts-toggle-btn', { active: tts.isEnabled.value }]"
      :title="tts.isEnabled.value ? 'TTS 끄기' : 'TTS 켜기'"
    >
      <span class="tts-icon">{{ tts.isEnabled.value ? '🔊' : '🔇' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTTS } from '@/composables/useTTS';

const tts = useTTS();
const showSettings = ref(false);

// 한국어 음성만 필터링
const koreanVoices = computed(() => {
  return tts.voices.value.filter(
    (voice) => voice.lang.includes('ko') || voice.lang.includes('KR')
  );
});

// TTS 테스트
const testTTS = () => {
  tts.speak('ONBOARDING', 'WELCOME_BACK');
};
</script>

<style scoped>
.tts-controller {
  position: fixed;
  bottom: 100px; /* FloatingChat 위에 위치 (FloatingChat은 30px) */
  right: 30px; /* FloatingChat과 같은 위치 */
  z-index: 1001; /* FloatingChat(1000)보다 위에 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* TTS 토글 버튼 */
.tts-toggle-btn {
  width: 60px; /* FloatingChat과 같은 크기 */
  height: 60px;
  border-radius: 50%;
  border: none;
  background: #FFBC00; /* FloatingChat과 같은 색상 */
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(255, 188, 0, 0.4); /* FloatingChat과 같은 그림자 */
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tts-toggle-btn:hover {
  transform: scale(1.1); /* FloatingChat과 같은 호버 효과 */
  box-shadow: 0 6px 25px rgba(255, 188, 0, 0.6);
}

.tts-toggle-btn.active {
  background: #e6a600; /* 더 진한 노란색 */
  color: white;
}

.tts-icon {
  font-size: 24px; /* FloatingChat과 같은 아이콘 크기 */
  color: white;
}

/* TTS 상태 표시 */
.tts-status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
}

.reading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reading-dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.reading-text {
  color: #333;
}

.stop-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.stop-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 설정 패널 */
.tts-settings {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  margin-bottom: 8px; /* 위쪽에 위치하므로 margin-top 대신 margin-bottom 사용 */
  order: -1; /* 설정 버튼 바로 아래에 위치하도록 */
}

.tts-settings h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.setting-item {
  margin-bottom: 12px;
}

.setting-item label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.setting-item select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
}

.test-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.test-btn:hover {
  background: #1976d2;
}

.settings-btn {
  width: 48px; /* 크기 증가 */
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 18px; /* 아이콘 크기 증가 */
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover {
  transform: scale(1.1); /* FloatingChat과 같은 호버 효과 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .tts-controller {
    bottom: 90px; /* 모바일에서 FloatingChat 위에 위치 */
    right: 24px; /* FloatingChat과 같은 위치 */
  }

  .tts-toggle-btn {
    width: 56px; /* FloatingChat과 같은 크기 */
    height: 56px;
  }

  .tts-icon {
    font-size: 22px; /* FloatingChat과 같은 아이콘 크기 */
  }

  .tts-settings {
    min-width: 180px;
  }

  .settings-btn {
    width: 44px; /* 모바일에서 약간 작게 */
    height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .tts-controller {
    bottom: 80px; /* 작은 화면에서 FloatingChat 위에 위치 */
    right: 20px; /* FloatingChat과 같은 위치 */
  }

  .tts-toggle-btn {
    width: 56px;
    height: 56px;
  }

  .tts-icon {
    font-size: 22px;
  }

  .settings-btn {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
}
</style>
