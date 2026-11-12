import { useEffect, useRef } from 'react'
import html from './landing.html?raw'
import './landing.css'

const ease = (t: number) => 1 - Math.pow(1 - t, 4)

function counterFormat(el: HTMLElement) {
  const dec = parseInt(el.dataset.dec || '0', 10)
  const pad = parseInt(el.dataset.pad || '0', 10)
  const pre = el.dataset.p || ''
  const suf = el.dataset.s || ''
  return (value: number) => pre + value.toFixed(dec).padStart(pad, '0') + suf
}

// Counters ship their final value in the HTML (readable without JS); with motion allowed
// they reset to zero on mount and count up once they scroll into view.
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

export default function App() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = root.current
    if (!r) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const counterCleanup: Array<() => void> = []
    let disposed = false

    // Functional data triggers only (counters and charts), not decorative scroll reveals.
    const counters = Array.from(r.querySelectorAll<HTMLElement>('[data-c]'))
    if (!reduce) counters.forEach((el) => (el.textContent = counterFormat(el)(0)))
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          el.classList.add('in')
          if (el.matches('[data-c]') && !reduce) counterCleanup.push(runCounter(el))
          io.unobserve(el)
        }),
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )
    r.querySelectorAll('.pcard, .phases, [data-c]').forEach((el) => io.observe(el))

    const flowCleanup = setupFlow(r, reduce)
    // The landing markup is injected after public/motion.js ran its first pass.
    window.VeloMotion?.scan(r)

    // Scroll progress bar and the nav highlight pill, both GPU-composited transforms.
    const bar = r.querySelector<HTMLElement>('.progress')
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

    const onScroll = () => {
      const h = document.documentElement
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
      flowCleanup()
      counterCleanup.forEach((cancel) => cancel())
      hoverHandlers.forEach(({ a, enter, leave }) => {
        a.removeEventListener('mouseenter', enter)
        a.removeEventListener('mouseleave', leave)
        a.removeEventListener('click', closeMenu)
      })
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      removeEventListener('keydown', onKey)
      toggle?.removeEventListener('click', onToggle)
    }
  }, [])

  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
}
