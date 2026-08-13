// 가이드 범위를 넘어선 추가 기능 — 기온대별 러닝 복장 추천
export function clothingTip(temp) {
  if (temp >= 28) return '👕 민소매·반팔 + 얇은 반바지, 자외선 차단제는 필수예요.'
  if (temp >= 20) return '👕 반팔 + 반바지, 가벼운 복장이면 충분해요.'
  if (temp >= 12) return '🧥 긴팔 + 얇은 바람막이를 추천해요.'
  if (temp >= 5) return '🧥 기모 상의 + 바람막이, 장갑까지 챙기세요.'
  return '🧣 방한 자켓 + 장갑 + 넥워머로 보온에 신경 쓰세요.'
}
