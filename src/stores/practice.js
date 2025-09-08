import { defineStore } from 'pinia';

export const usePracticeStore = defineStore('practice', {
  state: () => ({
    selectedAccount: null,
  }),
  actions: {
    setSelectedAccount(account) {
      this.selectedAccount = account;
    },
    clearSelectedAccount() {
      this.selectedAccount = null;
    },
  },
});
