// ✅ WebRTC 화면 공유 유틸리티
import { ref, onUnmounted } from 'vue';

export const useWebRTC = (initialCode, webSocketClient) => {
  const localStream = ref(null);
  const remoteStream = ref(null);
  const isSharing = ref(false);
  const isConnected = ref(false);
  const peerConnection = ref(null);
  const localVideo = ref(null);
  const remoteVideo = ref(null);
  let currentCode = initialCode;

  // STUN 서버 설정
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // 화면 공유 시작
  const startScreenShare = async () => {
    try {
      console.log('🖥️ 화면 공유 시작...');
      
      // 화면 캡처 옵션 설정
      const displayMediaOptions = {
        video: {
          mediaSource: 'screen', // 화면 공유
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      // 화면 캡처
      localStream.value = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      console.log('✅ 화면 캡처 성공:', localStream.value);

      // 로컬 비디오 요소에 스트림 연결
      if (localVideo.value) {
        localVideo.value.srcObject = localStream.value;
        console.log('✅ 로컬 비디오에 스트림 연결됨');
      } else {
        console.warn('⚠️ localVideo ref가 없습니다');
      }

      isSharing.value = true;
      console.log('✅ 화면 공유 시작됨');

      // WebRTC 피어 연결 생성
      console.log('🔗 피어 연결 생성 중...');
      await createPeerConnection();
      console.log('✅ 피어 연결 생성 완료');
      
      // 로컬 스트림을 피어 연결에 추가
      localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value);
        console.log('✅ 트랙 추가됨:', track.kind);
      });

      // Offer 생성 및 전송
      console.log('📤 Offer 생성 중...');
      const offer = await peerConnection.value.createOffer();
      console.log('✅ Offer 생성 완료:', offer.type);
      
      await peerConnection.value.setLocalDescription(offer);
      console.log('✅ 로컬 설명 설정 완료');
      
      // 웹소켓을 통해 offer 전송
      if (webSocketClient && webSocketClient.connected && currentCode) {
        const offerMessage = {
          type: 'offer',
          sdp: offer.sdp
        };
        console.log('📤 Offer 전송 중:', offerMessage);
        
        webSocketClient.publish({
          destination: `/app/webrtc/offer/${currentCode}`,
          body: JSON.stringify(offerMessage)
        });
        console.log('✅ WebRTC Offer 전송 완료');
      } else {
        console.error('❌ 웹소켓 연결이 없거나 코드가 없습니다. Offer 전송 실패');
      }

    } catch (error) {
      console.error('❌ 화면 공유 시작 실패:', error);
    }
  };

  // 콘솔 창 공유 시작
  const startConsoleShare = async () => {
    try {
      console.log('🖥️ 콘솔 창 공유 시작...');
      
      // 콘솔 창 캡처 옵션 설정
      const displayMediaOptions = {
        video: {
          mediaSource: 'window', // 창 공유
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      // 창 캡처
      localStream.value = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // 로컬 비디오 요소에 스트림 연결
      if (localVideo.value) {
        localVideo.value.srcObject = localStream.value;
      }

      isSharing.value = true;
      console.log('✅ 콘솔 창 공유 시작됨');

      // WebRTC 피어 연결 생성
      await createPeerConnection();
      
      // 로컬 스트림을 피어 연결에 추가
      localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value);
      });

      // Offer 생성 및 전송
      const offer = await peerConnection.value.createOffer();
      await peerConnection.value.setLocalDescription(offer);
      
      // 웹소켓을 통해 offer 전송
      if (webSocketClient && webSocketClient.connected && currentCode) {
        webSocketClient.publish({
          destination: `/app/webrtc/offer/${currentCode}`,
          body: JSON.stringify({
            type: 'offer',
            sdp: offer.sdp
          })
        });
        console.log('📤 WebRTC Offer 전송됨 (콘솔 창)');
      } else {
        console.error('❌ 웹소켓 연결이 없거나 코드가 없습니다. Offer 전송 실패');
      }

    } catch (error) {
      console.error('❌ 콘솔 창 공유 시작 실패:', error);
    }
  };

  // 화면 공유 중지
  const stopScreenShare = () => {
    console.log('🛑 화면 공유 중지...');
    
    // 상태 먼저 변경
    isSharing.value = false;
    isConnected.value = false;
    
    // 로컬 스트림 정리
    if (localStream.value) {
      console.log('🔄 로컬 스트림 정리 중...');
      localStream.value.getTracks().forEach(track => {
        track.stop();
        console.log('🔄 트랙 중지됨:', track.kind);
      });
      localStream.value = null;
    }

    // 원격 스트림 정리
    if (remoteStream.value) {
      console.log('🔄 원격 스트림 정리 중...');
      remoteStream.value.getTracks().forEach(track => {
        track.stop();
        console.log('🔄 원격 트랙 중지됨:', track.kind);
      });
      remoteStream.value = null;
    }

    // 비디오 요소 정리
    if (localVideo.value) {
      localVideo.value.srcObject = null;
      localVideo.value.load(); // 비디오 요소 리셋
    }

    if (remoteVideo.value) {
      remoteVideo.value.srcObject = null;
      remoteVideo.value.load(); // 비디오 요소 리셋
    }

    // WebRTC 연결 정리
    if (peerConnection.value) {
      console.log('🔄 WebRTC 연결 정리 중...');
      
      // 모든 이벤트 리스너 제거
      peerConnection.value.onicecandidate = null;
      peerConnection.value.ontrack = null;
      peerConnection.value.onconnectionstatechange = null;
      peerConnection.value.oniceconnectionstatechange = null;
      peerConnection.value.onicegatheringstatechange = null;
      peerConnection.value.onsignalingstatechange = null;
      
      // 연결 종료
      peerConnection.value.close();
      peerConnection.value = null;
    }

    // ICE 후보 대기열 정리
    if (peerConnection.value && peerConnection.value.pendingIceCandidates) {
      peerConnection.value.pendingIceCandidates = [];
    }

    // 웹소켓을 통해 연결 종료 알림
    if (webSocketClient && webSocketClient.connected && currentCode) {
      webSocketClient.publish({
        destination: `/app/webrtc/end/${currentCode}`,
        body: JSON.stringify({ type: 'end' })
      });
    } else {
      console.warn('⚠️ 웹소켓 연결이 없거나 코드가 없습니다. 연결 종료 알림 전송 실패');
    }

    // 가비지 컬렉션 강제 실행 (개발 환경에서만)
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }

    console.log('✅ 화면 공유 중지됨');
  };

  // 피어 연결 생성
  const createPeerConnection = async () => {
    peerConnection.value = new RTCPeerConnection(iceServers);
    
    // ICE 후보 대기열 초기화
    peerConnection.value.pendingIceCandidates = [];

    // ICE 후보 수집 시 웹소켓으로 전송
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        if (webSocketClient && webSocketClient.connected && currentCode) {
          webSocketClient.publish({
            destination: `/app/webrtc/ice/${currentCode}`,
            body: JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate
            })
          });
        } else {
          console.warn('⚠️ 웹소켓 연결이 없거나 코드가 없습니다. ICE 후보 전송 실패');
        }
      }
    };

    // 원격 스트림 수신
    peerConnection.value.ontrack = (event) => {
      console.log('📥 원격 스트림 수신됨:', event);
      console.log('📥 스트림 개수:', event.streams.length);
      console.log('📥 첫 번째 스트림:', event.streams[0]);
      
      if (event.streams && event.streams.length > 0) {
        remoteStream.value = event.streams[0];
        console.log('✅ 원격 스트림 설정됨:', remoteStream.value);
        
        if (remoteVideo.value) {
          remoteVideo.value.srcObject = remoteStream.value;
          console.log('✅ 원격 비디오에 스트림 연결됨');
          
          // 비디오 로드 이벤트 리스너 추가
          remoteVideo.value.onloadedmetadata = () => {
            console.log('✅ 원격 비디오 메타데이터 로드됨');
            remoteVideo.value.play().then(() => {
              console.log('✅ 원격 비디오 재생 시작됨');
            }).catch(error => {
              console.error('❌ 원격 비디오 재생 실패:', error);
            });
          };
          
          remoteVideo.value.oncanplay = () => {
            console.log('✅ 원격 비디오 재생 준비됨');
          };
          
          remoteVideo.value.onerror = (error) => {
            console.error('❌ 원격 비디오 에러:', error);
          };
        } else {
          console.warn('⚠️ remoteVideo ref가 없습니다');
        }
        
        isConnected.value = true;
        console.log('✅ WebRTC 연결 완료');
      } else {
        console.error('❌ 원격 스트림이 없습니다');
      }
    };

    // 연결 상태 변경
    peerConnection.value.onconnectionstatechange = () => {
      console.log('🔗 연결 상태:', peerConnection.value.connectionState);
      if (peerConnection.value.connectionState === 'disconnected' || 
          peerConnection.value.connectionState === 'failed') {
        isConnected.value = false;
      }
    };

    // ICE 연결 상태 변경
    peerConnection.value.oniceconnectionstatechange = () => {
      console.log('🧊 ICE 연결 상태:', peerConnection.value.iceConnectionState);
    };

    // ICE 수집 상태 변경
    peerConnection.value.onicegatheringstatechange = () => {
      console.log('🧊 ICE 수집 상태:', peerConnection.value.iceGatheringState);
    };

    // 시그널링 상태 변경
    peerConnection.value.onsignalingstatechange = () => {
      console.log('📡 시그널링 상태:', peerConnection.value.signalingState);
    };
  };

  // Offer 처리 (보호자 측)
  const handleOffer = async (offer) => {
    try {
      console.log('📥 Offer 수신됨');
      await createPeerConnection();
      
      await peerConnection.value.setRemoteDescription(offer);
      console.log('✅ 원격 설명 설정 완료');
      
      // Answer 생성 및 전송
      const answer = await peerConnection.value.createAnswer();
      await peerConnection.value.setLocalDescription(answer);
      
      if (webSocketClient && webSocketClient.connected && currentCode) {
        webSocketClient.publish({
          destination: `/app/webrtc/answer/${currentCode}`,
          body: JSON.stringify({
            type: 'answer',
            sdp: answer.sdp
          })
        });
        console.log('📤 WebRTC Answer 전송됨');
      } else {
        console.error('❌ 웹소켓 연결이 없거나 코드가 없습니다. Answer 전송 실패');
      }
      
      // 대기 중인 ICE 후보들 처리
      if (peerConnection.value.pendingIceCandidates && peerConnection.value.pendingIceCandidates.length > 0) {
        console.log(`📥 대기 중인 ICE 후보 ${peerConnection.value.pendingIceCandidates.length}개 처리 중...`);
        for (const candidate of peerConnection.value.pendingIceCandidates) {
          try {
            await peerConnection.value.addIceCandidate(candidate);
            console.log('✅ 대기 중인 ICE 후보 추가 완료');
          } catch (error) {
            console.error('❌ 대기 중인 ICE 후보 추가 실패:', error);
          }
        }
        peerConnection.value.pendingIceCandidates = [];
      }
    } catch (error) {
      console.error('❌ Offer 처리 실패:', error);
    }
  };

  // Answer 처리 (사용자 측)
  const handleAnswer = async (answer) => {
    try {
      console.log('📥 Answer 수신됨:', answer);
      
      if (!peerConnection.value) {
        console.error('❌ 피어 연결이 없습니다');
        return;
      }
      
      await peerConnection.value.setRemoteDescription(answer);
      console.log('✅ 원격 설명 설정 완료');
      
      // 대기 중인 ICE 후보들 처리
      if (peerConnection.value.pendingIceCandidates && peerConnection.value.pendingIceCandidates.length > 0) {
        console.log(`📥 대기 중인 ICE 후보 ${peerConnection.value.pendingIceCandidates.length}개 처리 중...`);
        for (const candidate of peerConnection.value.pendingIceCandidates) {
          try {
            await peerConnection.value.addIceCandidate(candidate);
            console.log('✅ 대기 중인 ICE 후보 추가 완료');
          } catch (error) {
            console.error('❌ 대기 중인 ICE 후보 추가 실패:', error);
          }
        }
        peerConnection.value.pendingIceCandidates = [];
        console.log('✅ 모든 대기 중인 ICE 후보 처리 완료');
      }
    } catch (error) {
      console.error('❌ Answer 처리 실패:', error);
    }
  };

  // ICE 후보 처리
  const handleIceCandidate = async (candidate) => {
    try {
      console.log('📥 ICE 후보 수신됨');
      
      // 원격 설명이 설정되었는지 확인
      if (!peerConnection.value || !peerConnection.value.remoteDescription) {
        console.log('⏳ 원격 설명이 아직 설정되지 않음. ICE 후보를 대기열에 저장...');
        // ICE 후보를 대기열에 저장 (나중에 처리)
        if (!peerConnection.value.pendingIceCandidates) {
          peerConnection.value.pendingIceCandidates = [];
        }
        peerConnection.value.pendingIceCandidates.push(candidate);
        return;
      }
      
      await peerConnection.value.addIceCandidate(candidate);
      console.log('✅ ICE 후보 추가 완료');
    } catch (error) {
      console.error('❌ ICE 후보 처리 실패:', error);
    }
  };

  // 연결 종료 처리
  const handleEnd = () => {
    console.log('📥 연결 종료 요청 수신됨');
    
    // 즉시 상태 변경
    isSharing.value = false;
    isConnected.value = false;
    
    // 비디오 요소 정리
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = null;
      remoteVideo.value.load();
    }
    
    // 원격 스트림 정리
    if (remoteStream.value) {
      remoteStream.value.getTracks().forEach(track => track.stop());
      remoteStream.value = null;
    }
    
    console.log('✅ 연결 종료 처리 완료');
  };

  // 코드 업데이트 함수
  const updateCode = (newCode) => {
    currentCode = newCode;
    console.log('🔄 WebRTC 코드 업데이트됨:', newCode);
  };

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    stopScreenShare();
  });

  return {
    // 상태
    localStream,
    remoteStream,
    isSharing,
    isConnected,
    localVideo,
    remoteVideo,
    
    // 메서드
    startScreenShare,
    startConsoleShare,
    stopScreenShare,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleEnd,
    updateCode
  };
};
