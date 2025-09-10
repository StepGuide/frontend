<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <button class="close-btn" @click="$emit('close')" aria-label="닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.11999 3.72C9.28562 4.68007 9.55177 5.62273 9.90999 6.53C10.0786 6.88792 10.1481 7.287 10.111 7.682C10.0739 8.077 9.93156 8.45544 9.69999 8.78L8.08999 10.39C9.51355 12.4885 11.5115 14.4864 13.61 15.91L15.22 14.3C15.5446 14.0684 15.923 13.9261 16.318 13.889C16.713 13.8519 17.1121 13.9214 17.47 14.09C18.3773 14.4482 19.3199 14.7144 20.28 14.88C20.7658 14.9585 21.2094 15.2032 21.5265 15.5715C21.8437 15.9399 22.0122 16.4086 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="modal-title">보호자 전화번호 등록</h3>
        <p class="modal-description">
          이상 이체 시 이 번호로 지정된 보호자에게 알림을 보낼게요.
        </p>
      </div>
      
      <div class="modal-body">
        <div class="input-group">
          <label class="input-label">전화번호</label>
          <div class="input-container">
            <input 
              v-model="phone" 
              class="phone-input" 
              placeholder="010-1234-5678"
              type="tel"
              maxlength="13"
              @input="formatPhoneNumber"
            />
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.11999 3.72C9.28562 4.68007 9.55177 5.62273 9.90999 6.53C10.0786 6.88792 10.1481 7.287 10.111 7.682C10.0739 8.077 9.93156 8.45544 9.69999 8.78L8.08999 10.39C9.51355 12.4885 11.5115 14.4864 13.61 15.91L15.22 14.3C15.5446 14.0684 15.923 13.9261 16.318 13.889C16.713 13.8519 17.1121 13.9214 17.47 14.09C18.3773 14.4482 19.3199 14.7144 20.28 14.88C20.7658 14.9585 21.2094 15.2032 21.5265 15.5715C21.8437 15.9399 22.0122 16.4086 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">
          나중에
        </button>
        <button 
          class="btn-primary" 
          :disabled="!isValidPhone || saving"
          @click="save"
        >
          <span v-if="saving" class="loading-spinner"></span>
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/api/axios';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'saved']);

const phone = ref('');
const saving = ref(false);
const errorMessage = ref('');

// 전화번호 유효성 검사
const isValidPhone = computed(() => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone.value);
});

// 전화번호 포맷팅
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  
  if (value.length >= 11) {
    value = value.slice(0, 11);
  }
  
  if (value.length >= 7) {
    value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
  } else if (value.length >= 3) {
    value = value.slice(0, 3) + '-' + value.slice(3);
  }
  
  phone.value = value;
  errorMessage.value = '';
};

// 저장 함수
const save = async () => {
  if (!isValidPhone.value) {
    errorMessage.value = '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)';
    return;
  }
  
  try {
    saving.value = true;
    errorMessage.value = '';
    
  await api.put('/me/guardian-phone', { phone: phone.value });
  emit('saved', phone.value);
  emit('close');
  } catch (error) {
    console.error('보호자 전화번호 저장 실패:', error);
    errorMessage.value = '전화번호 저장에 실패했습니다. 다시 시도해주세요.';
  } finally {
    saving.value = false;
}
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: #f8fafc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #374151;
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
  line-height: 1.2;
}

.modal-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.modal-body {
  padding: 24px 32px;
}

.input-group {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.phone-input {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  background: #ffffff;
  transition: all 0.2s ease;
  outline: none;
}

.phone-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.phone-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #6b7280;
  pointer-events: none;
}

.error-message {
  margin-top: 8px;
  font-size: 14px;
  color: #ef4444;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message::before {
  content: '⚠️';
  font-size: 12px;
}

.modal-footer {
  padding: 24px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #f3f4f6;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.btn-secondary {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .modal {
  min-width: 320px;
    margin: 16px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 24px;
    padding-right: 24px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-description {
    font-size: 14px;
  }
  
  .phone-input {
    padding: 14px 18px 14px 46px;
    font-size: 15px;
  }
  
  .btn-secondary,
  .btn-primary {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .close-btn {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
  }
  
  .close-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>
