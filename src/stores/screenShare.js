// 화면 공유 상태 관리 store
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWebRTC } from '@/utils/useWebRTC'

export const useScreenShareStore = defineStore('screenShare', () => {
  // 화면 공유 상태
  const isSharing = ref(false)
  const isConnected = ref(false)
  const helpCode = ref(null)
  
  // WebRTC 인스턴스 (전역으로 관리)
  let webrtcInstance = null
  let webSocketClient = null
  
  // WebRTC 인스턴스 초기화
  const initializeWebRTC = (code, client) => {
    console.log('🔧 WebRTC 인스턴스 초기화:', code)
    helpCode.value = code
    webSocketClient = client
    
    if (!webrtcInstance) {
      console.log('🆕 새로운 WebRTC 인스턴스 생성')
      webrtcInstance = useWebRTC(code, client)
      
      // WebRTC 상태와 store 상태 동기화
      watchWebRTCState()
    } else {
      // 기존 인스턴스의 코드 업데이트
      console.log('🔄 기존 WebRTC 인스턴스 코드 업데이트:', code)
      if (webrtcInstance.updateCode) {
        webrtcInstance.updateCode(code)
      } else {
        console.warn('⚠️ updateCode 메서드를 찾을 수 없습니다. 새로운 인스턴스를 생성합니다.')
        // 기존 인스턴스 정리
        if (webrtcInstance.cleanup) {
          webrtcInstance.cleanup()
        }
        // 새로운 인스턴스 생성
        webrtcInstance = useWebRTC(code, client)
        watchWebRTCState()
      }
    }
    
    return webrtcInstance
  }
  
  // WebRTC 상태 변화 감지
  const watchWebRTCState = () => {
    if (!webrtcInstance) return
    
    // WebRTC의 상태를 store에 반영
    const updateStoreState = () => {
      isSharing.value = webrtcInstance.isSharing.value
      isConnected.value = webrtcInstance.isConnected.value
    }
    
    // 주기적으로 상태 동기화 (100ms마다)
    const syncInterval = setInterval(() => {
      updateStoreState()
    }, 100)
    
    // store에 interval ID 저장하여 나중에 정리
    cleanupInterval = syncInterval
  }
  
  let cleanupInterval = null
  
  // 화면 공유 시작
  const startScreenShare = async () => {
    if (!webrtcInstance) {
      throw new Error('WebRTC 인스턴스가 초기화되지 않았습니다.')
    }
    
    console.log('📺 Store에서 화면 공유 시작')
    await webrtcInstance.startScreenShare()
    isSharing.value = true
  }
  
  // 화면 공유 중지
  const stopScreenShare = () => {
    if (!webrtcInstance) {
      console.warn('⚠️ WebRTC 인스턴스가 없습니다.')
      return
    }
    
    console.log('🛑 Store에서 화면 공유 중지')
    webrtcInstance.stopScreenShare()
    isSharing.value = false
    isConnected.value = false
  }
  
  // 콘솔 창 공유 시작
  const startConsoleShare = async () => {
    if (!webrtcInstance) {
      throw new Error('WebRTC 인스턴스가 초기화되지 않았습니다.')
    }
    
    console.log('🖥️ Store에서 콘솔 창 공유 시작')
    await webrtcInstance.startConsoleShare()
    isSharing.value = true
  }
  
  // WebRTC 메서드 프록시
  const getWebRTCMethods = () => {
    if (!webrtcInstance) {
      console.warn('⚠️ WebRTC 인스턴스가 초기화되지 않았습니다.')
      return {}
    }
    
    return {
      handleOffer: webrtcInstance.handleOffer,
      handleAnswer: webrtcInstance.handleAnswer,
      handleIceCandidate: webrtcInstance.handleIceCandidate,
      handleEnd: webrtcInstance.handleEnd,
      updateCode: webrtcInstance.updateCode,
      localVideo: webrtcInstance.localVideo,
      remoteVideo: webrtcInstance.remoteVideo,
      localStream: webrtcInstance.localStream,
      remoteStream: webrtcInstance.remoteStream
    }
  }
  
  // Store 정리
  const cleanup = () => {
    console.log('🧹 ScreenShare Store 정리')
    
    if (isSharing.value) {
      stopScreenShare()
    }
    
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
    
    webrtcInstance = null
    webSocketClient = null
    helpCode.value = null
    isSharing.value = false
    isConnected.value = false
  }
  
  // 브라우저 종료 시 정리
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup)
  }
  
  return {
    // 상태
    isSharing,
    isConnected,
    helpCode,
    
    // 메서드
    initializeWebRTC,
    startScreenShare,
    stopScreenShare,
    startConsoleShare,
    getWebRTCMethods,
    cleanup
  }
})
