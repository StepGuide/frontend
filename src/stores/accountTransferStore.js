import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getUserAccounts,
  validateTransfer,
  executeTransfer,
  getAccountTransactions,
} from '@/api/accountTransferApi';

export const useTransferStore = defineStore('transfer', () => {
  // Step 상태
  const currentStep = ref(1);

  // 사용자 계좌 목록
  const accounts = ref([]);

  // 선택된 출금 계좌
  const selectedAccount = ref(null);

  // 선택된 계좌 거래내역
  const transactions = ref([]);

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
    memo: '',
    transferType: 'IMMEDIATE', //임시--고려
  });

  // Step 1: 계좌 조회
  const fetchAccounts = async (userId) => {
    try {
      const data = await getUserAccounts(userId);
      accounts.value = data;
    } catch (err) {
      console.error('계좌 조회 실패', err);
    }
  };

  // 선택 계좌 변경 및 거래내역 조회
  const selectAccount = async (account) => {
    selectedAccount.value = account;
    transferDTO.value.accountId = account.accountId;
    transferDTO.value.accountNumber = account.accountNumber;
    transferDTO.value.accountName = account.accountName;
    transferDTO.value.balance = account.balance;
    transferDTO.value.bankCode = account.bankCode;

    // 여기에 확인용 로그 추가
    console.log('getAccountTransactions:', getAccountTransactions);

    // 거래내역 불러오기
    try {
      transactions.value = await getAccountTransactions(account.accountId);
    } catch (err) {
      console.error('거래내역 조회 실패', err);
      transactions.value = [];
    }
  };

  // Step 2: 검증
  const validate = async () => {
    try {
      const validatedDTO = await validateTransfer(transferDTO.value);
      transferDTO.value = validatedDTO; // 검증된 DTO 저장
      currentStep.value = 3;
    } catch (err) {
      console.error('이체 검증 실패', err);
      throw err;
    }
  };

  // Step 3: 최종 이체
  //   const execute = async () => {
  //     try {
  //       const result = await executeTransfer(transferDTO.value)
  //       currentStep.value = 1
  //       selectedAccount.value = null
  //       transferDTO.value = {} // 초기화
  //       return result
  //     } catch (err) {
  //       console.error('이체 실패', err)
  //       throw err
  //     }
  //   }
  const execute = async () => {
    try {
      const result = await executeTransfer(transferDTO.value);
      currentStep.value = 1;
      selectedAccount.value = null;
      transactions.value = []; // 거래내역 초기화
      transferDTO.value = {
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
        memo: '',
      };
      return result;
    } catch (err) {
      console.error('이체 실패', err);
      throw err;
    }
  };

  const nextStep = () => {
    if (currentStep.value < 3) currentStep.value++;
  };

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  return {
    currentStep,
    accounts,
    selectedAccount,
    transactions,
    transferDTO,
    fetchAccounts,
    selectAccount,
    validate,
    execute,
    nextStep,
    prevStep,
  };
});
