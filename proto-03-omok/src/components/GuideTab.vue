<template>
  <div class="guide-wrap">

    <section class="guide-section">
      <h2 class="guide-section-title">🎯 게임 목표</h2>
      <div class="guide-card">
        <p class="guide-text">가로·세로·대각선 방향으로 <strong>자신의 돌 5개를 연속으로</strong> 놓으면 승리합니다.</p>
        <p class="guide-text mt">흑(선수) vs 백(AI) 구도로, 플레이어는 항상 <strong>흑돌</strong>을 사용합니다.</p>
      </div>
    </section>

    <section class="guide-section">
      <h2 class="guide-section-title">📋 렌주룰 (금수)</h2>
      <p class="guide-sub-text">렌주룰은 흑돌에만 적용되는 규칙으로, 흑의 과도한 유리함을 방지합니다.</p>

      <div class="guide-rule-card">
        <div class="guide-rule-header">
          <span class="guide-badge guide-badge-error">금수</span>
          <span class="guide-rule-name">삼삼 (Double Three)</span>
        </div>
        <p class="guide-rule-desc">열린 3목이 두 방향 이상 동시에 만들어지는 위치에는 착수할 수 없습니다.</p>
        <div class="guide-example">
          <span class="guide-example-icon">예시</span>
          <span class="guide-example-text">●●_ 방향이 두 개 이상 교차하는 교점</span>
        </div>
      </div>

      <div class="guide-rule-card">
        <div class="guide-rule-header">
          <span class="guide-badge guide-badge-error">금수</span>
          <span class="guide-rule-name">사사 (Double Four)</span>
        </div>
        <p class="guide-rule-desc">4목이 두 방향 이상 동시에 만들어지는 위치에는 착수할 수 없습니다.</p>
        <div class="guide-example">
          <span class="guide-example-icon">예시</span>
          <span class="guide-example-text">●●●_ 방향이 두 개 이상 교차하는 교점</span>
        </div>
      </div>

      <div class="guide-rule-card">
        <div class="guide-rule-header">
          <span class="guide-badge guide-badge-error">금수</span>
          <span class="guide-rule-name">장목 (Overline)</span>
        </div>
        <p class="guide-rule-desc">6개 이상 연속으로 놓이는 위치에는 착수할 수 없습니다. 흑은 정확히 5개만 인정됩니다.</p>
        <div class="guide-example">
          <span class="guide-example-icon">예시</span>
          <span class="guide-example-text">●●●●●● (6목 이상) → 흑 패배</span>
        </div>
      </div>

      <div class="guide-info-box">
        <span class="guide-info-icon">💡</span>
        <p class="guide-info-text">금수 위치는 보드에 <strong>빨간 × 표시</strong>로 미리 보여집니다.</p>
      </div>
    </section>

    <section class="guide-section">
      <h2 class="guide-section-title">⏱️ 시간 제한</h2>
      <div class="guide-card">
        <p class="guide-text">플레이어는 <strong>1수당 10초</strong> 안에 착수해야 합니다.</p>
        <p class="guide-text mt">타이머가 0이 되면 자동으로 패배 처리됩니다.</p>
        <div class="guide-timer-tip">
          <div class="guide-timer-badge normal">10초</div>
          <span class="guide-arrow">→</span>
          <div class="guide-timer-badge warning">3초 이하</div>
          <span class="guide-arrow">→</span>
          <div class="guide-timer-badge danger">시간 초과 패배</div>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2 class="guide-section-title">🏆 스테이지 시스템</h2>
      <div class="guide-stage-list">
        <div class="guide-stage-item">
          <div class="guide-stage-badge stage-easy">1–5</div>
          <div class="guide-stage-info">
            <div class="guide-stage-label">입문 단계</div>
            <div class="guide-stage-desc">대부분 무작위 착수. 가볍게 연습용</div>
          </div>
        </div>
        <div class="guide-stage-item">
          <div class="guide-stage-badge stage-normal">6–12</div>
          <div class="guide-stage-info">
            <div class="guide-stage-label">중급 단계</div>
            <div class="guide-stage-desc">공격·방어 균형 AI. 실수를 놓치지 않음</div>
          </div>
        </div>
        <div class="guide-stage-item">
          <div class="guide-stage-badge stage-hard">13–17</div>
          <div class="guide-stage-info">
            <div class="guide-stage-label">고급 단계</div>
            <div class="guide-stage-desc">미니맥스 탐색 시작. 2~3수 앞을 계산</div>
          </div>
        </div>
        <div class="guide-stage-item">
          <div class="guide-stage-badge stage-expert">18–20</div>
          <div class="guide-stage-info">
            <div class="guide-stage-label">전문가 단계</div>
            <div class="guide-stage-desc">최대 깊이 탐색. 실력자용 최고 난이도</div>
          </div>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2 class="guide-section-title">💬 용어 설명</h2>
      <div class="guide-terms">
        <div class="guide-term-row">
          <span class="guide-term">3목</span>
          <span class="guide-term-desc">연속 3개로 양 끝이 열려있는 상태 (공격 시작)</span>
        </div>
        <div class="guide-term-row">
          <span class="guide-term">4목</span>
          <span class="guide-term-desc">연속 4개 — 한 수에 승리 가능한 위협</span>
        </div>
        <div class="guide-term-row">
          <span class="guide-term">5목</span>
          <span class="guide-term-desc">정확히 5개 연속 → 흑 승리 조건</span>
        </div>
        <div class="guide-term-row">
          <span class="guide-term">선수</span>
          <span class="guide-term-desc">첫 번째로 두는 플레이어 (흑)</span>
        </div>
      </div>
    </section>

  </div>
</template>
