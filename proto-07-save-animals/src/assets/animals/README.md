# 동물 일러스트 슬롯

이 폴더는 각 동물의 실제 일러스트(AI 생성 예정)가 들어갈 자리입니다.
현재 MVP는 **등급별 색상 원 + 이모지 임시 그래픽**으로 동작하며,
아래 규칙대로 파일을 채워 넣으면 자동으로 이미지가 노출됩니다.
(로드 실패 시 이모지 폴백)

## 파일명 규칙

`{speciesId}.png` — 종 기준 1장

> 종의 등급은 **환경부 지정 멸종위기 야생생물 등급**과 연동됩니다.
> 등급 정의는 `src/config/gameConfig.ts` 의 `SPECIES` 참고.

### 일반 (비지정)

| speciesId | 이름 | 분류군 | 파일명 |
|---|---|---|---|
| cat | 길고양이 | 포유류 | `cat.png` |
| dog | 유기견 | 포유류 | `dog.png` |
| sparrow | 참새 | 조류 | `sparrow.png` |
| pigeon | 비둘기 | 조류 | `pigeon.png` |
| magpie | 까치 | 조류 | `magpie.png` |
| raccoon_dog | 너구리 | 포유류 | `raccoon_dog.png` |
| hedgehog | 고슴도치 | 포유류 | `hedgehog.png` |
| squirrel | 청설모 | 포유류 | `squirrel.png` |
| hare | 멧토끼 | 포유류 | `hare.png` |
| mallard | 청둥오리 | 조류 | `mallard.png` |

### 멸종위기 II급

| speciesId | 이름 | 분류군 | 파일명 |
|---|---|---|---|
| leopard_cat | 삵 | 포유류 | `leopard_cat.png` |
| marten | 담비 | 포유류 | `marten.png` |
| sea_lion | 큰바다사자 | 포유류 | `sea_lion.png` |
| eagle_owl | 수리부엉이 | 조류 | `eagle_owl.png` |
| frog | 맹꽁이 | 양서·파충류 | `frog.png` |
| rat_snake | 구렁이 | 양서·파충류 | `rat_snake.png` |
| pond_turtle | 남생이 | 양서·파충류 | `pond_turtle.png` |

### 멸종위기 I급

| speciesId | 이름 | 분류군 | 파일명 |
|---|---|---|---|
| tiger | 호랑이 | 포유류 | `tiger.png` |
| leopard | 표범 | 포유류 | `leopard.png` |
| black_bear | 반달가슴곰 | 포유류 | `black_bear.png` |
| otter | 수달 | 포유류 | `otter.png` |
| goral | 산양 | 포유류 | `goral.png` |
| fox | 여우 | 포유류 | `fox.png` |
| wolf | 늑대 | 포유류 | `wolf.png` |
| golden_eagle | 검독수리 | 조류 | `golden_eagle.png` |
| swan | 혹고니 | 조류 | `swan.png` |

## 이미지 스펙 권장
- 정사각형(1:1), 512×512 이상
- 배경 투명 PNG
- 친근한 캐릭터 톤

## 출처
멸종위기 등급은 국립생태원 「멸종위기 야생생물」 지정현황 기준
(총 282종 · I급 68종 / II급 214종) — https://www.nie.re.kr/nie/pgm/edSpecies/edSpeciesList.do?menuNo=200127
