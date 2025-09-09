<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal">
      <h5>보호자 전화번호 등록</h5>
      <p class="text-muted">
        이상 이체 시 이 번호로 지정된 보호자에게 알림을 보낼게요.
      </p>
      <input v-model="phone" class="form-control" placeholder="010-1234-5678" />
      <div class="mt-3 d-flex gap-2 justify-content-end">
        <button class="btn btn-secondary" @click="$emit('close')">
          나중에
        </button>
        <button class="btn btn-primary" :disabled="!phone" @click="save">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/axios';
const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'saved']);
const phone = ref('');

async function save() {
  await api.put('/me/guardian-phone', { phone: phone.value });
  emit('saved', phone.value);
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
}
</style>
