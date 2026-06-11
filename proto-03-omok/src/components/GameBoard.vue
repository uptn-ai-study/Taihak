<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Board, LastMove } from '../types'
import { BOARD_SIZE } from '../lib/gomoku'

const props = defineProps<{
  board: Board
  lastMove: LastMove | null
  forbiddenCells: [number, number][]
  disabled: boolean
  urgent: boolean
}>()

const emit = defineEmits<{
  place: [r: number, c: number]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

function cellSize(): number {
  return (canvas.value?.width ?? 0) / BOARD_SIZE
}

function resize() {
  if (!canvas.value) return
  const avail = Math.min(window.innerWidth, 480) - 24
  const size = Math.min(avail, 400)
  canvas.value.width = size
  canvas.value.height = size
  draw()
}

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const cs = cellSize()
  const half = cs / 2

  // Board background
  ctx.fillStyle = '#C8943A'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(0, 0, el.width, el.height, 8)
  else ctx.rect(0, 0, el.width, el.height)
  ctx.fill()

  ctx.fillStyle = '#DCA95A'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(2, 2, el.width - 4, el.height - 4, 6)
  else ctx.rect(2, 2, el.width - 4, el.height - 4)
  ctx.fill()

  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 0.7
  for (let i = 0; i < BOARD_SIZE; i++) {
    const pos = cs * i + half
    ctx.beginPath(); ctx.moveTo(pos, half); ctx.lineTo(pos, el.height - half); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(half, pos); ctx.lineTo(el.width - half, pos); ctx.stroke()
  }

  // Star points
  ;([[3,3],[3,11],[7,7],[11,3],[11,11]] as [number,number][]).forEach(([r, c]) => {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.beginPath()
    ctx.arc(cs * c + half, cs * r + half, cs * 0.08, 0, Math.PI * 2)
    ctx.fill()
  })

  // Stones
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (props.board[r][c]) drawStone(ctx, r, c, cs, props.board[r][c] as 1 | 2)

  // Forbidden (33) indicators
  if (!props.disabled && props.forbiddenCells.length) {
    ctx.strokeStyle = 'rgba(239,68,68,0.7)'
    ctx.lineWidth = 1.5
    for (const [fr, fc] of props.forbiddenCells) {
      const x = cs * fc + half
      const y = cs * fr + half
      const r2 = cs * 0.22
      ctx.beginPath(); ctx.moveTo(x - r2, y - r2); ctx.lineTo(x + r2, y + r2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + r2, y - r2); ctx.lineTo(x - r2, y + r2); ctx.stroke()
    }
  }

  // Last move indicator
  if (props.lastMove) {
    const { r, c } = props.lastMove
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cs * c + half, cs * r + half, cs * 0.2, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawStone(ctx: CanvasRenderingContext2D, r: number, c: number, cs: number, player: 1 | 2) {
  const x = cs * c + cs / 2
  const y = cs * r + cs / 2
  const rad = cs * 0.43
  const g = ctx.createRadialGradient(x - rad * 0.32, y - rad * 0.32, rad * 0.05, x, y, rad)
  if (player === 1) { g.addColorStop(0, '#5a5a5a'); g.addColorStop(1, '#101010') }
  else { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cccccc') }

  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 2
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0

  if (player === 2) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.5; ctx.stroke()
  }
}

function getBoardPos(clientX: number, clientY: number): { r: number; c: number } {
  const el = canvas.value!
  const rect = el.getBoundingClientRect()
  const scaleX = el.width / rect.width
  const scaleY = el.height / rect.height
  const x = (clientX - rect.left) * scaleX
  const y = (clientY - rect.top) * scaleY
  const cs = cellSize()
  return { r: Math.floor(y / cs), c: Math.floor(x / cs) }
}

function onClick(e: MouseEvent) {
  if (props.disabled) return
  const { r, c } = getBoardPos(e.clientX, e.clientY)
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) emit('place', r, c)
}

function onTouch(e: TouchEvent) {
  e.preventDefault()
  if (props.disabled) return
  const t = e.changedTouches[0]
  const { r, c } = getBoardPos(t.clientX, t.clientY)
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) emit('place', r, c)
}

watch(() => [props.board, props.lastMove, props.forbiddenCells, props.disabled], draw, { deep: true })
onMounted(() => { resize(); window.addEventListener('resize', resize) })
onUnmounted(() => window.removeEventListener('resize', resize))
</script>

<template>
  <div class="board-wrap" :class="{ 'board-urgent': urgent }">
    <canvas
      ref="canvas"
      style="display:block;border-radius:8px;touch-action:none;cursor:pointer;"
      @click="onClick"
      @touchend="onTouch"
    />
  </div>
</template>

<style scoped>
.board-wrap { border-radius: 10px; line-height: 0; }
.board-urgent { animation: board-flash 0.6s ease-in-out infinite alternate; }
@keyframes board-flash {
  from { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0); }
  to   { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.55); }
}
</style>
