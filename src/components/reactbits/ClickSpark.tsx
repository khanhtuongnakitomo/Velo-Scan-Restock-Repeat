import { useEffect, useRef } from 'react'

interface Spark {
  x: number
  y: number
  angle: number
  start: number
}

/** ReactBits-inspired ClickSpark canvas overlay using VELO Signal Violet. */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sparkColor = getComputedStyle(document.documentElement).getPropertyValue('--violet').trim() || 'currentColor'
    const sparkCount = 8
    const sparkRadius = 18
    const sparkSize = 7
    const duration = 340

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let running = false
    const sparks: Spark[] = []

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const easeOut = (t: number) => t * (2 - t)

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height)

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        const elapsed = now - s.start
        if (elapsed >= duration) {
          sparks.splice(i, 1)
          continue
        }
        const progress = elapsed / duration
        const eased = easeOut(progress)
        const dist = eased * sparkRadius
        const lineLen = sparkSize * (1 - eased)

        const x1 = s.x + dist * Math.cos(s.angle)
        const y1 = s.y + dist * Math.sin(s.angle)
        const x2 = s.x + (dist + lineLen) * Math.cos(s.angle)
        const y2 = s.y + (dist + lineLen) * Math.sin(s.angle)

        ctx.strokeStyle = sparkColor
        ctx.globalAlpha = 1 - progress * 0.85
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      if (sparks.length > 0) {
        raf = requestAnimationFrame(render)
      } else {
        running = false
      }
    }

    const onClick = (e: MouseEvent) => {
      const now = performance.now()
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          start: now,
        })
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(render)
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('click', onClick, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    />
  )
}
