// src/composables/useTTS.js
// TTS 핵심 로직

import { ref, computed } from 'vue';
import { TTS_MESSAGES, TTS_CONFIG } from '@/constants/ttsMessages';

// 전역 상태 (앱 전체에서 공유)
const isEnabled = ref(localStorage.getItem('tts-enabled') !== 'false');
const isReading = ref(false);
const currentUtterance = ref(null);
const voices = ref([]);
const selectedVoice = ref(null);

export function useTTS() {
  // 음성 목록 로드
  const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices();
    // 한국어 음성 우선 선택
    selectedVoice.value =
      voices.value.find(
        (voice) => voice.lang.includes('ko') || voice.lang.includes('KR')
      ) || voices.value[0];
  };

  // 브라우저 지원 여부 확인
  const isSupported = computed(() => 'speechSynthesis' in window);

  // 메인 TTS 함수
  const speak = (category, messageKey, params = {}) => {
    if (!isSupported.value || !isEnabled.value) {
      console.log('TTS 비활성화 또는 미지원');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // 메시지 가져오기
        let message = TTS_MESSAGES[category]?.[messageKey];
        if (!message) {
          console.warn(`TTS 메시지를 찾을 수 없음: ${category}.${messageKey}`);
          resolve();
          return;
        }

        // 동적 메시지 처리 (함수인 경우)
        if (typeof message === 'function') {
          message = message(...Object.values(params));
        }

        // 설정 가져오기
        const config = TTS_CONFIG[category] || TTS_CONFIG.HELP;

        // 높은 우선순위 메시지는 기존 TTS 중단
        if (config.priority <= 2 && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // 음성 생성
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        utterance.rate = config.rate;
        utterance.volume = config.volume;
        utterance.voice = selectedVoice.value;

        // 이벤트 리스너
        utterance.onstart = () => {
          isReading.value = true;
          console.log('TTS 시작:', message);
        };

        utterance.onend = () => {
          isReading.value = false;
          currentUtterance.value = null;
          resolve();
        };

        utterance.onerror = (error) => {
          isReading.value = false;
          console.error('TTS 오류:', error);
          reject(error);
        };

        // TTS 실행
        currentUtterance.value = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('TTS 처리 오류:', error);
        reject(error);
      }
    });
  };

  // TTS 중지
  const stop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    isReading.value = false;
    currentUtterance.value = null;
  };

  // TTS 토글
  const toggle = () => {
    isEnabled.value = !isEnabled.value;
    localStorage.setItem('tts-enabled', isEnabled.value.toString());

    if (!isEnabled.value) {
      stop();
    }

    console.log('TTS 상태:', isEnabled.value ? '활성화' : '비활성화');
  };

  // 시간 기반 경고 체크
  const checkTimeBasedWarnings = () => {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());

    if (hour >= 22 || hour <= 6) {
      speak('SECURITY', 'NIGHT_WARNING');
    } else if (isWeekend) {
      speak('SECURITY', 'WEEKEND_WARNING');
    }
  };

  // 편의 함수들
  const speakSecurityWarning = (type, params = {}) =>
    speak('SECURITY', type, params);
  const speakTransferStep = (type, params = {}) =>
    speak('TRANSFER', type, params);
  const speakHelpMessage = (type, params = {}) => speak('HELP', type, params);
  const speakError = (type, params = {}) => speak('ERROR', type, params);

  // 음성 로드 (컴포저블 초기화 시)
  if (isSupported.value) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  return {
    // 상태
    isSupported,
    isEnabled,
    isReading,
    voices,
    selectedVoice,

    // 메인 함수들
    speak,
    stop,
    toggle,
    checkTimeBasedWarnings,

    // 편의 함수들
    speakSecurityWarning,
    speakTransferStep,
    speakHelpMessage,
    speakError,
  };
}
