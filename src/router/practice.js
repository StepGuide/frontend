export default [
  {
    path: '/practice/PracticeSelectPage',
    name: 'practiceSelectPage',
    component: () => import('../views/practice/PracticeSelectPage.vue'),
  },
  {
    path: '/practice/RealPractice/:type', // :type으로 문제 유형 전달
    name: 'realPracticePage',
    component: () => import('../views/practice/RealPracticePage.vue'),
  },
  {
    path: '/practice/real/:type',
    name: 'realPractice',
    component: () => import('../views/practice/RealPracticePage.vue'),
  },
  {
    path: '/practice/real/complete',
    name: 'realPracticeComplete',
    component: () => import('../views/practice/RealPracticeComplete.vue'),
  },
];
