// ─────────────────────────────────────────────────────────────
// 카카오맵 JS SDK 동적 로더 — 최초 1회만 <script> 삽입 후 재사용
// ─────────────────────────────────────────────────────────────

// kakao 전역은 SDK 가 주입하므로 any 로 취급
type KakaoNamespace = any

let loadPromise: Promise<KakaoNamespace> | null = null

export function loadKakaoMaps(): Promise<KakaoNamespace> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const w = window as unknown as { kakao?: any }
    if (w.kakao && w.kakao.maps) {
      resolve(w.kakao)
      return
    }

    const key = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!key) {
      reject(new Error('VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다 (.env 확인)'))
      return
    }

    const script = document.createElement('script')
    // autoload=false → kakao.maps.load 로 수동 초기화
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
    script.async = true
    script.onload = () => {
      const kakao = (window as unknown as { kakao: any }).kakao
      kakao.maps.load(() => resolve(kakao))
    }
    script.onerror = () => reject(new Error('카카오맵 SDK 로드에 실패했습니다'))
    document.head.appendChild(script)
  })

  return loadPromise
}
