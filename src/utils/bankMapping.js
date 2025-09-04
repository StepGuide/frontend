// 은행 코드와 이미지를 매핑하는 유틸리티 함수

// 은행 이미지 import
import kbLogo from '@/assets/images/banks/kbbank.png'
import shinhanLogo from '@/assets/images/banks/shinhanbank.png'
import wooriLogo from '@/assets/images/banks/wooribank.png'
import hanaLogo from '@/assets/images/banks/kebhanabank.png'
import ibkLogo from '@/assets/images/banks/ibkbank.png'
import nhLogo from '@/assets/images/banks/nhbank.png'
import kakaoLogo from '@/assets/images/banks/kakaobank.png'
import tossLogo from '@/assets/images/banks/tossbank.png'

// 은행 코드와 이미지 매핑 객체
const bankImageMap = {
  // KB국민은행
  '004': kbLogo,
  '088': kbLogo,
  
  // 신한은행
  '088': shinhanLogo,
  
  // 우리은행
  '020': wooriLogo,
  
  // 하나은행
  '081': hanaLogo,
  
  // IBK기업은행
  '003': ibkLogo,
  
  // NH농협은행
  '011': nhLogo,
  
  // 카카오뱅크
  '090': kakaoLogo,
  
  // 토스뱅크
  '092': tossLogo,
}

// 은행 코드와 이름 매핑 객체
const bankNameMap = {
  '004': 'KB국민은행',
  '088': '신한은행',
  '020': '우리은행',
  '081': '하나은행',
  '003': 'IBK기업은행',
  '011': 'NH농협은행',
  '090': '카카오뱅크',
  '092': '토스뱅크',
}

/**
 * 은행 코드로 은행 이미지를 가져오는 함수
 * @param {string} bankCode - 은행 코드
 * @returns {string} 은행 이미지 URL
 */
export const getBankImage = (bankCode) => {
  return bankImageMap[bankCode] || kbLogo // 기본값으로 KB국민은행 이미지
}

/**
 * 은행 코드로 은행 이름을 가져오는 함수
 * @param {string} bankCode - 은행 코드
 * @returns {string} 은행 이름
 */
export const getBankName = (bankCode) => {
  return bankNameMap[bankCode] || 'KB국민은행' // 기본값으로 KB국민은행
}

/**
 * 계좌번호에서 은행 코드를 추출하는 함수
 * @param {string} accountNumber - 계좌번호
 * @returns {string} 은행 코드
 */
export const extractBankCode = (accountNumber) => {
  if (!accountNumber) return '004' // 기본값
  
  // 계좌번호 앞 3자리가 은행 코드인 경우
  const bankCode = accountNumber.substring(0, 3)
  
  // 유효한 은행 코드인지 확인
  if (bankNameMap[bankCode]) {
    return bankCode
  }
  
  // 기본값으로 KB국민은행 코드 반환
  return '004'
}

/**
 * 은행 정보 객체를 가져오는 함수
 * @param {string} bankCode - 은행 코드
 * @returns {object} 은행 정보 객체
 */
export const getBankInfo = (bankCode) => {
  return {
    code: bankCode,
    name: getBankName(bankCode),
    image: getBankImage(bankCode)
  }
}

export default {
  getBankImage,
  getBankName,
  extractBankCode,
  getBankInfo
}
