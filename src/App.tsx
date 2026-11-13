import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import html from './landing.html?raw'
import './landing.css'
import { GhostFibers } from './components/reactbits/GhostFibers'
import { ClickSpark } from './components/reactbits/ClickSpark'
import { setupReactBitsEffects } from './components/reactbits/effects'

const MARKUP = { __html: html }

const ease = (t: number) => 1 - Math.pow(1 - t, 4)

function counterFormat(el: HTMLElement) {
  const dec = parseInt(el.dataset.dec || '0', 10)
  const pad = parseInt(el.dataset.pad || '0', 10)
  const pre = el.dataset.p || ''
  const suf = el.dataset.s || ''
  return (value: number) => pre + value.toFixed(dec).padStart(pad, '0') + suf
}

// Counters ship their final value in the HTML (readable without JS); with motion allowed
// they reset to zero and recount each time they scroll into view.
function runCounter(el: HTMLElement) {
  const end = parseFloat(el.dataset.c || '0')
  const format = counterFormat(el)
  const dur = 1600
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / dur)
    el.textContent = format(end * ease(p))
    if (p < 1) frame = requestAnimationFrame(tick)
  }
  let frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

// Short live readout shown under the flow map for each step (the 96/4 demo scenario, illustrative).
const FLOW_TOASTS = [
  ['Expected delivery: PO-1087', '100 tubes SikaFlex + 20 bags cement from Supplier A'],
  ['AI read the delivery note', '2 lines extracted · the receiver confirms each field'],
  ['Counted at the dock', 'Cement 20 · SikaFlex 96 good + 4 crushed'],
  ['Three-way match', 'Cement: match · SikaFlex: mismatch · batch expires in 20 days'],
  ['Flagged with evidence', 'Damaged · photo taken · driver confirms on screen'],
  ['Manager approved', 'Accept 96 · claim 4 · named approver'],
  ['Phiếu nhập kho issued', 'Lines, exceptions, receiver, approver, timestamps, evidence'],
  ['Inventory updated', 'SikaFlex +96 with batch & expiry · expiry alert set'],
] as const
const FLOW_STEP_MS = 4000

function setupFlow(root: HTMLElement, reduce: boolean) {
  const flow = root.querySelector<HTMLElement>('#flowModel')
  if (!flow) return () => {}
  const steps = Array.from(flow.querySelectorAll<HTMLLIElement>('#flowSteps li'))
  const marks = Array.from(flow.querySelectorAll<SVGElement>('[data-on]'))
  const motion = flow.querySelector<SVGAnimateMotionElement>('#packetMotion')
  const toast = flow.querySelector<HTMLElement>('#flowToast')
  const play = flow.querySelector<HTMLButtonElement>('#flowPlay')
  flow.style.setProperty('--step-ms', `${FLOW_STEP_MS}ms`)

  let index = 0
  let timer = 0
  let toastTimer = 0
  let paused = reduce
  let visible = false

  const go = (i: number) => {
    index = (i + steps.length) % steps.length
    const n = String(index + 1)
    flow.dataset.step = n
    steps.forEach((li, k) => li.classList.toggle('on', k === index))
    marks.forEach((m) => m.classList.toggle('on', (m.dataset.on || '').split(' ').includes(n)))

    const path = flow.querySelector<SVGPathElement>(`#${steps[index].dataset.path}`)
    if (motion && path && !reduce) {
      motion.setAttribute('path', path.getAttribute('d') || '')
      flow.classList.add('live')
      motion.beginElement()
    }
    flow.classList.remove('tick')
    void flow.offsetWidth // restart the hub pulse animation
    flow.classList.add('tick')

    if (toast) {
      const [title, detail] = FLOW_TOASTS[index]
      toast.classList.add('swap')
      clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => {
        toast.innerHTML = `<b>${title}</b><span>${detail}</span>`
        toast.classList.remove('swap')
      }, reduce ? 0 : 180)
    }
  }

  const schedule = () => {
    clearTimeout(timer)
    if (paused || !visible) return
    timer = window.setTimeout(() => {
      go(index + 1)
      schedule()
    }, FLOW_STEP_MS)
  }

  const setPaused = (p: boolean) => {
    paused = p
    flow.classList.toggle('paused', p)
    if (play) {
      play.textContent = p ? 'Play' : 'Pause'
      play.setAttribute('aria-pressed', String(p))
    }
    schedule()
  }

  const clicks = steps.map((li, k) => {
    const onClick = () => {
      go(k)
      schedule()
    }
    li.querySelector('button')?.addEventListener('click', onClick)
    return onClick
  })
  const onPlay = () => setPaused(!paused)
  play?.addEventListener('click', onPlay)

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    schedule()
  }, { threshold: 0.35 })
  io.observe(flow)

  go(0)
  setPaused(paused)

  return () => {
    clearTimeout(timer)
    clearTimeout(toastTimer)
    io.disconnect()
    play?.removeEventListener('click', onPlay)
    steps.forEach((li, k) => li.querySelector('button')?.removeEventListener('click', clicks[k]))
  }
}

declare global {
  interface Window {
    // Shared scroll-reveal/parallax helper from public/motion.js (loaded by index.html).
    VeloMotion?: { scan: (root?: HTMLElement) => void }
  }
}

function resolveTokenColor(expr: string, fallback: string) {
  const probe = document.createElement('span')
  probe.style.color = expr
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color || fallback
  probe.remove()
  return resolved
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const [heroFibersEl, setHeroFibersEl] = useState<HTMLElement | null>(null)
  const [fiberTheme, setFiberTheme] = useState({
    glowColor: 'rgb(95, 121, 255)',
    lineColor: 'rgb(74, 94, 200)',
    secondaryColor: 'rgb(59, 75, 158)',
  })

  useEffect(() => {
    const r = root.current
    if (!r) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const activeCounters = new Map<HTMLElement, () => void>()
    let disposed = false

    setFiberTheme({
      glowColor: resolveTokenColor('var(--violet)', 'rgb(95, 121, 255)'),
      lineColor: resolveTokenColor('color-mix(in srgb, var(--violet) 78%, var(--ink))', 'rgb(74, 94, 200)'),
      secondaryColor: resolveTokenColor('color-mix(in srgb, var(--violet) 62%, var(--ink))', 'rgb(59, 75, 158)'),
    })
    setHeroFibersEl(r.querySelector<HTMLElement>('#heroFibers'))
    const rbCleanup = setupReactBitsEffects(r, reduce)

    // Functional data triggers only (counters and charts), not decorative scroll reveals.
    const counters = Array.from(r.querySelectorAll<HTMLElement>('[data-c]'))
    if (!reduce) counters.forEach((el) => (el.textContent = counterFormat(el)(0)))
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          el.classList.add('in')
          io.unobserve(el)
        }),
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )
    r.querySelectorAll('.pcard, .phases').forEach((el) => io.observe(el))

    const counterIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target as HTMLElement
          if (e.isIntersecting) {
            el.classList.add('in')
            if (!reduce) {
              activeCounters.get(el)?.()
              activeCounters.set(el, runCounter(el))
            }
          } else if (!reduce) {
            activeCounters.get(el)?.()
            activeCounters.delete(el)
            el.textContent = counterFormat(el)(0)
          }
        }),
      { threshold: 0.15 },
    )
    counters.forEach((el) => counterIo.observe(el))

    const flowCleanup = setupFlow(r, reduce)
    // The landing markup is injected after public/motion.js ran its first pass.
    window.VeloMotion?.scan(r)

    // Scroll progress bar and the nav highlight pill, both GPU-composited transforms.
    const bar = r.querySelector<HTMLElement>('.progress')
    const navEl = r.querySelector<HTMLElement>('.nav')
    const ink = r.querySelector<HTMLElement>('.nav__ink')
    const navLinks = Array.from(r.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]'))

    const moveInk = (a?: HTMLElement | null) => {
      if (!ink) return
      if (!a) return void (ink.style.opacity = '0')
      ink.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth})`
      ink.style.opacity = '1'
    }
    let active: HTMLElement | null = null
    const hoverHandlers = navLinks.map((a) => {
      const enter = () => moveInk(a)
      const leave = () => moveInk(active)
      a.addEventListener('mouseenter', enter)
      a.addEventListener('mouseleave', leave)
      return { a, enter, leave }
    })

    // Mobile menu.
    const toggle = r.querySelector<HTMLButtonElement>('#navToggle')
    const menu = r.querySelector<HTMLElement>('#navLinks')
    const setMenu = (open: boolean) => {
      menu?.classList.toggle('open', open)
      toggle?.setAttribute('aria-expanded', String(open))
      toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    }
    const onToggle = () => setMenu(!menu?.classList.contains('open'))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu?.classList.contains('open')) {
        setMenu(false)
        toggle?.focus()
      }
    }
    const closeMenu = () => setMenu(false)
    toggle?.addEventListener('click', onToggle)
    navLinks.forEach((a) => a.addEventListener('click', closeMenu))
    addEventListener('keydown', onKey)

    // Hero: "Watch the introduction video" scrolls to the film and plays it (never under reduced motion).
    const watchBtn = r.querySelector<HTMLButtonElement>('#watchIntroBtn')
    const onWatch = () => {
      const video = r.querySelector<HTMLVideoElement>('#film video')
      if (!video) return
      video.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      if (reduce) return
      window.setTimeout(() => void video.play().catch(() => {}), 550)
    }
    watchBtn?.addEventListener('click', onWatch)

    // Hero: "Try the demo" offers the two ways in — use it yourself, or watch it unfold.
    const pickerBtn = r.querySelector<HTMLButtonElement>('#demoPickerBtn')
    const pickerMenu = r.querySelector<HTMLElement>('#demoPickerMenu')
    const setPicker = (open: boolean) => {
      if (pickerMenu) pickerMenu.hidden = !open
      pickerBtn?.setAttribute('aria-expanded', String(open))
    }
    const pickerOpen = () => pickerMenu?.hidden === false
    const onPicker = () => setPicker(!pickerOpen())
    const onPickerDoc = (e: MouseEvent) => {
      if (pickerOpen() && !pickerBtn?.parentElement?.contains(e.target as Node)) setPicker(false)
    }
    const onPickerKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pickerOpen()) { setPicker(false); pickerBtn?.focus() }
    }
    const onPickerLink = () => setPicker(false)
    pickerBtn?.addEventListener('click', onPicker)
    document.addEventListener('click', onPickerDoc)
    document.addEventListener('keydown', onPickerKey)
    pickerMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', onPickerLink))

    const onScroll = () => {
      const h = document.documentElement
      navEl?.classList.toggle('is-scrolled', scrollY > 12)
      const ratio = Math.min(1, Math.max(0, h.scrollTop / (h.scrollHeight - h.clientHeight || 1)))
      if (bar) bar.style.transform = `scaleX(${ratio})`
      let cur: HTMLElement | null = null
      for (const a of navLinks) {
        const sec = r.querySelector<HTMLElement>(a.getAttribute('href') || '')
        if (sec && sec.getBoundingClientRect().top < innerHeight * 0.4) cur = a
      }
      if (cur !== active) {
        active?.classList.remove('on')
        cur?.classList.add('on')
        active = cur
        moveInk(active)
      }
    }
    addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => {
      setMenu(false)
      moveInk(active)
      onScroll()
    }
    addEventListener('resize', onResize)
    onScroll()
    // React inserts the sections after the browser's initial fragment lookup.
    // Reapply the current fragment after fonts settle to avoid landing at the hero.
    void document.fonts.ready.then(() => {
      if (disposed || !location.hash) return
      try {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' })
      } catch {
        // An invalid fragment must not prevent the rest of the page from working.
      }
    })
    return () => {
      disposed = true
      io.disconnect()
      counterIo.disconnect()
      flowCleanup()
      rbCleanup()
      activeCounters.forEach((cancel) => cancel())
      activeCounters.clear()
      hoverHandlers.forEach(({ a, enter, leave }) => {
        a.removeEventListener('mouseenter', enter)
        a.removeEventListener('mouseleave', leave)
        a.removeEventListener('click', closeMenu)
      })
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      watchBtn?.removeEventListener('click', onWatch)
      pickerBtn?.removeEventListener('click', onPicker)
      document.removeEventListener('click', onPickerDoc)
      document.removeEventListener('keydown', onPickerKey)
      pickerMenu?.querySelectorAll('a').forEach((a) => a.removeEventListener('click', onPickerLink))
      removeEventListener('keydown', onKey)
      toggle?.removeEventListener('click', onToggle)
    }
  }, [])

  return (
    <>
      <div ref={root} dangerouslySetInnerHTML={MARKUP} />
      {heroFibersEl
        ? createPortal(
            <GhostFibers
              glowColor={fiberTheme.glowColor}
              lineColor={fiberTheme.lineColor}
              secondaryColor={fiberTheme.secondaryColor}
              layers={3}
              twist={1.2}
              threads={72}
              fiberStyle="dots"
              thickness={1.15}
              density={1.15}
              foldGlow={1.55}
              depthOfField={0.85}
              hoverEffect="focus"
              intro={true}
              mouseInteraction={true}
              lightMode={true}
              brightness={2.25}
              vignette={0.18}
              grain={0.04}
            />,
            heroFibersEl,
          )
        : null}
      <ClickSpark />
    </>
  )
}
