<template>
  <div class="main-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <span class="logo-icon">🏦</span>
          <span class="logo-text">KB 금융 도우미</span>
        </div>
        <div class="nav-actions">
          <button class="notification-btn">
            <span class="notification-icon">🔔</span>
          </button>
          <button class="profile-btn">
            <span class="profile-icon">👤</span>
          </button>
          <button class="mode-toggle-btn" @click="toggleToGuardianMode">
            <span class="toggle-icon">🧓</span>
            <span class="toggle-text">보호자 모드</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 환영 메시지 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">안녕하세요, 김영희님!</h1>
          <p class="welcome-subtitle">오늘도 안전하게 금융 서비스를 이용해보세요</p>
        </div>
        <div class="help-request-card">
          <div class="help-content">
            <h3>도움이 필요하신가요?</h3>
            <p>6자리 코드로 전문가와 연결</p>
            <button class="help-request-btn">도움 요청하기</button>
          </div>
        </div>
      </div>

      <!-- 계좌 정보 -->
      <div class="account-overview">
        <div class="section-header">
          <h2>내 계좌 현황</h2>
          <button class="view-all-btn">전체보기</button>
        </div>
        <div class="account-grid">
          <div class="account-card primary">
            <div class="card-header">
              <div class="card-icon">💰</div>
              <div class="card-title">KB국민은행</div>
            </div>
            <div class="balance-info">
              <div class="balance-label">총 잔액</div>
              <div class="balance-amount">₩ 2,450,000</div>
              <div class="account-number">123-456789-01-234</div>
            </div>
            <div class="card-actions">
              <button class="action-btn">이체</button>
              <button class="action-btn">조회</button>
            </div>
          </div>
          
          <div class="account-card secondary">
            <div class="card-header">
              <div class="card-icon">📊</div>
              <div class="card-title">최근 거래</div>
            </div>
            <div class="transaction-list">
              <div class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type income">입금</span>
                  <span class="transaction-desc">월급</span>
                </div>
                <span class="transaction-amount income">+₩ 500,000</span>
              </div>
              <div class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type expense">출금</span>
                  <span class="transaction-desc">ATM</span>
                </div>
                <span class="transaction-amount expense">-₩ 50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 주요 서비스 -->
      <div class="services-section">
        <div class="section-header">
          <h2>주요 서비스</h2>
        </div>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">💳</div>
            <h3>이체하기</h3>
            <p>안전하고 간편한 계좌이체</p>
            <button class="service-btn">이용하기</button>
          </div>
          
                     <div class="service-card">
             <div class="service-icon">🎯</div>
             <h3>연습 모드</h3>
             <p>실제 계좌에 영향 없이 연습</p>
             <button class="service-btn">연습하기</button>
           </div>
          
          <div class="service-card">
            <div class="service-icon">🔒</div>
            <h3>보안설정</h3>
            <p>계좌 보안 관리</p>
            <button class="service-btn">설정하기</button>
          </div>
          
          <div class="service-card">
            <div class="service-icon">📚</div>
            <h3>금융교육</h3>
            <p>안전한 금융 이용법</p>
            <button class="service-btn">학습하기</button>
          </div>
        </div>
      </div>

      

      <!-- 빠른 도움말 -->
      <div class="quick-help">
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>이체 방법</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>보안 설정</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>계좌 조회</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>비밀번호 변경</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 보호자 모드로 전환
const toggleToGuardianMode = () => {
  router.push('/guardian')
}
</script>

<style scoped>
/* CSS 변수 정의 - 단순하고 명확한 색상 */
.main-page {
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
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-page {
  min-height: 100vh;
  background: var(--kb-gray);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--kb-text-primary);
}

/* 네비게이션 - 단순한 디자인 */
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

.nav-actions {
  display: flex;
  gap: 12px;
}

.notification-btn,
.profile-btn {
  background: var(--kb-orange);
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-toggle-btn {
  background: var(--kb-blue);
  color: var(--kb-gray-light);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mode-toggle-btn:hover {
  background: var(--kb-blue-dark);
}

.toggle-icon {
  font-size: 16px;
}

.toggle-text {
  font-size: 14px;
}

.notification-btn:hover,
.profile-btn:hover {
  background: var(--kb-orange-dark);
}

.notification-icon,
.profile-icon {
  font-size: 20px;
  color: var(--kb-gray-light);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* 환영 섹션 */
.welcome-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--kb-text-primary);
}

.welcome-subtitle {
  font-size: 18px;
  color: var(--kb-text-secondary);
  line-height: 1.6;
  font-weight: 600;
}

/* 도움 요청 카드 - 단순한 단색 */
.help-request-card {
  background: var(--kb-yellow);
  border-radius: 16px;
  padding: 24px;
  color: var(--kb-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--kb-orange);
}

.help-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.help-content h3 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--kb-text-primary);
}

.help-content p {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--kb-text-primary);
  font-weight: 600;
}

.help-request-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid var(--kb-orange);
}

.help-request-btn:hover {
  background: var(--kb-orange-dark);
  border-color: var(--kb-orange-dark);
}

/* 섹션 헤더 - 단순한 디자인 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--kb-gray-light);
  border-radius: 12px;
  border-left: 4px solid var(--kb-orange);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.view-all-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: var(--kb-orange-dark);
}

/* 계좌 정보 - 단순한 디자인 */
.account-overview {
  margin-bottom: 24px;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.account-card {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
  transition: all 0.2s ease;
}

.account-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

.account-card.primary {
  border-left: 4px solid var(--kb-orange);
}

.account-card.secondary {
  border-left: 4px solid var(--kb-blue);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 24px;
  color: var(--kb-orange);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.balance-info {
  margin-bottom: 16px;
}

.balance-label {
  font-size: 16px;
  color: var(--kb-text-secondary);
  margin-bottom: 10px;
  font-weight: 600;
}

.balance-amount {
  font-size: 36px;
  font-weight: 800;
  color: var(--kb-orange);
  margin-bottom: 10px;
}

.account-number {
  font-size: 16px;
  color: var(--kb-text-primary);
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--kb-orange-dark);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--kb-border);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-type {
  font-size: 16px;
  font-weight: 700;
}

.transaction-type.income {
  color: var(--kb-orange);
}

.transaction-type.expense {
  color: #DC3545;
}

.transaction-desc {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.transaction-amount {
  font-weight: 700;
  font-size: 18px;
}

.transaction-amount.income {
  color: var(--kb-orange);
}

.transaction-amount.expense {
  color: #DC3545;
}

/* 서비스 섹션 - 단순한 디자인 */
.services-section {
  margin-bottom: 24px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.service-card {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
  transition: all 0.2s ease;
}

.service-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

.service-icon {
  font-size: 40px;
  margin-bottom: 16px;
  color: var(--kb-orange);
}

.service-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--kb-text-primary);
}

.service-card p {
  font-size: 14px;
  color: var(--kb-text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
  font-weight: 600;
}

.service-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-btn:hover {
  background: var(--kb-orange-dark);
}



/* 빠른 도움말 - 단순한 디자인 */
.quick-help {
  margin-bottom: 24px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.help-item {
  background: var(--kb-gray-light);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--kb-border);
}

.help-item:hover {
  background: var(--kb-orange-light);
  border-color: var(--kb-orange);
}

.help-item .help-icon {
  font-size: 20px;
  color: var(--kb-orange);
}

.help-item span {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-primary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  
  .welcome-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .account-grid {
    grid-template-columns: 1fr;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  
  
  .help-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .balance-amount {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 8px;
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style>
