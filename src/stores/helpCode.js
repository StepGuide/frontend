import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHelpCodeStore = defineStore('helpCode', () => {
  // 생성된 도움 요청 코드
  const generatedCode = ref(null)
  
  // 연결 상태 (사용자가 연결을 끊었는지 여부)
  const isConnectionDisabled = ref(false)
  
  // 연결 해제 신호 (GuardianView에서 감지용)
  const connectionTerminated = ref(false)
  
  // 코드 설정
  const setGeneratedCode = (code) => {
    generatedCode.value = code
    isConnectionDisabled.value = false // 새 코드 생성 시 연결 상태 초기화
    connectionTerminated.value = false // 연결 해제 신호도 초기화
    console.log('📝 도움 요청 코드 설정:', code)
  }
  
  // 코드 초기화
  const clearGeneratedCode = () => {
    generatedCode.value = null
    isConnectionDisabled.value = false
    connectionTerminated.value = false // 연결 해제 신호도 초기화
    console.log('🗑️ 도움 요청 코드 초기화')
  }
  
  // 연결 비활성화 (사용자가 연결 끊기)
  const disableConnection = () => {
    isConnectionDisabled.value = true
    console.log('🔌 연결 비활성화됨')
  }
  
  // 연결 활성화 (사용자가 연결하기)
  const enableConnection = () => {
    isConnectionDisabled.value = false
    connectionTerminated.value = false // 연결 해제 신호 초기화
    console.log('🔌 연결 활성화됨')
  }
  
  // 연결 해제 신호 설정 (GuardianView에서 감지용)
  const terminateConnection = () => {
    connectionTerminated.value = true
    console.log('🔌 연결 해제 신호 설정됨')
  }
  
  // 현재 코드 가져오기
  const getCurrentCode = () => {
    return generatedCode.value
  }
  
  return {
    generatedCode,
    isConnectionDisabled,
    connectionTerminated,
    setGeneratedCode,
    clearGeneratedCode,
    disableConnection,
    enableConnection,
    terminateConnection,
    getCurrentCode
  }
})
