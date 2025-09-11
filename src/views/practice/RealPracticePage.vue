<template>
  <div class="real-practice-page">
    <h2>{{ practiceTitle }} 실전 연습</h2>

    <!-- 문제별 UI를 동적으로 표시 -->
    <component :is="currentComponent"></component>

    <div class="practice-footer">
      <button class="btn-primary" @click="completeRealPractice">실전 연습 완료</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 문제별 UI 컴포넌트 임포트
import TransferPractice from './real/TransferPractice.vue';
import InquiryPractice from './real/InquiryPractice.vue';
import BalancePractice from './real/BalancePractice.vue';

const route = useRoute();
const router = useRouter();
const practiceType = route.params.type;

// 문제 타입에 따라 동적 컴포넌트 선택
const currentComponent = computed(() => {
  switch (practiceType) {
    case 'transfer':
      return TransferPractice;
    case 'inquiry':
      return InquiryPractice;
    case 'balance':
      return BalancePractice;
    default:
      return TransferPractice;
  }
});

const practiceTitle = computed(() => {
  switch (practiceType) {
    case 'transfer':
      return '이체';
    case 'inquiry':
      return '조회';
    case 'balance':
      return '잔액 확인';
    default:
      return '이체';
  }
});

function completeRealPractice() {
  router.push({ name: 'realPracticeComplete', query: { title: practiceTitle.value } });
}
</script>
