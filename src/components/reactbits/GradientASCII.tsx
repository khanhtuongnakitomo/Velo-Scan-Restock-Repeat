import { useEffect, useRef, type HTMLAttributes } from 'react'
import './GradientASCII.css'

export type GradientASCIIShape = 'horizon' | 'pinch' | 'rise' | 'eclipse'
export type GradientASCIIClickEffect = 'wave' | 'burst' | 'none'

export interface GradientASCIIOptions {
  colors?: string[]
  shape?: GradientASCIIShape
  characters?: string
  cellSize?: number
  density?: number
  glyphOpacity?: number
  gradientOpacity?: number
  glow?: number
  depthOfField?: number
  flicker?: number
  softness?: number
  scale?: number
  flow?: number
  speed?: number
  grain?: number
  variation?: number
  mouseInteraction?: boolean
  scrambleRadius?: number
  clickEffect?: GradientASCIIClickEffect
  intro?: boolean
  introDuration?: number
  lightMode?: boolean
  fontFamily?: string
  dpr?: number
}

export interface GradientASCIIProps
  extends GradientASCIIOptions,
    Omit<HTMLAttributes<HTMLDivElement>, 'color'> {}

interface GradientASCIIHandle {
  update: (options: GradientASCIIOptions) => void
  wake: () => void
  dispose: () => void
}

interface GradientASCIIGlobal {
  mount: (container: HTMLElement, options?: GradientASCIIOptions) => GradientASCIIHandle | null
}

declare global {
  interface Window {
    VeloGradientASCII?: GradientASCIIGlobal
  }
}

const DEFAULT_VELO_COLORS = [
  'var(--tint)',
  'color-mix(in srgb, var(--violet) 68%, var(--tint))',
  'var(--violet)',
  'color-mix(in srgb, var(--violet) 65%, var(--mint))',
]
const DEFAULT_CHARACTERS = ' =+xX0S8#@'
const DEFAULT_FONT = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

let scriptPromise: Promise<GradientASCIIGlobal | null> | null = null

function loadEngine(): Promise<GradientASCIIGlobal | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.VeloGradientASCII) return Promise.resolve(window.VeloGradientASCII)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = '/gradient-ascii.js'
    script.async = true
    script.onload = () => resolve(window.VeloGradientASCII || null)
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** React Bits GradientASCII WebGL2 component tuned for VELO design tokens. */
export function GradientASCII({
  colors = DEFAULT_VELO_COLORS,
  shape = 'horizon',
  characters = DEFAULT_CHARACTERS,
  cellSize = 18,
  density = 0.8,
  glyphOpacity = 0.85,
  gradientOpacity = 0.9,
  glow = 0.2,
  depthOfField = 0,
  flicker = 0.2,
  softness = 0.5,
  scale = 1,
  flow = 0.5,
  speed = 1,
  grain = 0.08,
  variation = 0,
  mouseInteraction = true,
  scrambleRadius = 0.1,
  clickEffect = 'wave',
  intro = true,
  introDuration,
  lightMode = true,
  fontFamily = DEFAULT_FONT,
  dpr,
  className = '',
  style,
  ...rest
}: GradientASCIIProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<GradientASCIIHandle | null>(null)

  const options: GradientASCIIOptions = {
    colors,
    shape,
    characters,
    cellSize,
    density,
    glyphOpacity,
    gradientOpacity,
    glow,
    depthOfField,
    flicker,
    softness,
    scale,
    flow,
    speed,
    grain,
    variation,
    mouseInteraction,
    scrambleRadius,
    clickEffect,
    intro,
    introDuration,
    lightMode,
    fontFamily,
    dpr,
  }
  const latestOptions = useRef(options)
  latestOptions.current = options

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    let active = true
    void loadEngine().then((engine) => {
      if (!active || !engine) return
      handleRef.current = engine.mount(container, latestOptions.current)
    })
    return () => {
      active = false
      handleRef.current?.dispose()
      handleRef.current = null
    }
  }, [])

  useEffect(() => {
    handleRef.current?.update(options)
  })

  return (
    <div
      ref={containerRef}
      className={`gradient-ascii-container${className ? ` ${className}` : ''}`}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="gradient-ascii-canvas" aria-hidden="true" />
    </div>
  )
}

export default GradientASCII
