/**
 * Segmented Bar Equalizer — 세그먼트 막대 이퀄라이저 비주얼 렌더링 엔진
 * 
 * 실제 하드웨어 오디오 분석기처럼 층층이 쌓인 네온 LED 블록과 물리적 피크 홀드(Floating Peak),
 * 그리고 하단 거울 반사(Reflection) 효과를 지원하며,
 * 시간 역산을 방지하는 무작위 시드 기반의 비선형 카오스 변조 시뮬레이션을 제공합니다.
 */

export interface EqualizerState {
  currentHeights: number[]; // 각 막대의 현재 높이 (0 ~ 1)
  peaks: number[];          // 각 막대의 피크 높이 (0 ~ 1)
  peakDelay: number[];      // 피크가 탑에 머무는 프레임 카운트
}

/**
 * 이퀄라이저 상태 객체를 생성합니다.
 */
export function createEqualizerState(numBars: number): EqualizerState {
  return {
    currentHeights: Array(numBars).fill(0.02),
    peaks: Array(numBars).fill(0.02),
    peakDelay: Array(numBars).fill(0)
  };
}

/**
 * 프레임 델타(dtMs) 및 무작위 시드에 맞춰 이퀄라이저 물리 엔진의 상태를 업데이트합니다.
 */
export function updateEqualizerState(
  state: EqualizerState,
  elapsedMs: number,
  dtMs: number,
  seed: number
): void {
  const numBars = state.currentHeights.length;
  const dtSec = Math.min(dtMs, 100) / 1000; // 프레임 드랍 시 튐 방지를 위해 dt 상한 100ms 제한
  
  for (let i = 0; i < numBars; i++) {
    const normI = i / (numBars - 1 || 1);
    
    // 저음역대(i가 작음)는 느리고 묵직하게, 고음역대(i가 큼)는 빠르고 가볍게 진동 속도 설정
    const speedFactor = 2.2 + normI * 9.5;
    const tScaled = (elapsedMs / 1000) * speedFactor + seed * 37.13 + i * 0.67;
    
    // 카오스적인 목표 높이 합성 (비동기 삼각함수 조합)
    let target = Math.sin(tScaled * 0.95) * 0.38 
               + Math.cos(tScaled * 1.63) * 0.28 
               + Math.sin(tScaled * 3.71) * 0.18
               + 0.15; // 최저 높이 보정 오프셋
               
    // 이퀄라이저 특유의 파르르 떨리는 지터(Jitter) 고밀도 노이즈 추가
    const jitter = Math.sin(tScaled * 8.77) * Math.cos(tScaled * 14.23) * 0.16;
    target += jitter;
    
    // 주파수 밴드 쉐이핑 (중음역대와 저음역대를 살짝 도드라지게)
    const ampScale = 0.48 + 0.52 * Math.sin(normI * Math.PI + 0.15);
    target *= ampScale;
    
    target = Math.max(0.02, Math.min(0.98, target));
    
    // 이징(Interpolation) 연산: 상승할 때는 급격히, 하강할 때는 부드럽게
    const current = state.currentHeights[i];
    const diff = target - current;
    const easeRate = diff > 0 ? 17.0 : 6.5; 
    state.currentHeights[i] = current + diff * (1 - Math.exp(-easeRate * dtSec));
    
    // ── 피크 홀드 및 낙하 물리 연산 ──
    if (state.currentHeights[i] >= state.peaks[i]) {
      state.peaks[i] = state.currentHeights[i];
      state.peakDelay[i] = 15; // 약 0.25초 동안 탑 홀딩
    } else {
      if (state.peakDelay[i] > 0) {
        state.peakDelay[i]--;
      } else {
        // 중력에 의한 가속 낙하 묘사
        const fallSpeed = 0.72; // 초당 0.72 유닛 속도로 낙하
        state.peaks[i] = Math.max(state.currentHeights[i], state.peaks[i] - fallSpeed * dtSec);
      }
    }
  }
}

/**
 * 세그먼트 위치 비율(0~1)로 Player 채널 색상을 반환합니다 (Cyan → Purple → Magenta).
 */
function getPlayerColor(ratio: number, alpha?: number): string {
  let r: number, g: number, b: number
  if (ratio < 0.5) {
    r = Math.round((150 - 0) * (ratio * 2))
    g = Math.round(240 + (70 - 240) * (ratio * 2))
    b = 255
  } else {
    r = Math.round(150 + (255 - 150) * ((ratio - 0.5) * 2))
    g = Math.round(70 + (0 - 70) * ((ratio - 0.5) * 2))
    b = Math.round(255 + (200 - 255) * ((ratio - 0.5) * 2))
  }
  return alpha !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${alpha})`
    : `rgb(${r}, ${g}, ${b})`
}

/**
 * 특정 영역(xOffset, yOffset, width, height) 내에 세그먼트 막대 이퀄라이저를 드로잉합니다.
 * @param progressLimit 가로 한계선 비율 (0 ~ 1, 이 비례 너머의 막대는 꺼진 프레임으로 렌더링)
 */
export function drawBarEqualizer(
  ctx: CanvasRenderingContext2D,
  xOffset: number,
  yOffset: number,
  width: number,
  height: number,
  state: EqualizerState,
  options: {
    isGhost?: boolean;
    progressLimit?: number;
  }
): void {
  const isGhost = options.isGhost ?? false;
  const progressLimit = options.progressLimit ?? 1.0;
  
  ctx.save();
  ctx.translate(xOffset, yOffset);
  
  const numBars = state.currentHeights.length;
  const barGap = 4; // 막대 사이의 가로 여백
  const barWidth = (width - (numBars - 1) * barGap) / numBars;
  
  const numSegments = 11; // 각 막대별 세로 그리드 칸수
  const segmentGap = 1.2; // LED 칸 사이의 세로 여백
  
  // 하단 거울 반사(Reflection)를 그리기 위한 대칭 기준선 설정
  const baselineY = height * 0.54;
  const maxBarHeight = baselineY - 6; // 상단 여백 확보
  const segmentHeight = (maxBarHeight - (numSegments - 1) * segmentGap) / numSegments;
  
  // 거울 반사의 세로 스케일 및 최대 세로 영역
  const reflectionMaxHeight = height - baselineY - 4;
  const reflectionScale = reflectionMaxHeight / maxBarHeight;
  
  for (let i = 0; i < numBars; i++) {
    // 결과 화면에서 가로 비교를 위해 progressLimit 바깥의 막대들은 비활성화(꺼진) 상태로 렌더링
    const isActive = (i / numBars) < progressLimit;
    
    const x = i * (barWidth + barGap);
    const h = state.currentHeights[i];
    const peak = state.peaks[i];
    
    const filledSegments = isActive ? Math.round(h * numSegments) : 0;
    const peakSegment = isActive ? Math.round(peak * numSegments) : 0;
    
    // ── 1. 메인 이퀄라이저 드로잉 (수직) ──
    for (let s = 0; s < numSegments; s++) {
      const isLit = s < filledSegments;
      const isPeak = s === (peakSegment - 1) && peakSegment > 0;
      
      let fillStyle = '';
      
      // 세그먼트 채우기 색상 결정
      if (!isLit && !isPeak) {
        // 꺼진(비활성화) LED 블록: 아주 희미한 가이드 프레임 처리
        fillStyle = isActive ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.015)';
      } else {
        if (isPeak) {
          // 최고점에 걸려 있는 피크 점: 백색에 가까운 밝은 네온 하이라이트
          fillStyle = isGhost ? 'rgba(255, 185, 225, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        } else {
          // 세로 위치 비율에 따른 단일 막대 그라데이션
          const ratio = s / (numSegments - 1 || 1);
          fillStyle = isGhost
            ? `rgba(255, 110, 195, ${0.45 + ratio * 0.45})`
            : getPlayerColor(ratio);
        }
      }
      
      ctx.fillStyle = fillStyle;
      const segmentY = baselineY - (s + 1) * (segmentHeight + segmentGap);
      ctx.fillRect(x, segmentY, barWidth, segmentHeight);
    }
    
    // ── 2. 하단 거울 반사(Mirror Reflection) 드로잉 ──
    for (let s = 0; s < numSegments; s++) {
      const isLit = s < filledSegments;
      if (!isLit) continue; // 켜진 세그먼트만 아래에 비춤
      
      const ratio = s / (numSegments - 1 || 1);
      
      // 대칭되는 Y축 아래 방향 좌표
      const reflectionY = baselineY + segmentGap + s * (segmentHeight * reflectionScale + segmentGap);
      
      // 아래로 내려갈수록 반사 광원이 급격히 페이드아웃되도록 감쇠 공식 적용
      const fadeRatio = 1.0 - (s / numSegments);
      const alphaMult = 0.32 * Math.pow(fadeRatio, 2.0); // 지수식 감쇠

      const fillStyle = isGhost
        ? `rgba(255, 110, 195, ${alphaMult})`
        : getPlayerColor(ratio, alphaMult);
      
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, reflectionY, barWidth, segmentHeight * reflectionScale);
    }
  }
  
  ctx.restore();
}
