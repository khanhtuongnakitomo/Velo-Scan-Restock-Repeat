import { useEffect, useRef } from 'react'
import html from './landing.html?raw'
import './landing.css'

const ease = (t: number) => 1 - Math.pow(1 - t, 4)

function runCounter(el: HTMLElement) {
  const end = parseFloat(el.dataset.c || '0')
  const dec = parseInt(el.dataset.dec || '0', 10)
  const pad = parseInt(el.dataset.pad || '0', 10)
  const pre = el.dataset.p || ''
  const suf = el.dataset.s || ''
  const dur = 1600
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / dur)
    let v = (end * ease(p)).toFixed(dec)
    if (pad) v = v.padStart(pad, '0')
    el.textContent = pre + v + suf
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = root.current
    if (!r) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    // Tag scroll-reveal targets with a per-group stagger.
    const groups = r.querySelectorAll<HTMLElement>(
      'section h2, section .kicker, section > .wrap > p, .grid4, .grid3, .zgrid, .stats, .pain-grid, .points, details, .task, .quote, footer .wrap > *',
    )
    groups.forEach((g) => {
      if (g.matches('.grid4, .grid3, .zgrid, .stats, .pain-grid, .points')) {
        Array.from(g.children).forEach((c, i) => {
          const el = c as HTMLElement
          if (!el.classList.contains('pcard')) el.setAttribute('data-reveal', '')
          el.style.setProperty('--rd', `${i * 90}ms`)
        })
      } else g.setAttribute('data-reveal', '')
    })
    r.querySelectorAll<HTMLElement>('.pcard').forEach((c, i) => c.style.setProperty('--rd', `${(i % 4) * 110}ms`))

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          el.classList.add('in')
          el.querySelectorAll<HTMLElement>('[data-c]').forEach((c) => (reduce ? (c.textContent = (c.dataset.p || '') + c.dataset.c + (c.dataset.s || '')) : runCounter(c)))
          if (el.matches('[data-c]')) runCounter(el)
          io.unobserve(el)
        }),
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )
    r.querySelectorAll('[data-reveal], .pcard, .stat, .phases, .layers, [data-c]').forEach((el) => io.observe(el))

    // Scroll progress bar.
    const bar = r.querySelector<HTMLElement>('.progress')
    const nav = r.querySelector<HTMLElement>('.nav')
    const ink = r.querySelector<HTMLElement>('.nav__ink')
    const navLinks = Array.from(r.querySelectorAll<HTMLAnchorElement>('.nav__links a'))
    // Slide the nav highlight under the active (or hovered) link.
    const moveInk = (a?: HTMLElement | null) => {
      if (!ink) return
      if (!a) return void (ink.style.opacity = '0')
      ink.style.left = `${a.offsetLeft}px`
      ink.style.width = `${a.offsetWidth}px`
      ink.style.opacity = '1'
    }
    let active: HTMLElement | null = null
    navLinks.forEach((a) => {
      a.addEventListener('mouseenter', () => moveInk(a))
      a.addEventListener('mouseleave', () => moveInk(active))
    })
    const onScroll = () => {
      const h = document.documentElement
      if (bar) bar.style.width = `${(h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100}%`
      nav?.classList.toggle('is-scrolled', h.scrollTop > 12)
      let cur: HTMLElement | null = null
      for (const a of navLinks) {
        const sec = r.querySelector<HTMLElement>(a.getAttribute('href') || '')
        if (sec && sec.getBoundingClientRect().top < innerHeight * 0.4) cur = a
      }
      if (cur !== active) {
        active = cur
        moveInk(active)
      }
    }
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      io.disconnect()
      removeEventListener('scroll', onScroll)
    }
  }, [])

  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
}
