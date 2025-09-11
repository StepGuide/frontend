// src/constants/ttsMessages.js
// TTS 메시지 상수 정의

export const TTS_MESSAGES = {
  // 보안/위험 관련 (최우선)
  SECURITY: {
    FRAUD_ACCOUNT:
      '위험한 계좌입니다. 사기로 신고된 계좌이므로 절대 송금하지 마세요.',
    HIGH_RISK:
      '위험한 거래로 감지되었습니다. 송금을 중단하고 가족에게 먼저 확인해보세요.',
    MEDIUM_RISK: '평소보다 큰 금액입니다. 정말 송금하시겠습니까?',
    NIGHT_WARNING:
      '밤 늦은 시간입니다. 급하게 송금하라는 전화나 문자를 받으셨나요? 사기일 수 있으니 가족에게 먼저 확인해보세요.',
    WEEKEND_WARNING:
      '은행 업무시간이 아닙니다. 서두를 필요가 없으니 천천히 확인하고 진행하세요.',
  },

  // 송금 핵심 단계
  TRANSFER: {
    STEP_START: (step) => `${step} 단계를 시작합니다.`,
    ACCOUNT_INPUT: '받는 분의 계좌번호를 입력해주세요.',
    AMOUNT_INPUT: '송금할 금액을 입력해주세요.',
    FINAL_CONFIRM: (bank, account, amount) =>
      `${bank} ${account}번 계좌로 ${amount.toLocaleString()}원을 송금합니다. 정말 진행하시겠습니까?`,
    SUCCESS: '송금이 완료되었습니다.',
    FAILED: '송금에 실패했습니다. 다시 시도해주세요.',
  },

  // 도움/원격동행 기능
  HELP: {
    CODE_GENERATED: (code) =>
      `도움코드 ${code}가 생성되었습니다. 보호자에게 이 번호를 알려주세요.`,
    GUARDIAN_CONNECTED: '보호자가 연결되었습니다. 이제 안전하게 진행하세요.',
    GUARDIAN_DISCONNECTED: '보호자 연결이 끊어졌습니다.',
  },

  // 교육/튜토리얼
  EDUCATION: {
    LESSON_START: (topic) => `${topic} 학습을 시작합니다. 천천히 따라해보세요.`,
    LESSON_COMPLETE: '축하합니다! 이 과정을 모두 마쳤습니다.',
    QUIZ_CORRECT: '정답입니다! 잘 기억해두세요.',
    QUIZ_WRONG: '다시 한번 생각해보세요.',
  },

  // 첫 사용자 온보딩
  ONBOARDING: {
    FIRST_VISIT: '안전금융 서비스에 처음 오셨군요. 천천히 둘러보세요.',
    WELCOME_BACK: '다시 오셨군요. 오늘도 안전하게 이용하세요.',
  },

  // 오류 메시지
  ERROR: {
    INVALID_ACCOUNT: '계좌번호를 정확히 입력해주세요.',
    INVALID_AMOUNT: '금액을 올바르게 입력해주세요.',
    NETWORK_ERROR: '연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
    INSUFFICIENT_BALANCE: '잔액이 부족합니다.',
  },

  // 스마트 피드백
  SMART_FEEDBACK: {
    FREQUENT_ACCOUNT: '자주 사용하는 안전한 계좌입니다.',
    NEW_ACCOUNT:
      '처음 송금하는 계좌입니다. 계좌번호와 예금주명을 다시 한번 확인해주세요.',
    LARGE_AMOUNT: '평소보다 큰 금액입니다. 정말 필요한 송금인가요?',
    BALANCE_LOW: '계좌 잔액이 얼마 남지 않았습니다. 신중하게 결정해주세요.',
  },

  // 보호자 상태 (GuardianView용)
  GUARDIAN_STATUS: {
    CONNECTION_SUCCESS:
      '사용자의 화면에 연결되었습니다. 지금부터 함께 볼 수 있어요.',
    USER_STEP_CHANGE: (step) => `사용자가 ${step} 단계로 이동했습니다.`,
    RISK_DETECTED: '위험한 거래가 감지되었습니다! 즉시 사용자에게 확인하세요.',
  },

  // 메인페이지 소개 및 환영 메시지 (강화)
  MAIN_INTRO: {
    SERVICE_OVERVIEW:
      'KB 금융 도우미에 오신 것을 환영합니다. 이 서비스는 어르신들이 안전하고 쉽게 금융거래를 할 수 있도록 도와드립니다.',

    FEATURES_INTRO:
      '주요 기능을 소개해드리겠습니다. 이체하기, 계좌 조회, 그리고 보호자와 함께하는 도움 요청 기능이 있습니다.',

    HELP_GUIDE:
      '화면 중앙의 도움 요청 버튼을 통해 보호자나 전문가와 함께 안전하게 진행할 수 있습니다.',

    SAFETY_REMINDER:
      '의심스러운 거래가 감지되면 자동으로 알려드리고 차단해드립니다.',

    FIRST_TIME_GUIDE:
      '연습 모드에서는 실제 돈이 움직이지 않으니 안심하고 연습하실 수 있습니다.',

    TIME_BASED_WELCOME: (hour) => {
      if (hour < 12)
        return '좋은 아침입니다. 오늘도 안전한 KB 금융 도우미와 함께 하세요.';
      if (hour < 18)
        return '안녕하세요. 오늘 오후도 안전하게 금융 서비스를 이용하세요.';
      return '안녕하세요. 저녁 시간에도 안전하게 서비스를 이용하실 수 있습니다.';
    },

    WELCOME_BACK_DETAILED:
      '다시 오셨군요. 오늘은 어떤 업무를 도와드릴까요?',
  },

  // 서비스 안내 메시지 (상세화)
  SERVICE_GUIDE: {
    TRANSFER_INFO:
      '이체하기를 선택하시면 안전한 계좌이체를 할 수 있습니다.',

    PRACTICE_INFO:
      '연습 모드에서는 실제 돈이 아닌 가상 자산으로 연습할 수 있습니다.',

    ACCOUNT_INFO:
      '계좌 현황에서는 잔액과 최근 거래 내역을 확인할 수 있습니다. ',

    EDUCATION_INFO:
      '금융교육에서는 금융 사기 예방법과 안전한 금융 이용법을 배울 수 있습니다.',

    SECURITY_INFO:
      '보안설정에서는 비밀번호 변경이나 알림 설정을 관리하실 수 있어요.',

    FAVORITES_INFO:
      '자주 송금하는 계좌를 즐겨찾기에 등록하시면 다음부터 빠르고 이체할 수 있습니다.',

    GUARDIAN_MODE_INFO:
      '보호자 모드로 전환하면 도움이 필요한 분의 화면을 함께 보면서 안내해드릴 수 있습니다.',
  },

  // 도움말 메시지 (구체화)
  HELP_GUIDE: {
    HOW_TO_USE:
      '화면의 버튼들을 천천히 눌러보세요. 각 기능에 대한 음성 설명을 들을 수 있습니다. ',

    VOICE_CONTROL:
      '음성 안내가 필요하시면 화면 우측 상단의 스피커 모양 버튼을 눌러주세요.',

    GUARDIAN_HELP:
      '혼자 하기 어려우시면 도움 요청 버튼을 누르세요. 6자리 숫자가 나오면 보호자에게 알려주시면 됩니다.',

    EMERGENCY_STOP:
      '언제든 위험하다고 느끼시거나 실수했다고 생각되시면 거래를 중단할 수 있습니다.',

    STEP_BY_STEP:
      '모든 과정은 단계별로 차근차근 안내해드립니다.',
  },

  // 인터랙션 안내 메시지
  INTERACTION_GUIDE: {
    BUTTON_HOVER: '이 버튼을 클릭하시면 해당 기능을 이용할 수 있습니다.',
    CARD_FOCUS: '이 카드를 선택하시면 상세 정보를 볼 수 있습니다.',
    INPUT_FOCUS: '여기에 필요한 정보를 입력해주세요.',
    SCROLL_GUIDE: '화면을 위아래로 움직여서 더 많은 내용을 볼 수 있습니다.',
  },

  // 성공/완료 메시지
  SUCCESS_MESSAGES: {
    FIRST_LOGIN_COMPLETE:
      '첫 로그인이 완료되었습니다. 이제 안전하게 금융 서비스를 이용하실 수 있습니다.',
    HELP_CODE_SHARED:
      '도움 코드가 보호자에게 전달되었습니다.',
    SAFE_TRANSACTION: '안전한 거래가 확인되었습니다.',
    TUTORIAL_COMPLETE:
      '연습이 완료되었습니다. 이제 실제 거래를 안전하게 하실 수 있어요.',
  },

  // 시간 기반 특별 안내
  TIME_BASED_GUIDE: {
    MORNING_GREETING:
      '하루를 시작하기 전에 계좌 상황을 점검해보세요.',
    LUNCH_TIME: '점심시간이네요. 급하지 않은 거래는 나중에 하셔도 됩니다.',
    EVENING_CAUTION:
      '늦은 시간의 급한 송금 요청은 사기일 수 있으니 주의하세요.',
    WEEKEND_NOTICE:
      '주말에는 은행 업무가 제한됩니다.',
  },

  // 접근성 안내
  ACCESSIBILITY_GUIDE: {
    FONT_SIZE:
      '글씨가 작아서 잘 안 보이시면 화면을 두 손가락으로 벌려서 크게 만들 수 있습니다.',
    VOICE_SPEED: '음성이 너무 빠르면 설정에서 속도를 조절할 수 있습니다.',
    HIGH_CONTRAST: '화면이 잘 안 보이시면 고대비 모드로 변경할 수 있습니다.',
    REPEAT_MESSAGE:
      '안내를 다시 듣고 싶으시면 스피커 버튼을 다시 눌러주세요.',
  },
};

// TTS 설정별 음성 옵션
export const TTS_CONFIG = {
  SECURITY: { rate: 0.6, volume: 1.0, priority: 1 }, // 가장 느리고 크게
  TRANSFER: { rate: 0.7, volume: 0.9, priority: 2 }, // 중간 속도
  HELP: { rate: 0.8, volume: 0.8, priority: 3 }, // 일반 속도
  EDUCATION: { rate: 0.8, volume: 0.9, priority: 3 },
  ONBOARDING: { rate: 0.7, volume: 1.0, priority: 2 },
  ERROR: { rate: 0.6, volume: 0.9, priority: 2 },
  SMART_FEEDBACK: { rate: 0.7, volume: 0.9, priority: 2 },
  GUARDIAN_STATUS: { rate: 0.8, volume: 0.8, priority: 2 },

  // 새로 추가된 설정들
  MAIN_INTRO: { rate: 0.7, volume: 1.0, priority: 1 }, // 환영 메시지는 또렷하게
  SERVICE_GUIDE: { rate: 0.8, volume: 0.9, priority: 2 }, // 서비스 안내
  INTERACTION_GUIDE: { rate: 0.8, volume: 0.8, priority: 3 }, // 인터랙션 안내
  SUCCESS_MESSAGES: { rate: 0.7, volume: 0.9, priority: 2 }, // 성공 메시지
  TIME_BASED_GUIDE: { rate: 0.8, volume: 0.9, priority: 2 }, // 시간 기반 안내
  ACCESSIBILITY_GUIDE: { rate: 0.6, volume: 1.0, priority: 1 }, // 접근성 안내는 천천히
  HELP_GUIDE: { rate: 0.7, volume: 0.9, priority: 2 }, // 도움말 안내
};
