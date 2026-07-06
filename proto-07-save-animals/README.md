# 위기 동물 구하기 (proto-07-save-animals)

위치 기반 앱테크 게임. 지도에서 내 주변 위기 동물을 구조하고, 메달을 모아 상품으로 교환한다.
이번 MVP의 목적은 **게임 루프의 재미와 매일 접속 리텐션 검증**.

## 기술 스택
- Vue 3 (`<script setup>`, Composition API) + TypeScript + Vite
- 지도: 카카오맵 JS SDK (`.env` 의 `VITE_KAKAO_MAP_KEY` 필요)
- 상태/저장: Pinia + localStorage (서버·로그인 없음)

## 실행
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입체크(vue-tsc) + 프로덕션 빌드
```

## 화면 (하단 탭 3개)
- **지도(홈)**: 내 위치 중심 Leaflet 지도 + 등급별 동물 마커, HUD(무료 구조/보유 메달/연속 출석)
- **앨범(도감)**: 구조 기록 목록 + 등급 필터 칩 + 상세(구조 일시/지역)
- **보상(메달샵)**: 보유 메달 + 상품 교환 목업(기부 옵션 포함)

## 핵심 설계 위치 (튜닝/이식 포인트)
| 목적 | 파일 |
|---|---|
| 확률·보상·비율·상품 상수 튜닝 | `src/config/gameConfig.ts` |
| 동물 좌표 생성 (순수 함수, 서버 이식 대상) | `src/services/animalSpawner.ts` |
| localStorage 캡슐화 (서버 API 교체 지점) | `src/services/storage.ts` |
| 위치 획득 + 동네명 역지오코딩 | `src/services/geo.ts` |
| 전역 게임 상태 | `src/stores/game.ts` |
| 데이터 모델 타입 | `src/types/index.ts` |

## 규칙 요약
- 동물 등급 3단계: 일반(90%/10) · 희귀(60%/40) · 전설(30%/150)
- 좌표는 **30분 window 시드**로 갱신 → 같은 window 내 새로고침 시 위치 동일
- 하루 무료 구조 5회, 6회차부터 광고 목업(3초) 시청 후 구조 (로컬 자정 리셋)
- 연속 출석 보너스 + 7일 특별 보너스 예고

## MVP Non-Goals (목업 처리)
- 로그인/서버/DB 없음 (localStorage)
- 실제 광고 SDK 없음 → 가짜 모달 + 3초 타이머
- 실제 상품 교환/결제 없음 → `alert` 목업

## 일러스트
`src/assets/animals/` 에 실제 AI 일러스트가 들어갈 자리. 파일이 없으면 등급색 원 + 이모지로 폴백.
파일명 규칙은 [assets/animals/README](src/assets/animals/README.md) 참고.

## Vercel 배포
Vercel New Project → 같은 레포 import → **Root Directory: `proto-07-save-animals`** → Deploy.
