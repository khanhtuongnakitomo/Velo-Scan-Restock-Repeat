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
    '.sec-num', '.step', '.chain-item', '.match-box', '.status', '.formula', '.proof-item', '.scene-btn',
    '.kicker', '.status-note', '.big-quote', '.pill-cta',
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
    if (el.dataset.split === 'done') return
    var text = el.textContent.trim()
    el.setAttribute('aria-label', text)
    var wordIdx = 0
    function walk(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment()
        var parts = node.nodeValue.split(/(\s+)/)
        parts.forEach(function (part) {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part))
          } else {
            var s = document.createElement('span')
            s.className = 'w'
            s.setAttribute('aria-hidden', 'true')
            s.style.setProperty('--i', String(wordIdx++))
            s.textContent = part
            frag.appendChild(s)
          }
        })
        node.parentNode.replaceChild(frag, node)
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        Array.prototype.slice.call(node.childNodes).forEach(walk)
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(walk)
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
      if (el.matches('h1, .head h2, .sec-head h2, h2.h-left')) splitWords(el)
      else el.classList.add('rv')
      if (el.matches('img, figure, [class*="card"], .card, .member, .panel, [class*="tile"], .step, .match-box, .status, .proof-item, .chain-item')) el.classList.add('rv--scale')
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

  var RE_SKIP_EXT = /\.(png|jpe?g|svg|webp|gif|pdf|zip|json|txt)$/i
  var soloMode = /[?&]only=/.test(location.search)
  var inFrame = (function () { try { return window.self !== window.top } catch (e) { return true } })()
  var loaderEl = null
  var navPending = false
  var enterPlayed = false
  var loaderRaf = 0
  var shellFrame = null
  var shellActiveUrl = location.href
  var shellLoadToken = 0
  var currentRoutePath = location.pathname

  function routeLabel(url) {
    var p = (url.pathname || '/').toLowerCase()
    if (p.indexOf('/demo/app') >= 0) return 'Interactive App Demo'
    if (p.indexOf('/demo/screens') >= 0) return 'UI Screen Board'
    if (p.indexOf('/demo') >= 0) return '2-Minute Walkthrough'
    if (p.indexOf('/brand') >= 0) return 'Brand Assets'
    if (p.indexOf('/strategy') >= 0) return 'Product Strategy'
    if (p === '/' || p === '/index.html') return 'VELO Home'
    return 'VELO Vietnam'
  }

  function removeLoader() {
    cancelAnimationFrame(loaderRaf)
    navPending = false
    if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl)
    loaderEl = null
  }

  function setProgress(el, pct) {
    var v = Math.max(0, Math.min(100, pct))
    var fill = el.querySelector('.velo-loader__fill')
    var num = el.querySelector('.velo-loader__num')
    if (fill) fill.style.transform = 'scaleX(' + (v / 100).toFixed(4) + ')'
    if (num) num.textContent = String(Math.round(v)).padStart(2, '0')
  }

  function animateProgress(el, from, to, dur, onDone) {
    cancelAnimationFrame(loaderRaf)
    var t0 = performance.now()
    function tick(now) {
      if (!loaderEl) return
      var p = Math.min(1, (now - t0) / dur)
      var eased = 1 - Math.pow(1 - p, 3)
      setProgress(el, from + (to - from) * eased)
      if (p < 1) loaderRaf = requestAnimationFrame(tick)
      else if (onDone) onDone()
    }
    loaderRaf = requestAnimationFrame(tick)
  }

  function buildLoader(title, pathText, pct, instant) {
    removeLoader()
    var el = document.createElement('div')
    el.className = 'velo-loader' + (instant ? ' is-instant' : '')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-label', title)
    el.innerHTML =
      '<div class="velo-loader__inner">' +
        '<div class="velo-loader__top">' +
          '<span class="velo-loader__brand">VELO<i></i></span>' +
          '<span class="velo-loader__meta">' + (pathText || '/').toUpperCase() + '</span>' +
        '</div>' +
        '<div class="velo-loader__center"><div class="velo-loader__title">' + title + '</div></div>' +
        '<div class="velo-loader__foot">' +
          '<div class="velo-loader__track"><i class="velo-loader__fill"></i></div>' +
          '<div class="velo-loader__num">00</div>' +
        '</div>' +
      '</div>'
    document.body.appendChild(el)
    loaderEl = el
    setProgress(el, pct || 0)
    return el
  }

  function playEnterPreload() {
    if (inFrame || enterPlayed || reduce || soloMode || !document.body) return
    enterPlayed = true

    var saved = null
    try {
      var raw = sessionStorage.getItem('velo_preload')
      if (raw) {
        sessionStorage.removeItem('velo_preload')
        var parsed = JSON.parse(raw)
        if (parsed && Date.now() - parsed.ts < 6000) saved = parsed
      }
    } catch (err) {}

    var isSubpage = location.pathname !== '/' && location.pathname !== '/index.html'
    if (!saved && !isSubpage) return

    var title = saved ? saved.label : routeLabel(location)
    var pathText = saved ? saved.path : location.pathname
    var startPct = saved ? (saved.p || 55) : 0
    var el = buildLoader(title, pathText, startPct, true)

    var fontsReady = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 320) })])
      : Promise.resolve()
    var countDone = new Promise(function (resolve) {
      animateProgress(el, startPct, 100, saved ? 680 : 820, resolve)
    })

    Promise.all([fontsReady, countDone]).then(function () {
      if (!loaderEl) return
      el.classList.add('is-ready')
      setTimeout(function () {
        if (!loaderEl) return
        el.classList.remove('is-instant')
        el.classList.add('is-open')
        void el.offsetWidth
        el.classList.add('is-leaving')
        setTimeout(removeLoader, 660)
      }, 180)
    })
  }

  function syncRouteUi(pathname) {
    currentRoutePath = pathname || '/'
    if (inFrame || !document.body) return
    var lower = currentRoutePath.toLowerCase()
    document.body.classList.toggle('velo-on-walkthrough', lower.indexOf('/demo/index') >= 0)
    document.body.classList.toggle('velo-on-mobile-app', lower.indexOf('/demo/app') >= 0)
  }

  function postBgmStateToFrame() {
    if (!shellFrame || !shellFrame.contentWindow) return
    try {
      shellFrame.contentWindow.postMessage({
        type: 'velo:bgm-state',
        pref: bgmState.pref,
        active: bgmState.pref && bgmState.running && !document.hidden,
        awaiting: bgmState.pref && !bgmState.running,
      }, location.origin)
    } catch (err) {}
  }

  function releaseWebGL(rootDoc) {
    if (!rootDoc) return
    try {
      var canvases = rootDoc.querySelectorAll('canvas')
      for (var i = 0; i < canvases.length; i++) {
        var c = canvases[i]
        var gl = (c.getContext && (c.getContext('webgl2') || c.getContext('webgl'))) || null
        if (gl && !gl.isContextLost()) {
          var ext = gl.getExtension('WEBGL_lose_context')
          if (ext) ext.loseContext()
        }
      }
    } catch (err) {}
  }

  function mountShellFrame(targetHref, onLoaded) {
    var body = document.body
    if (!body) {
      if (onLoaded) onLoaded()
      return
    }
    if (bgmState.btn) {
      bgmState.btn.classList.remove('is-docked')
      if (bgmState.btn.parentNode !== body) body.appendChild(bgmState.btn)
    }
    if (!shellFrame) {
      releaseWebGL(document)
      var staleAnnotate = doc.querySelector('[data-annotate-ui]')
      if (staleAnnotate && staleAnnotate.parentNode) staleAnnotate.parentNode.removeChild(staleAnnotate)
      shellFrame = document.createElement('iframe')
      shellFrame.className = 'velo-frame'
      shellFrame.setAttribute('title', 'VELO')
      shellFrame.setAttribute('allow', 'autoplay')
      body.insertBefore(shellFrame, body.firstChild)
    } else {
      releaseWebGL(shellFrame.contentDocument)
    }
    var keep = [loaderEl, bgmState.btn, shellFrame]
    var child = body.firstChild
    while (child) {
      var next = child.nextSibling
      if (keep.indexOf(child) < 0) body.removeChild(child)
      child = next
    }
    doc.className = (reduce ? '' : 'motion ') + 'velo-shell'
    doc.removeAttribute('style')
    body.removeAttribute('style')
    syncRouteUi(new URL(targetHref, location.href).pathname)

    var token = ++shellLoadToken
    var settled = false
    var fallbackTimer = 0
    function finish() {
      if (settled || token !== shellLoadToken) return
      settled = true
      clearTimeout(fallbackTimer)
      shellFrame.removeEventListener('load', finish)
      try {
        var childDoc = shellFrame.contentDocument
        if (childDoc && childDoc.title) document.title = childDoc.title
      } catch (err) {}
      try {
        if (shellFrame.contentWindow) shellFrame.contentWindow.focus()
      } catch (err) {}
      postBgmStateToFrame()
      if (onLoaded) onLoaded()
    }
    shellFrame.addEventListener('load', finish)
    fallbackTimer = setTimeout(finish, 2500)
    shellFrame.src = targetHref
  }

  function navigateShell(href, opts) {
    if (inFrame) return
    var target
    try { target = new URL(href, shellActiveUrl) } catch (err) { return }
    if (target.origin !== location.origin) {
      location.assign(target.href)
      return
    }

    var shouldPush = !opts || opts.push !== false
    if (shouldPush) {
      try {
        if (!shellFrame) {
          history.replaceState({ veloShellUrl: shellActiveUrl }, '', shellActiveUrl)
        }
        history.pushState({ veloShellUrl: target.href }, '', target.href)
      } catch (err) {}
    }

    shellActiveUrl = target.href
    syncRouteUi(target.pathname)
    if (bgmState.running && bgmState.audio) {
      fadeBgmVolume(targetBgmVolume(target.pathname), 350)
    }

    if (reduce) {
      navPending = true
      mountShellFrame(target.href, function () {
        navPending = false
      })
      return
    }

    navPending = true
    var label = routeLabel(target)
    var el = buildLoader(label, target.pathname, 0, false)
    void el.offsetWidth
    requestAnimationFrame(function () {
      if (!loaderEl) return
      el.classList.add('is-open')
      animateProgress(el, 0, 55, 420)
    })

    setTimeout(function () {
      var loadTokenSnapshot = shellLoadToken + 1
      mountShellFrame(target.href, function () {
        if (!loaderEl) {
          navPending = false
          return
        }
        var doneClosing = false
        function closeLoader() {
          if (doneClosing) return
          doneClosing = true
          removeLoader()
        }
        // Hard cap so heavy WebGL/React pages cannot pin the preloader overlay
        setTimeout(function () {
          if (shellLoadToken === loadTokenSnapshot && loaderEl) closeLoader()
        }, 1250)
        animateProgress(el, 55, 100, 260, function () {
          if (!loaderEl) {
            navPending = false
            return
          }
          el.classList.add('is-ready')
          setTimeout(function () {
            if (!loaderEl) {
              navPending = false
              return
            }
            el.classList.add('is-leaving')
            setTimeout(closeLoader, 560)
          }, 90)
        })
      })
    }, 380)
  }

  function onLinkClick(e) {
    if (soloMode || e.defaultPrevented || e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!inFrame && navPending) return
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a) return
    if (a.hasAttribute('download') || (a.target && a.target !== '_self')) return
    var rawHref = a.getAttribute('href') || ''
    if (!rawHref || rawHref.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(rawHref)) return

    var target
    try { target = new URL(a.href, location.href) } catch (err) { return }
    if (target.origin !== location.origin) return
    if (target.pathname === location.pathname && target.search === location.search) return
    if (RE_SKIP_EXT.test(target.pathname)) return

    e.preventDefault()
    if (inFrame) {
      try {
        window.parent.postMessage({ type: 'velo:navigate', href: target.href }, location.origin)
      } catch (err) {
        location.assign(target.href)
      }
      return
    }

    navigateShell(target.href, { push: true })
  }

  // ---------- Ambient Background Music (studio chill lo-fi track shared across all pages) ----------
  var bgmState = {
    pref: (function () { try { return localStorage.getItem('velo_bgm') !== 'off' } catch (e) { return true } })(),
    audio: null,
    btn: null,
    fadeRaf: 0,
    running: false,
    restoredPos: false,
  }

  function targetBgmVolume(pathname) {
    // Soft ~26% volume across the website; ~18% on walkthrough so interaction SFX stays clear
    var path = pathname || currentRoutePath || location.pathname
    return path.indexOf('/demo/index') >= 0 ? 0.18 : 0.26
  }

  function applyBgmBtnState(b, pref, active, awaiting) {
    if (!b) return
    b.classList.toggle('is-playing', !!active)
    b.classList.toggle('is-awaiting', !!awaiting)
    b.setAttribute('aria-pressed', String(!!pref))
    var label = b.querySelector('.velo-bgm__label')
    if (label) {
      label.textContent = pref ? 'Music on' : 'Music off'
    }
  }

  function syncBgmBtn() {
    var active = bgmState.pref && bgmState.running && !document.hidden
    var awaiting = bgmState.pref && !bgmState.running
    applyBgmBtnState(bgmState.btn, bgmState.pref, active, awaiting)
    if (!inFrame) postBgmStateToFrame()
  }

  function fadeBgmVolume(to, dur, onDone) {
    var a = bgmState.audio
    if (!a) { if (onDone) onDone(); return }
    cancelAnimationFrame(bgmState.fadeRaf)
    var from = a.volume
    var t0 = performance.now()
    function tick(now) {
      var p = Math.min(1, (now - t0) / Math.max(1, dur))
      var eased = 1 - Math.pow(1 - p, 2)
      a.volume = Math.max(0, Math.min(1, from + (to - from) * eased))
      if (p < 1) bgmState.fadeRaf = requestAnimationFrame(tick)
      else if (onDone) onDone()
    }
    bgmState.fadeRaf = requestAnimationFrame(tick)
  }

  function saveBgmPos() {
    if (inFrame) return
    var a = bgmState.audio
    if (!a || !isFinite(a.currentTime)) return
    try { sessionStorage.setItem('velo_bgm_pos', String(a.currentTime.toFixed(2))) } catch (err) {}
  }

  function ensureBgmAudio() {
    if (inFrame) return null
    if (bgmState.audio) return bgmState.audio
    try {
      var a = new Audio('/assets/bgm.mp3')
      a.loop = true
      a.preload = 'metadata'
      a.volume = 0
      a.addEventListener('loadedmetadata', function () {
        if (bgmState.restoredPos) return
        bgmState.restoredPos = true
        try {
          var saved = parseFloat(sessionStorage.getItem('velo_bgm_pos') || '0')
          if (isFinite(saved) && saved > 0 && a.duration > 1) {
            a.currentTime = saved % a.duration
          }
        } catch (err) {}
      })
      a.addEventListener('play', function () { bgmState.running = true; syncBgmBtn() })
      a.addEventListener('pause', function () { bgmState.running = false; syncBgmBtn() })
      bgmState.audio = a
    } catch (err) {
      bgmState.audio = null
    }
    return bgmState.audio
  }

  function startBgmPlayback() {
    if (inFrame) return
    var a = ensureBgmAudio()
    if (!a || !bgmState.pref || document.hidden) return
    var playPromise
    try { playPromise = a.play() } catch (err) { return }
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        bgmState.running = true
        fadeBgmVolume(targetBgmVolume(), 950)
        syncBgmBtn()
      }).catch(function () {
        bgmState.running = false
        syncBgmBtn()
      })
    } else {
      bgmState.running = !a.paused
      if (bgmState.running) fadeBgmVolume(targetBgmVolume(), 950)
      syncBgmBtn()
    }
  }

  function pauseBgmPlayback() {
    if (inFrame) return
    var a = bgmState.audio
    if (!a) { syncBgmBtn(); return }
    saveBgmPos()
    fadeBgmVolume(0, 280, function () {
      if (!bgmState.pref || document.hidden) a.pause()
      bgmState.running = false
      syncBgmBtn()
    })
  }

  function tryStartBgm() {
    if (inFrame) return
    if (!bgmState.pref || document.hidden) {
      syncBgmBtn()
      return
    }
    startBgmPlayback()
  }

  function toggleBgm() {
    if (inFrame) {
      try { window.parent.postMessage({ type: 'velo:toggle-bgm' }, location.origin) } catch (err) {}
      return
    }
    bgmState.pref = !bgmState.pref
    try { localStorage.setItem('velo_bgm', bgmState.pref ? 'on' : 'off') } catch (err) {}
    if (bgmState.pref) tryStartBgm()
    else pauseBgmPlayback()
  }

  function mountBgmButton() {
    if (soloMode || bgmState.btn || !document.body) return
    var ctl = document.querySelector('.st-ctl')
    // Inside the persistent shell iframe, only render the walkthrough docked control toggle
    if (inFrame && !ctl) return

    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'velo-bgm'
    btn.id = 'veloBgmBtn'
    btn.setAttribute('aria-label', 'Toggle background music')
    btn.title = 'Toggle background music'
    btn.innerHTML =
      '<span class="velo-bgm__eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="velo-bgm__label">' + (bgmState.pref ? 'Music on' : 'Music off') + '</span>'

    if (ctl) {
      btn.classList.add('is-docked')
      var countEl = document.getElementById('count')
      if (countEl) ctl.insertBefore(btn, countEl)
      else ctl.appendChild(btn)
    } else {
      document.body.appendChild(btn)
    }
    bgmState.btn = btn
    btn.addEventListener('click', function (e) {
      e.stopPropagation()
      toggleBgm()
    })
    syncBgmBtn()
  }

  window.VeloMotion = {
    scan: function (root) {
      scan(root)
      if (!reduce) collectParallax(root)
    },
  }
  window.VeloBgm = {
    toggle: toggleBgm,
    isPlaying: function () { return bgmState.pref && bgmState.running },
  }

  document.addEventListener('click', onLinkClick)

  if (!reduce) {
    doc.classList.add('motion')
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('pageshow', function (e) {
      if (e.persisted) removeLoader()
    })
    if (document.body) playEnterPreload()
  }

  function unlockBgmOnGesture(e) {
    if (e && e.target && e.target.closest && e.target.closest('#veloBgmBtn')) return
    if (inFrame) {
      try { window.parent.postMessage({ type: 'velo:gesture' }, location.origin) } catch (err) {}
      return
    }
    if (bgmState.pref && !bgmState.running) tryStartBgm()
  }
  document.addEventListener('pointerdown', unlockBgmOnGesture, { capture: true, passive: true })
  document.addEventListener('click', unlockBgmOnGesture, { capture: true, passive: true })
  document.addEventListener('keydown', unlockBgmOnGesture, { capture: true, passive: true })

  if (!inFrame) {
    addEventListener('pagehide', saveBgmPos)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseBgmPlayback()
      else if (bgmState.pref) tryStartBgm()
    })
    addEventListener('message', function (e) {
      if (e.origin !== location.origin || !e.data) return
      if (e.data.type === 'velo:navigate' && e.data.href) {
        if (!navPending) navigateShell(e.data.href, { push: true })
      } else if (e.data.type === 'velo:toggle-bgm') {
        toggleBgm()
      } else if (e.data.type === 'velo:gesture') {
        if (bgmState.pref && !bgmState.running) tryStartBgm()
      }
    })
    addEventListener('popstate', function (e) {
      if (!shellFrame) return
      var dest = (e.state && e.state.veloShellUrl) || location.href
      var nextUrl
      var activeUrl
      try {
        nextUrl = new URL(dest, location.href)
        activeUrl = new URL(shellActiveUrl, location.href)
      } catch (err) { return }
      if (nextUrl.pathname === activeUrl.pathname && nextUrl.search === activeUrl.search) return
      navigateShell(nextUrl.href, { push: false })
    })
  } else {
    addEventListener('message', function (e) {
      if (e.origin !== location.origin || !e.data) return
      if (e.data.type === 'velo:bgm-state') {
        applyBgmBtnState(bgmState.btn, e.data.pref, e.data.active, e.data.awaiting)
      }
    })
  }

  function start() {
    window.VeloMotion.scan(document.body)
    syncRouteUi(location.pathname)
    playEnterPreload()
    mountBgmButton()
    tryStartBgm()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
