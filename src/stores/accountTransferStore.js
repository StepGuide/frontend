import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserAccounts, validateTransfer, executeTransfer } from '@/api/accountTransferApi'

export const useTransferStore = defineStore('transfer', () => {
  // Step 상태
  const currentStep = ref(1)

  // 사용자 계좌 목록
  const accounts = ref([])

  // 선택된 출금 계좌
  const selectedAccount = ref(null)

  // Step 2~3에서 사용할 DTO
  const transferDTO = ref({
    accountId: null,
    userId: null,
    accountNumber: '',
    accountName: '',
    balance: 0,
    bankCode: '',
    sendBankCode: '',
    payeeAccountNumber: '',
    transactionAmount: 0,
    accountHolderName: '',
    memo: ''
  })

  // Step 1: 계좌 조회
  const fetchAccounts = async (userId) => {
    try {
      const data = await getUserAccounts(userId)
      accounts.value = data
    } catch (err) {
      console.error('계좌 조회 실패', err)
    }
  }

  // Step 2: 검증
  const validate = async () => {
    try {
      const validatedDTO = await validateTransfer(transferDTO.value)
      transferDTO.value = validatedDTO // 검증된 DTO 저장
      currentStep.value = 3
    } catch (err) {
      console.error('이체 검증 실패', err)
      throw err
    }
  }

  // Step 3: 최종 이체
  const execute = async () => {
    try {
      const result = await executeTransfer(transferDTO.value)
      currentStep.value = 1
      selectedAccount.value = null
      transferDTO.value = {} // 초기화
      return result
    } catch (err) {
      console.error('이체 실패', err)
      throw err
    }
  }

  const nextStep = () => {
    if (currentStep.value < 3) currentStep.value++
  }

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--
  }

  return {
    currentStep,
    accounts,
    selectedAccount,
    transferDTO,
    fetchAccounts,
    validate,
    execute,
    nextStep,
    prevStep
  }
})
