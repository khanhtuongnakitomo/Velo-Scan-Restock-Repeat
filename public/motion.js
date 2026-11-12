/*
 * VELO shared motion — scroll reveals, hero word split, parallax. Loaded (defer) by every page with /motion.css.
 * Pages rendered later (the React landing page) call window.VeloMotion.scan(root) after mounting.
 * Product UI (phone mockups, demo stage, dashboards) is skipped: it has its own state-driven motion.
 */
;(function () {
  'use strict'
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  var doc = document.documentElement

  // Blocks that reveal as one unit; anything inside an already-picked block is skipped.
  var BLOCKS = [
    'h1', 'h2', 'h3', 'p', 'li', 'dt', 'dd', 'figure', 'img', 'table', 'pre', 'blockquote', 'article',
    '.card', '.panel', '.member', '.bench > div', '.col', '.road', '.chip', '.btn', '.cta', '.contact__row',
    '[class*="card"]', '[class*="tile"]', '[class*="swatch"]', '[class*="panel"]', '[data-reveal]',
  ].join(',')
  // Never touch these (and nothing inside them).
  var SKIP = [
    'nav', '.nav', '.topbar', '.pill', '.progress', '.skip-link', '.phone', '.stage', '.st-top', '#phone', '#dash', '#phones',
    '.db', '.ph-screen', '.flow__svg', '.flow__steps', '.flow__toast', '.strip', '.marquee', '.shapes', '[data-no-reveal]',
    'script', 'style', 'svg', '.sheet', '.toast', '.app-phone',
  ].join(',')

  var seen = new WeakSet()
  var io = reduce
    ? null
    : new IntersectionObserver(
        function (entries) {
          var batch = entries.filter(function (e) { return e.isIntersecting })
          batch.forEach(function (e, k) {
            var el = e.target
            el.style.setProperty('--rv-delay', Math.min(k * 70, 420) + 'ms')
            el.classList.add('rv-in')
            io.unobserve(el)
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -3% 0px' },
      )

  function splitWords(el) {
    if (el.dataset.split === 'done' || el.children.length) return
    var text = el.textContent.trim()
    el.setAttribute('aria-label', text)
    el.innerHTML = text.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + '</span>' }).join(' ')
    el.dataset.split = 'done'
    el.classList.add('split')
  }

  function scan(root) {
    if (reduce) return
    root = root || document.body
    var picked = []
    root.querySelectorAll(BLOCKS).forEach(function (el) {
      if (seen.has(el) || el.closest(SKIP)) return
      for (var p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) if (seen.has(p)) return
      if (!el.getClientRects().length) return
      seen.add(el)
      picked.push(el)
    })
    picked.forEach(function (el) {
      if (el.matches('h1') && !el.querySelector('*')) splitWords(el)
      else el.classList.add('rv')
      if (el.matches('img, figure, [class*="card"], .card, .member, .panel, [class*="tile"]')) el.classList.add('rv--scale')
      io.observe(el)
    })
  }

  // Parallax: decorative layers drift with scroll (data-parallax="0.15").
  var layers = []
  function collectParallax(root) {
    ;(root || document).querySelectorAll('[data-parallax]').forEach(function (el) {
      if (layers.indexOf(el) < 0) layers.push(el)
    })
  }

  var ticking = false
  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(function () {
      var y = scrollY
      layers.forEach(function (el) { el.style.setProperty('--py', (y * parseFloat(el.dataset.parallax || '0.15')).toFixed(1) + 'px') })
      // At the very bottom, anything still waiting (e.g. the last footer line) can never cross the margin: show it.
      if (innerHeight + y >= doc.scrollHeight - 2) {
        document.querySelectorAll('.rv:not(.rv-in), .split:not(.rv-in)').forEach(function (el) { el.classList.add('rv-in') })
      }
      ticking = false
    })
  }

  window.VeloMotion = {
    scan: function (root) {
      scan(root)
      if (!reduce) collectParallax(root)
    },
  }

  if (!reduce) {
    doc.classList.add('motion')
    addEventListener('scroll', onScroll, { passive: true })
  }
  function start() {
    window.VeloMotion.scan(document.body)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
