# 동물 일러스트 슬롯

이 폴더는 각 동물의 실제 일러스트(AI 생성 예정)가 들어갈 자리입니다.
현재 MVP는 **등급별 색상 원 + 이모지 임시 그래픽**으로 동작하며,
아래 규칙대로 파일을 채워 넣으면 자동으로 이미지가 노출됩니다.
(로드 실패 시 이모지 폴백)

## 파일명 규칙

`{speciesId}.png` — 종 기준 1장 (기본 사용)

| speciesId | 이름 | 파일명 |
|---|---|---|
| cat | 길고양이 | `cat.png` |
| dog | 유기견 | `dog.png` |
| rabbit | 토끼 | `rabbit.png` |
| bird | 참새 | `bird.png` |
| raccoon | 너구리 | `raccoon.png` |
| hedgehog | 고슴도치 | `hedgehog.png` |

## 등급별 변형(선택)

등급별로 다른 일러스트를 쓰고 싶다면 `{speciesId}_{grade}.png` 규칙을 권장합니다.
(예: `cat_common.png`, `dog_rare.png`, `raccoon_legendary.png`)
이 경우 `src/config/gameConfig.ts`의 `imageSlot` 및 `AnimalAvatar.vue` 로직을 함께 확장하세요.

## 이미지 스펙 권장
- 정사각형(1:1), 512×512 이상
- 배경 투명 PNG
- 친근한 캐릭터 톤
