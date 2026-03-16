// src/map/kakaoMap.js
export function loadKakaoMaps() {
  return new Promise((resolve, reject) => {
    // 이미 로드돼 있으면 바로 반환
    if (window.kakao?.maps?.LatLng) return resolve(window.kakao)

    const existing = document.querySelector('script[data-kakao-maps="true"]')
    if (existing) {
      // 스크립트는 있는데 아직 load가 안 끝난 경우를 대비
      const timer = setInterval(() => {
        if (window.kakao?.maps?.LatLng) {
          clearInterval(timer)
          resolve(window.kakao)
        }
      }, 50)
      setTimeout(() => {
        clearInterval(timer)
        reject(new Error('Kakao maps load timeout'))
      }, 8000)
      return
    }

    const script = document.createElement('script')
    script.dataset.kakaoMaps = 'true'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VUE_APP_KAKAO_MAP_KEY}&autoload=false`

    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error('kakao.maps.load not found (wrong script?)'))
        return
      }
      window.kakao.maps.load(() => {
        if (!window.kakao?.maps?.LatLng) {
          reject(new Error('LatLng not available after maps.load'))
          return
        }
        resolve(window.kakao)
      })
    }

    script.onerror = () => reject(new Error('Failed to load Kakao Maps script'))
    document.head.appendChild(script)
  })
}