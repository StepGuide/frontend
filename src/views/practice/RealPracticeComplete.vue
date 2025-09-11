<template>
  <div class="complete-page">
    <div class="card">
      <div class="icon">🎉</div>
      <h2>실전 연습 완료</h2>
      <p>
        {{ title }} 실전 연습을 마쳤습니다.<br />
        실제 돈이 나간 것이 아닌, 가상의 계좌와 금액으로 안전하게 연습하였습니다.
      </p>
      <div class="actions">
        <button class="btn-primary" @click="goPracticeSelect">연습 종료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const title = route.query.title || '서비스'

function goPracticeSelect() {
  router.push('/practice/PracticeSelectPage')
}
</script>

<style scoped>
.complete-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 24px;
}
.card {
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  padding: 24px;
  max-width: 540px;
  width: 100%;
  text-align: center;
}
.icon {
  font-size: 40px;
  margin-bottom: 8px;
}
h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 800;
}
p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}
.actions {
  display: flex;
  justify-content: center;
}
.btn-primary {
  background: #ffbc00;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary:hover {
  background: #e6a600;
}
</style>


