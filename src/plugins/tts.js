// src/plugins/tts.js
// TTS 플러그인 - Vue 앱에 TTS 기능을 전역으로 등록

import { useTTS } from '@/composables/useTTS';

export default {
  install(app) {
    const tts = useTTS();

    // 전역 속성으로 등록 (this.$tts로 접근 가능)
    app.config.globalProperties.$tts = tts;

    // provide/inject로 등록 (inject('tts')로 접근 가능)
    app.provide('tts', tts);

    // 전역 TTS 디렉티브 등록
    app.directive('tts', {
      mounted(el, binding) {
        const { value, modifiers, arg } = binding;

        // v-tts.auto - 화면 진입 시 자동 재생
        if (modifiers.auto) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const category = arg || 'ONBOARDING';
                  const messageKey = value || 'WELCOME_BACK';
                  tts.speak(category, messageKey);
                  observer.unobserve(el); // 한 번만 실행
                }
              });
            },
            { threshold: 0.5 }
          );
          observer.observe(el);
        }

        // v-tts.click - 클릭 시 재생
        if (modifiers.click || (!modifiers.auto && !modifiers.focus)) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => {
            const category = arg || 'ONBOARDING';
            const messageKey = value || 'WELCOME_BACK';
            tts.speak(category, messageKey);
          });
        }

        // v-tts.focus - 포커스 시 재생 (입력 필드용)
        if (modifiers.focus) {
          el.addEventListener('focus', () => {
            const category = arg || 'TRANSFER';
            const messageKey = value || 'ACCOUNT_INPUT';
            tts.speak(category, messageKey);
          });
        }
      },
    });

    // 전역 mixin으로 편의 메서드 추가
    app.mixin({
      methods: {
        // 보안 경고 TTS
        $speakSecurityWarning(type, params = {}) {
          return this.$tts.speak('SECURITY', type, params);
        },

        // 송금 단계 TTS
        $speakTransferStep(type, params = {}) {
          return this.$tts.speak('TRANSFER', type, params);
        },

        // 오류 메시지 TTS
        $speakError(type, params = {}) {
          return this.$tts.speak('ERROR', type, params);
        },

        // 도움 메시지 TTS
        $speakHelp(type, params = {}) {
          return this.$tts.speak('HELP', type, params);
        },
      },
    });

    console.log('✅ TTS 플러그인이 등록되었습니다.');
  },
};
