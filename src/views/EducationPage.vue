<template>
  <div class="education-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">금융교육</span>
        </div>
        <div class="nav-actions">
          <button class="help-btn" @click="requestHelp">
            <span class="help-icon">❓</span>
            <span class="help-text">도움</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 환영 섹션 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">안전한 금융 생활을 위한 교육</h1>
          <p class="welcome-subtitle">
            금융 지식을 쌓고 안전하게 금융 서비스를 이용해보세요
          </p>
        </div>
        <div class="progress-card">
          <div class="progress-header">
            <h3>학습 진도</h3>
            <span class="progress-percentage">{{ learningProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: learningProgress + '%' }"
            ></div>
          </div>
          <p class="progress-text">{{ completedLessons }}개 강의 완료</p>
        </div>
      </div>

      <!-- 교육 카테고리 -->
      <div class="education-categories">
        <div class="section-header">
          <h2>교육 카테고리</h2>
        </div>
        <div class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <div class="category-progress">
              <span>{{ category.completed }}/{{ category.total }} 완료</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택된 카테고리의 강의 목록 -->
      <div v-if="selectedCategory" class="lessons-section">
        <div class="section-header">
          <h2>{{ getCategoryName(selectedCategory) }} 강의</h2>
          <button class="view-all-btn" @click="viewAllLessons">전체보기</button>
        </div>
        <div class="lessons-grid">
          <div
            v-for="lesson in getLessonsByCategory(selectedCategory)"
            :key="lesson.id"
            class="lesson-card"
            :class="{ completed: lesson.completed, locked: lesson.locked }"
            @click="startLesson(lesson)"
          >
            <div class="lesson-header">
              <div class="lesson-icon">{{ lesson.icon }}</div>
              <div class="lesson-status">
                <span v-if="lesson.completed" class="status-badge completed"
                  >완료</span
                >
                <span v-else-if="lesson.locked" class="status-badge locked"
                  >잠김</span
                >
                <span v-else class="status-badge available">시작가능</span>
              </div>
            </div>
            <div class="lesson-content">
              <h3>{{ lesson.title }}</h3>
              <p>{{ lesson.description }}</p>
              <div class="lesson-meta">
                <span class="lesson-duration">⏱️ {{ lesson.duration }}분</span>
                <span class="lesson-level">{{ lesson.level }}</span>
              </div>
            </div>
            <div class="lesson-progress" v-if="!lesson.locked">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: lesson.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ lesson.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 강의 모달 -->
      <div
        v-if="isLessonOpen"
        class="lesson-modal-overlay"
        @click.self="closeLesson"
      >
        <div class="lesson-modal">
          <div class="lesson-modal-header">
            <h3 class="lesson-modal-title">{{ selectedLesson?.title }}</h3>
            <button class="lesson-close-btn" @click="closeLesson">✕</button>
          </div>

          <div class="lesson-modal-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: showTableOfContents
                    ? '0%'
                    : (lessonContentSteps.length > 1
                        ? (currentStepIndex / (lessonContentSteps.length - 1)) * 100
                        : (lessonContentSteps.length === 1 ? 100 : 0)) + '%',
                }"
              ></div>
            </div>
            <div class="lesson-step-indicator">
              <span v-if="showTableOfContents">
                학습 내용 안내
              </span>
              <span v-else>
                {{ currentStepIndex + 1 }} / {{ lessonContentSteps.length }} 단계
              </span>
            </div>
          </div>

          <div
            class="lesson-modal-body"
            v-if="!isQuizMode && (showTableOfContents || lessonContentSteps.length)"
          >
            <!-- 학습 내용 설명 표시 (단일 카드) -->
            <div v-if="showTableOfContents" class="lesson-description single-card">
              <!-- <h4 class="lesson-step-title">
                {{ lessonDescriptionTitle }}
              </h4> -->
              <p class="lesson-step-content">
                {{ lessonDescriptionIntro }}
              </p>
              <ul class="learning-points-list">
                <li 
                  v-for="point in learningPoints" 
                  :key="point.number"
                  class="learning-point-list-item"
                >
                  <div class="learning-point-list-row">
                    <span class="learning-point-number">{{ point.number }}</span>
                    <span class="learning-point-title">{{ point.title }}</span>
                  </div>
                  <p class="learning-point-description">{{ point.description }}</p>
                </li>
              </ul>
            </div>
            <!-- 일반 강의 내용 표시 -->
            <div v-else>
              <div class="lesson-step-header">
                <h4 class="lesson-step-title">
                  {{ lessonContentSteps[currentStepIndex].title }}
                </h4>
                <div class="lesson-step-badges">
                  <span class="badge badge-key">핵심 개념</span>
                  <span class="badge badge-easy">쉬운 예시</span>
                </div>
              </div>
              <p class="lesson-step-content">
                {{ lessonContentSteps[currentStepIndex].content }}
              </p>
            </div>
          </div>

          <div class="lesson-modal-body" v-else>
            <h4>이해도 점검 문제</h4>
            <div class="quiz-group">
              <div
                v-for="(q, idx) in quizQuestions"
                :key="idx"
                class="quiz-item"
              >
                <div class="quiz-question">{{ idx + 1 }}. {{ q.question }}</div>
                <div class="quiz-options">
                  <label
                    v-for="(opt, oidx) in q.options"
                    :key="oidx"
                    class="quiz-option"
                  >
                    <input
                      type="radio"
                      :name="'q' + idx"
                      :value="opt"
                      v-model="quizAnswers[idx]"
                      :disabled="quizSubmitted"
                    />
                    <span>{{ opt }}</span>
                  </label>
                </div>
                <div
                  v-if="quizSubmitted"
                  class="quiz-feedback"
                  :class="{
                    correct: quizIsCorrect(idx),
                    wrong: !quizIsCorrect(idx),
                  }"
                >
                  {{
                    quizIsCorrect(idx)
                      ? '정답입니다.'
                      : '오답입니다. 정답: ' + q.answer
                  }}
                </div>
              </div>
            </div>
            <div v-if="quizSubmitted" class="quiz-result">
              점수: {{ quizScore }} / {{ quizQuestions.length }}
            </div>
          </div>

          <div class="lesson-modal-footer">
            <button
              class="btn-secondary"
              @click="prevStep"
              :disabled="isQuizMode ? true : currentStepIndex === 0"
            >
              이전
            </button>
            <button
              v-if="!isQuizMode && (showTableOfContents || currentStepIndex < lessonContentSteps.length - 1)"
              class="btn-primary"
              @click="nextStep"
            >
              다음
            </button>
            <button
              v-else-if="!isQuizMode && !showTableOfContents && currentStepIndex === lessonContentSteps.length - 1"
              class="btn-primary"
              @click="startQuiz"
            >
              문제 풀기
            </button>
            <button
              v-else-if="isQuizMode && !quizSubmitted"
              class="btn-primary"
              @click="submitQuiz"
            >
              제출
            </button>
            <button v-else class="btn-primary" @click="completeLesson">
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 반응형 데이터
const selectedCategory = ref(null);
const learningProgress = ref(35);
const completedLessons = ref(7);

// 교육 카테고리
const categories = ref([
  {
    id: 'basic',
    name: '기초 금융',
    description: '금융의 기본 개념과 용어',
    icon: '💰',
    completed: 3,
    total: 5,
  },
  {
    id: 'security',
    name: '보안 교육',
    description: '안전한 금융 서비스 이용법',
    icon: '🔒',
    completed: 2,
    total: 4,
  },
  {
    id: 'phishing',
    name: '피싱 방지',
    description: '피싱 사기 예방 및 대응법',
    icon: '🛡️',
    completed: 1,
    total: 3,
  },
  {
    id: 'digital',
    name: '디지털 금융',
    description: '모바일뱅킹과 온라인 금융',
    icon: '📱',
    completed: 1,
    total: 6,
  },
]);

// 강의 데이터
const lessons = ref([
  // 기초 금융
  {
    id: 1,
    category: 'basic',
    title: '금융이란 무엇인가?',
    description: '금융이 무엇인지에 대해서 배워요.',
    icon: '💡',
    duration: 15,
    level: '초급',
    progress: 100,
    completed: true,
    locked: false,
  },
  {
    id: 2,
    category: 'basic',
    title: '은행의 역할과 기능',
    description: '은행이 하는 일과 금융 서비스에 대해 학습합니다.',
    icon: '🏦',
    duration: 20,
    level: '초급',
    progress: 80,
    completed: false,
    locked: false,
  },
  {
    id: 3,
    category: 'basic',
    title: '이자와 수익률 이해하기',
    description: '이자 계산법과 수익률의 개념을 배웁니다.',
    icon: '📊',
    duration: 25,
    level: '중급',
    progress: 0,
    completed: false,
    locked: false,
  },
  {
    id: 4,
    category: 'basic',
    title: '신용과 신용등급',
    description: '신용의 중요성과 신용등급 관리법을 학습합니다.',
    icon: '⭐',
    duration: 30,
    level: '중급',
    progress: 0,
    completed: false,
    locked: true,
  },
  {
    id: 5,
    category: 'basic',
    title: '투자와 저축의 차이',
    description: '투자와 저축의 차이점과 각각의 장단점을 알아봅니다.',
    icon: '📈',
    duration: 35,
    level: '고급',
    progress: 0,
    completed: false,
    locked: true,
  },
  // 보안 교육
  {
    id: 6,
    category: 'security',
    title: '안전한 비밀번호 만들기',
    description: '강력한 비밀번호 생성법과 관리 방법을 학습합니다.',
    icon: '🔐',
    duration: 10,
    level: '초급',
    progress: 100,
    completed: true,
    locked: false,
  },
  {
    id: 7,
    category: 'security',
    title: '2단계 인증 설정하기',
    description: '2단계 인증의 중요성과 설정 방법을 알아봅니다.',
    icon: '🔑',
    duration: 15,
    level: '초급',
    progress: 60,
    completed: false,
    locked: false,
  },
  {
    id: 8,
    category: 'security',
    title: '공용 Wi-Fi 사용 시 주의사항',
    description: '공용 네트워크에서의 보안 위험과 대응법을 학습합니다.',
    icon: '📶',
    duration: 20,
    level: '중급',
    progress: 0,
    completed: false,
    locked: false,
  },
  {
    id: 9,
    category: 'security',
    title: '금융 앱 보안 설정',
    description: '모바일 금융 앱의 보안 설정과 주의사항을 알아봅니다.',
    icon: '📱',
    duration: 25,
    level: '중급',
    progress: 0,
    completed: false,
    locked: true,
  },
  // 피싱 방지
  {
    id: 10,
    category: 'phishing',
    title: '피싱이란 무엇인가?',
    description: '피싱 사기의 개념과 유형에 대해 알아봅니다.',
    icon: '🎣',
    duration: 15,
    level: '초급',
    progress: 100,
    completed: true,
    locked: false,
  },
  {
    id: 11,
    category: 'phishing',
    title: '피싱 메일 식별하기',
    description: '피싱 메일의 특징과 식별 방법을 학습합니다.',
    icon: '📧',
    duration: 20,
    level: '초급',
    progress: 0,
    completed: false,
    locked: false,
  },
  {
    id: 12,
    category: 'phishing',
    title: '피싱 사이트 구별하기',
    description: '가짜 금융 사이트를 구별하는 방법을 알아봅니다.',
    icon: '🌐',
    duration: 25,
    level: '중급',
    progress: 0,
    completed: false,
    locked: true,
  },
  // 디지털 금융
  {
    id: 13,
    category: 'digital',
    title: '모바일뱅킹 시작하기',
    description: '모바일뱅킹 앱 설치와 기본 사용법을 학습합니다.',
    icon: '📱',
    duration: 20,
    level: '초급',
    progress: 0,
    completed: false,
    locked: false,
  },
  {
    id: 14,
    category: 'digital',
    title: 'QR코드 결제 방법',
    description: 'QR코드를 이용한 간편 결제 방법을 알아봅니다.',
    icon: '📱',
    duration: 15,
    level: '초급',
    progress: 0,
    completed: false,
    locked: true,
  },
  {
    id: 15,
    category: 'digital',
    title: '온라인 계좌이체',
    description: '안전한 온라인 계좌이체 방법을 학습합니다.',
    icon: '💸',
    duration: 25,
    level: '중급',
    progress: 0,
    completed: false,
    locked: true,
  },
]);

// 추천 강의/최근 학습 기록 제거됨

// 메서드
const goBack = () => router.push('/');

const selectCategory = (categoryId) => {
  selectedCategory.value =
    selectedCategory.value === categoryId ? null : categoryId;
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find((c) => c.id === categoryId);
  return category ? category.name : '';
};

const getLessonsByCategory = (categoryId) => {
  return lessons.value.filter((lesson) => lesson.category === categoryId);
};

const startLesson = (lesson) => {
  if (lesson.locked) {
    alert('이전 강의를 완료해야 수강할 수 있습니다.');
    return;
  }
  selectedLesson.value = lesson;
  const split = getLessonContentSplit(lesson);
  lessonContentSteps.value = split.contentSteps;
  lessonDescriptionTitle.value = split.descriptionTitle;
  lessonDescriptionIntro.value = split.descriptionIntro;
  learningPoints.value = split.learningPoints;
  currentStepIndex.value = 0; // 목차부터 시작
  showTableOfContents.value = true; // 목차 표시 활성화
  isLessonOpen.value = true;
};

const viewAllLessons = () => {
  alert('전체 강의 목록을 보여줍니다.');
};

const requestHelp = () => router.push('/');

// 강의 모달 상태 및 동작
const isLessonOpen = ref(false);
const selectedLesson = ref(null);
const lessonContentSteps = ref([]);
const lessonDescriptionTitle = ref('');
const lessonDescriptionIntro = ref('');
const learningPoints = ref([]);
const currentStepIndex = ref(0);
const showTableOfContents = ref(true);

const closeLesson = () => {
  isLessonOpen.value = false;
  selectedLesson.value = null;
  lessonContentSteps.value = [];
  lessonDescriptionTitle.value = '';
  lessonDescriptionIntro.value = '';
  learningPoints.value = [];
  currentStepIndex.value = 0;
  showTableOfContents.value = true;
  isQuizMode.value = false;
  quizQuestions.value = [];
  quizAnswers.value = [];
  quizSubmitted.value = false;
  quizScore.value = 0;
};

const nextStep = () => {
  // 학습 내용 설명에서 다음 버튼을 누르면 콘텐츠 1단계로 이동
  if (showTableOfContents.value) {
    showTableOfContents.value = false;
    currentStepIndex.value = 0; // 콘텐츠 첫 단계
    return;
  }
  
  if (currentStepIndex.value < Math.max(lessonContentSteps.value.length - 1, 0)) {
    currentStepIndex.value++;
  }
};

const prevStep = () => {
  // 콘텐츠 첫 단계에서 이전 버튼을 누르면 학습 내용 설명으로 돌아가기
  if (!showTableOfContents.value && currentStepIndex.value === 0) {
    showTableOfContents.value = true;
    return;
  }
  
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const completeLesson = () => {
  if (!selectedLesson.value) return;
  if (!selectedLesson.value.completed) {
    selectedLesson.value.completed = true;
    selectedLesson.value.progress = 100;
    completedLessons.value++;
    const total = lessons.value.length;
    learningProgress.value = Math.round((completedLessons.value / total) * 100);

    // 다음 잠김 강의 하나 해제
    const sameCategory = lessons.value
      .filter((l) => l.category === selectedLesson.value.category)
      .sort((a, b) => a.id - b.id);
    const idx = sameCategory.findIndex((l) => l.id === selectedLesson.value.id);
    if (idx !== -1 && idx + 1 < sameCategory.length) {
      if (sameCategory[idx + 1].locked) {
        sameCategory[idx + 1].locked = false;
      }
    }

    // (최근 학습 기록 UI 제거됨) 필요 시 서버에 완료 이벤트 전송만 수행
  }
  closeLesson();
};

// 강의별 설명/콘텐츠 분리 생성
const getLessonContentSplit = (lesson) => {
  const byCategory = {
    basic: [
    {
  title: '입금',
  content: '현금을 은행 계좌에 넣는 것을 말합니다. 예: 연금을 받아 통장에 넣는 것.',
},
{
  title: '출금',
  content: '은행에 맡긴 돈을 찾아서 쓰는 것을 말합니다. 예: ATM에서 생활비를 찾는 것.',
},
{
  title: '송금',
  content: '내 계좌에 있는 돈을 다른 사람 계좌로 보내는 것을 말합니다. 예: 손주에게 용돈 보내기.',
},
{
  title: '통장',
  content: '내 돈이 들어오고 나간 기록을 적어 두는 책자입니다.',
},
{
  title: '계좌',
  content: '은행에서 돈을 맡아두는 내 전용 번호입니다. 돈을 주고받을 때 꼭 필요한 주소 같은 역할을 합니다.',
},
{
  title: '이자',
  content: '은행에 돈을 맡기면 은행이 주는 보상이고, 돈을 빌리면 내가 내야 하는 비용입니다.',
},

    ],
    security: [
      {
        title: '비밀번호·OTP 안전',
        content:
          '비밀번호는 메모에 그대로 적지 말고, 가족에게도 공유하지 마세요. OTP 숫자는 절대 말하지 않습니다.',
      },
      {
        title: '의심 전화 대처',
        content:
          '"지금 바로" "검찰/금감원" "계좌가 위험" 같은 말은 사기입니다. 끊고 공식 번호로 다시 걸어 확인하세요.',
      },
      {
        title: '전화/문자 차단',
        content:
          '수상한 번호는 차단하고 스팸으로 신고하세요. 스미싱 문자는 링크를 누르지 않습니다.',
      },
    ],
    phishing: [
      {
        title: '메신저·보이스피싱',
        content:
          '자녀·지인을 사칭해 "휴대폰 고장, 급히 이체" 요구하면 100% 사기입니다. 반드시 직접 통화로 확인하세요.',
      },
      {
        title: '가짜 사이트 구별',
        content:
          '주소창 자물쇠 여부와 은행 공식 주소인지 확인합니다. 철자 하나 다른 사이트는 사기입니다.',
      },
      {
        title: '피해 최소화',
        content:
          '의심되면 즉시 이체 중지 요청(은행/112). 대화·문자 내용은 그대로 보관해 신고에 활용하세요.',
      },
    ],
    digital: [
      {
        title: '쉬운 화면 설정',
        content:
          '휴대폰 설정에서 글씨 키우기, 고대비/확대 기능을 켜세요. 자주 쓰는 기능만 즐겨찾기에 두세요.',
      },
      {
        title: '안전한 이체 습관',
        content:
          '처음 보내는 계좌는 1,000원 같은 소액으로 먼저 보내 확인합니다. 수취인 이름과 금액을 크게 읽어 확인하세요.',
      },
      {
        title: '공용 와이파이 주의',
        content:
          '은행 업무는 집이나 LTE/5G에서만. 앱·운영체제는 항상 최신으로 업데이트하세요.',
      },
    ],
  };

  const generic = byCategory[lesson.category] || [
    { title: '개요', content: `${lesson.title}의 주요 내용을 학습합니다.` },
    {
      title: '핵심 정리',
      content: '핵심 개념을 정리하고 실습 예제를 확인합니다.',
    },
    { title: '마무리', content: '체크리스트와 안전 수칙을 점검합니다.' },
  ];

  // 학습 내용 설명 + 학습 포인트 (포인트는 콘텐츠와 별도 소스)
  const descriptionTitle = '이 강의에서 배울 내용';
  const descriptionIntro = `${lesson.title}을 통해 다음과 같은 내용을 학습하게 됩니다.`;
  const contentSteps = [{ title: lesson.title, content: lesson.description }, ...generic];
  const learningCore = getLearningPointsForCategory(lesson);
  const points = learningCore.map((step, index) => ({
    number: index + 1,
    title: step.title,
    description: step.content,
  }));

  return {
    descriptionTitle,
    descriptionIntro,
    learningPoints: points,
    contentSteps,
  };
};

// 학습 포인트 전용 데이터 (콘텐츠와 별도로 구성)
const getLearningPointsForCategory = (lesson) => {
  const byCategory = {
    basic: [
        {
    title: '금융기관이 어떤일을 하는지 알아봅니다.',
    content:
      '은행, 증권사 같은 금융기관의 기본적인 역할을 배웁니다.',
  },
  {
    title: '금융개념을 익혀봅니다.',
    content:
      '입금, 출금, 송금 등 생활 속에서 자주 쓰이는 기본 용어를 배웁니다.',
  },
    ],
    security: [
      { title: '인증 보안', content: '비밀번호, 생체인증, OTP의 안전한 사용 원칙.' },
      { title: '의심 연락 대응', content: '공식 채널 재확인과 정보 미공유 원칙.' },
      { title: '기기/네트워크', content: '기기 잠금, 최신 업데이트, 안전한 네트워크 사용.' },
    ],
    phishing: [
      { title: '사칭 식별', content: '메신저/보이스피싱의 전형적 화법과 징후.' },
      { title: '링크 검증', content: 'URL 철자·자물쇠·공식 주소 확인 습관.' },
      { title: '피해 최소화', content: '즉시 신고/이체중지, 증거 보존 방법.' },
    ],
    digital: [
      { title: '앱 안전 시작', content: '공식 스토어 설치와 권한 설정 최적화.' },
      { title: '송금 체크', content: '수취인명/금액 이중확인 및 소액 테스트 송금.' },
      { title: '환경 설정', content: '글자 크기/고대비 등 접근성 향상으로 실수 감소.' },
    ],
  };

  return byCategory[lesson.category] || [
    { title: '개요 포인트', content: `${lesson.title}의 핵심 포인트를 정리합니다.` },
    { title: '실천 팁', content: '바로 적용 가능한 체크리스트를 제공합니다.' },
    { title: '유의 사항', content: '주의할 점과 흔한 실수를 정리합니다.' },
  ];
};

// 퀴즈 상태 및 로직
const isQuizMode = ref(false);
const quizQuestions = ref([]);
const quizAnswers = ref([]);
const quizSubmitted = ref(false);
const quizScore = ref(0);

const startQuiz = () => {
  isQuizMode.value = true;
  quizSubmitted.value = false;
  quizScore.value = 0;
  quizQuestions.value = getQuizForCategory(
    selectedLesson.value?.category || 'basic'
  );
  quizAnswers.value = Array(quizQuestions.value.length).fill('');
};

const submitQuiz = () => {
  quizSubmitted.value = true;
  let score = 0;
  quizQuestions.value.forEach((q, idx) => {
    if ((quizAnswers.value[idx] || '').trim() === q.answer) score++;
  });
  quizScore.value = score;
};

const quizIsCorrect = (idx) => {
  if (!quizSubmitted.value) return false;
  return (
    (quizAnswers.value[idx] || '').trim() === quizQuestions.value[idx].answer
  );
};

const getQuizForCategory = (category) => {
  const map = {
   basic: [
  {
    question: '은행 계좌에 현금을 넣는 것을 무엇이라고 하나요?',
    options: [
      '출금',
      '입금',
      '송금',
      '투자',
    ],
    answer: '입금',
  },
  {
    question: '은행에 돈을 맡기면 받는 보상은 무엇이며, 돈을 빌리면 무엇을 내야 하나요?',
    options: [
      '이자 / 이자',
      '수수료 / 수수료',
      '이자 / 수수료',
      '수수료 / 이자',
    ],
    answer: '이자 / 이자',
  },
],
    security: [
      {
        question: 'OTP 번호를 요구하는 전화에 대한 올바른 대응은?',
        options: [
          '번호를 불러준다',
          '문자로 보내준다',
          '절대 알려주지 않는다',
          '사진으로 찍어 보낸다',
        ],
        answer: '절대 알려주지 않는다',
      },
      {
        question:
          '“계좌가 위험하다, 지금 바로 이체하라”는 전화를 받았다. 어떻게 해야 하나요?',
        options: [
          '즉시 지시에 따른다',
          '전화를 끊고 공식 번호로 재확인한다',
          '비밀번호를 말한다',
          '앱 설치를 진행한다',
        ],
        answer: '전화를 끊고 공식 번호로 재확인한다',
      },
    ],
    phishing: [
      {
        question:
          '자녀를 사칭해 “휴대폰 고장으로 돈이 필요”라며 이체를 요구한다. 올바른 행동은?',
        options: [
          '바로 이체',
          '문자만 믿는다',
          '반드시 직접 통화로 확인',
          '메신저 사진만 확인',
        ],
        answer: '반드시 직접 통화로 확인',
      },
      {
        question: '가짜 사이트를 구별하는 방법으로 옳은 것은?',
        options: [
          '주소창 자물쇠와 공식 주소 확인',
          '로고만 보면 된다',
          '이벤트 팝업이 많으면 안전',
          '철자 다른 주소는 문제없다',
        ],
        answer: '주소창 자물쇠와 공식 주소 확인',
      },
    ],
    digital: [
      {
        question: '모바일뱅킹은 어디에서 설치해야 하나요?',
        options: [
          '메신저 링크',
          '공식 앱스토어',
          '검색 결과 첫 링크 아무거나',
          'QR 광고',
        ],
        answer: '공식 앱스토어',
      },
      {
        question: '송금 전 꼭 확인해야 할 두 가지는?',
        options: [
          '테마 색상/폰 배터리',
          '와이파이 이름/날씨',
          '수취인명/금액',
          '통신사/요금제',
        ],
        answer: '수취인명/금액',
      },
    ],
  };
  return map[category] || map.basic;
};
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.education-page {
  /* KB Main Colors */
  --kb-yellow-positive: #ffbc00; /* KB Yellow Positive - R255 G188 B0 */
  --kb-yellow-negative: #ffcc00; /* KB Yellow Negative - R255 G204 B0 */
  --kb-gray: #605850; /* KB Gray - R96 G88 B76 */

  /* KB Sub Colors */
  --kb-dark-gray: #545049; /* KB Dark Gray - R84 G80 B69 */
  --kb-gold: #b8860b; /* KB Gold (추정) */
  --kb-silver: #c0c0c0; /* KB Silver (추정) */

  /* Derived Colors */
  --primary: var(--kb-yellow-positive);
  --primary-light: #fff4d6;
  --primary-dark: #e6a600;
  --secondary: var(--kb-yellow-negative);
  --secondary-light: #fff8e1;
  --accent: var(--kb-gray);
  --accent-light: #f5f4f2;
  --success: #4caf50;
  --warning: var(--kb-yellow-negative);
  --danger: #f44336;

  /* Gray Scale */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #eeeeee;
  --gray-300: #e0e0e0;
  --gray-400: #bdbdbd;
  --gray-500: #9e9e9e;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;

  --white: #ffffff;
  --black: #000000;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Border Radius */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.education-page {
  min-height: 100vh;
  background: var(--gray-50);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  color: var(--gray-800);
  line-height: 1.6;
}

/* 네비게이션 */
.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-100) 100%);
  border: 1px solid var(--gray-200);
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--kb-yellow-positive) 0%,
    var(--primary-dark) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--kb-yellow-positive);
}

.back-btn:hover::before {
  opacity: 0.1;
}

.back-icon {
  font-size: 18px;
  color: var(--gray-700);
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.back-btn:hover .back-icon {
  color: var(--kb-yellow-positive);
  transform: translateX(-2px);
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.help-btn {
  background: var(--gray-200);
  color: var(--gray-600);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.help-btn:hover {
  background: var(--gray-300);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 환영 섹션 */
.welcome-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.welcome-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--kb-gray);
  letter-spacing: -1px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--kb-dark-gray);
  line-height: 1.6;
  font-weight: 500;
}

.progress-card {
  background: var(--white);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-gray);
}

.progress-percentage {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-yellow-positive);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--kb-yellow-positive),
    var(--primary-dark)
  );
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-gray);
  letter-spacing: -0.5px;
}

.view-all-btn {
  background: var(--accent-light);
  color: var(--kb-gray);
  border: 1px solid var(--kb-gray);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-all-btn:hover {
  background: var(--kb-gray);
  color: var(--white);
  transform: translateY(-1px);
}

/* 교육 카테고리 */
.education-categories {
  margin-bottom: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.category-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
  border: 2px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--kb-yellow-positive);
}

.category-card.active {
  border-color: var(--kb-yellow-positive);
  background: var(--primary-light);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.category-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
}

.category-card p {
  font-size: 14px;
  color: var(--gray-600);
  margin-bottom: 12px;
  line-height: 1.5;
}

.category-progress {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 600;
}

/* 강의 섹션 */
.lessons-section {
  margin-bottom: 16px;
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.lesson-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.lesson-card:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--kb-yellow-positive);
}

.lesson-card.completed {
  border-color: var(--success);
  background: linear-gradient(135deg, var(--white) 0%, #f0fdf4 100%);
}

.lesson-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--gray-100);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.lesson-icon {
  font-size: 32px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.completed {
  background: var(--success);
  color: var(--white);
}

.status-badge.available {
  background: var(--kb-yellow-positive);
  color: var(--white);
}

.status-badge.locked {
  background: var(--gray-400);
  color: var(--white);
}

.lesson-content h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
}

.lesson-content p {
  font-size: 14px;
  color: var(--gray-600);
  margin-bottom: 12px;
  line-height: 1.5;
}

.lesson-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 600;
}

.lesson-progress {
  margin-top: 12px;
}

.lesson-progress .progress-bar {
  height: 4px;
  margin-bottom: 4px;
}

.lesson-progress .progress-text {
  font-size: 12px;
  text-align: right;
}

/* 추천 강의 */
/* 추천 강의 및 최근 학습 기록 스타일 제거됨 */

/* 강의 모달 */
.lesson-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.lesson-modal {
  width: min(720px, 92vw);
  background: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.lesson-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-200);
}

.lesson-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--kb-gray);
}

.lesson-close-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
}

.lesson-modal-progress {
  padding: 12px 20px 0 20px;
}

.lesson-step-indicator {
  font-size: 12px;
  color: var(--gray-600);
  margin-top: 8px;
}

.lesson-modal-body {
  padding: 16px 20px 8px 20px;
}

/* .lesson-step-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-gray);
  margin-bottom: 8px;
} */
.lesson-step-title {
  font-size: 20px;              /* 글자 크기 키움 */
  font-weight: 800;             /* 두껍게 */
  color: #000;                  /* 검정으로 대비 강화 */
  background-color: #fff9c4;   /* 연한 노란색 배경으로 시선 유도 */
  border: 2px solid #ffd600;    /* 카드 테두리 강조 */
  border-radius: 12px;           /* 둥근 모서리 */
  padding: 12px 16px;            /* 안쪽 여백 충분히 */
  margin-bottom: 16px;           /* 아래 여백 늘려 시각적 구분 */
  line-height: 1.6;             /* 줄 간격 넉넉히 */
  letter-spacing: 0.5px;        /* 자간 약간 늘림 */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* 그림자로 입체감 */
}

.lesson-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lesson-step-badges {
  display: inline-flex;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid transparent;
}

.badge-key {
  background: #eef9ff;
  color: #035c91;
  border-color: #cdeeff;
}

.badge-easy {
  background: #fff8e6;
  color: #8a5b00;
  border-color: #ffe0a6;
}

.lesson-step-content {
  position: relative;
  font-size: 14px;
  color: var(--gray-800);
  line-height: 1.8;
  background: #fffdfa;
  border-left: 4px solid var(--kb-yellow-positive);
  padding: 12px 12px 12px 14px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--gray-200);
}

.lesson-step-content::before {
  content: '“';
  position: absolute;
  left: -10px;
  top: -6px;
  font-size: 28px;
  color: rgba(255, 188, 0, 0.35);
  pointer-events: none;
}

.lesson-modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 20px 20px 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--kb-yellow-positive);
  color: var(--white);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-800);
  border: 1px solid var(--gray-300);
}

/* Quiz styles */
.quiz-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quiz-item {
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  background: var(--white);
}

.quiz-question {
  font-weight: 700;
  color: var(--kb-gray);
  margin-bottom: 8px;
}

.quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
}

.quiz-feedback {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
}

.quiz-feedback.correct {
  color: #059669;
}
.quiz-feedback.wrong {
  color: #dc2626;
}

.quiz-result {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 800;
  color: var(--kb-yellow-positive);
}

/* 학습 내용 설명 스타일 */
.lesson-description {
  padding: 16px 0;
}

.lesson-description.single-card {
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  background: var(--white);
  box-shadow: var(--shadow);
}

.learning-points-list {
  margin-top: 16px;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.learning-point-list-item {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 12px 14px;
}


.learning-point-list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.learning-point-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--kb-yellow-positive);
  color: var(--white);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.learning-point-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-gray);
  flex: 1;
}

.learning-point-description {
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.7;
  margin: 0;
  padding-left: 40px;
  background: #fafafa;
  border: 1px dashed var(--gray-200);
  border-radius: 8px;
  padding: 10px 12px 10px 40px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .welcome-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }

  .lessons-grid {
    grid-template-columns: 1fr;
  }

  .recommended-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 24px;
  }

  .section-header h2 {
    font-size: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 12px 16px;
  }

  .main-content {
    padding: 12px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .category-card,
  .lesson-card,
  .recommended-card {
    padding: 16px;
  }

  .progress-card {
    padding: 16px;
  }
}
</style>
