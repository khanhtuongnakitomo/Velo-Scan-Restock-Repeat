import { useEffect, useRef } from 'react'

type RGB = [number, number, number]

function parseCssColor(value: string, fallback: RGB): RGB {
  const s = value.trim()
  if (s.startsWith('rgb')) {
    const m = s.match(/\d+/g)
    if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])]
  }
  if (s.length === 7 && s.charCodeAt(0) === 35) {
    return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]
  }
  return fallback
}

interface Dot {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  glow: number
}

interface Wave {
  x: number
  y: number
  r: number
  alpha: number
}

/** ReactBits-inspired interactive DotGrid canvas tuned to VELO design tokens. */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const styles = getComputedStyle(document.documentElement)
    const baseRgb = parseCssColor(styles.getPropertyValue('--mist'), [166, 166, 166])
    const activeRgb = parseCssColor(styles.getPropertyValue('--violet'), [95, 121, 255])
    const mintRgb = parseCssColor(styles.getPropertyValue('--mint'), [1, 254, 147])

    const spacing = 30
    const baseRadius = 1.4
    const proximity = 155
    const shockRadius = 240

    let width = 0
    let height = 0
    let dpr = 1
    let dots: Dot[] = []
    const waves: Wave[] = []
    const pointer = { x: -9999, y: -9999, inside: false }
    let raf = 0
    let active = false

    const buildGrid = () => {
      const rect = host.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.floor(width / spacing)
      const rows = Math.floor(height / spacing)
      const offsetX = (width - (cols - 1) * spacing) / 2
      const offsetY = (height - (rows - 1) * spacing) / 2

      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing
          const y = offsetY + r * spacing
          dots.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0, glow: 0 })
        }
      }
      drawFrame()
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height)
      let needsMore = false

      // Edge radial fade mask factor so dots gently dissolve toward edges
      const cx = width * 0.5
      const cy = height * 0.48
      const maxDist = Math.hypot(cx, cy) || 1

      for (let w = waves.length - 1; w >= 0; w--) {
        const wave = waves[w]
        wave.r += 11
        wave.alpha *= 0.93
        if (wave.alpha < 0.02 || wave.r > shockRadius * 1.4) {
          waves.splice(w, 1)
        } else {
          needsMore = true
        }
      }

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        let targetGlow = 0

        if (!reduce && pointer.inside) {
          const dx = d.x - pointer.x
          const dy = d.y - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < proximity) {
            const t = 1 - dist / proximity
            targetGlow = t * t
          }
        }

        // Apply click shockwaves
        for (let w = 0; w < waves.length; w++) {
          const wave = waves[w]
          const dx = d.x - wave.x
          const dy = d.y - wave.y
          const dist = Math.hypot(dx, dy)
          const ring = Math.abs(dist - wave.r)
          if (ring < 42 && dist > 1) {
            const impulse = (1 - ring / 42) * wave.alpha * 1.6
            d.vx += (dx / dist) * impulse
            d.vy += (dy / dist) * impulse
            targetGlow = Math.max(targetGlow, (1 - ring / 42) * wave.alpha)
          }
        }

        // Spring physics back to rest position
        d.vx = (d.vx - d.ox * 0.14) * 0.78
        d.vy = (d.vy - d.oy * 0.14) * 0.78
        d.ox += d.vx
        d.oy += d.vy
        d.glow += (targetGlow - d.glow) * 0.18

        if (
          Math.abs(d.ox) > 0.05 ||
          Math.abs(d.oy) > 0.05 ||
          Math.abs(d.vx) > 0.05 ||
          Math.abs(d.vy) > 0.05 ||
          Math.abs(targetGlow - d.glow) > 0.01 ||
          d.glow > 0.01
        ) {
          needsMore = true
        }

        const edgeFade = Math.max(0.15, 1 - (Math.hypot(d.x - cx, d.y - cy) / maxDist) * 0.85)
        const g = Math.min(1, d.glow)
        const r = Math.round(baseRgb[0] + (activeRgb[0] - baseRgb[0]) * g)
        const gr = Math.round(baseRgb[1] + (activeRgb[1] - baseRgb[1]) * g)
        const b = Math.round(baseRgb[2] + (activeRgb[2] - baseRgb[2]) * g)
        const alpha = (0.26 + g * 0.62) * edgeFade
        const radius = baseRadius + g * 1.9

        ctx.beginPath()
        ctx.arc(d.x + d.ox, d.y + d.oy, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${gr}, ${b}, ${alpha.toFixed(3)})`
        ctx.fill()
      }

      // Subtle mint shockwave ring
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w]
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${mintRgb[0]}, ${mintRgb[1]}, ${mintRgb[2]}, ${(wave.alpha * 0.35).toFixed(3)})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (needsMore && !reduce) {
        raf = requestAnimationFrame(drawFrame)
      } else {
        active = false
      }
    }

    const ensureLoop = () => {
      if (reduce || active) return
      active = true
      raf = requestAnimationFrame(drawFrame)
    }

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside = true
      ensureLoop()
    }

    const onLeave = () => {
      pointer.inside = false
      ensureLoop()
    }

    const onClick = (e: MouseEvent) => {
      if (reduce) return
      const rect = host.getBoundingClientRect()
      waves.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 4,
        alpha: 1,
      })
      ensureLoop()
    }

    const ro = new ResizeObserver(buildGrid)
    ro.observe(host)
    buildGrid()

    if (!reduce) {
      host.addEventListener('pointermove', onMove, { passive: true })
      host.addEventListener('pointerleave', onLeave)
      host.addEventListener('click', onClick)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('click', onClick)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
}
