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
      if (el.matches('img, figure, [class*="card"], .card, .member, .panel, .col, .road, .kpi, .bench > div, [class*="tile"], [class*="swatch"], .step, .match-box, .status, .proof-item, .chain-item')) el.classList.add('rv--scale')
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
  var loaderAscii = null
  var loaderProgress = 0
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
    loaderProgress = 0
    if (loaderAscii) {
      loaderAscii.dispose()
      loaderAscii = null
    }
    if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl)
    loaderEl = null
  }

  function setProgress(el, pct) {
    var v = Math.max(0, Math.min(100, pct))
    loaderProgress = v
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
      var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2 // easeInOutCubic: slow start, fast middle, slow end
      setProgress(el, from + (to - from) * eased)
      if (p < 1) loaderRaf = requestAnimationFrame(tick)
      else if (onDone) onDone()
    }
    loaderRaf = requestAnimationFrame(tick)
  }

  // Smooth velocity-continuous progress controller: climbs steadily during load
  // without sudden bursts, then glides smoothly into 100 once the frame is ready.
  function runLoaderProgress(el, onComplete) {
    cancelAnimationFrame(loaderRaf)
    var loaded = false
    var completed = false
    var vel = 14 // start slow; the profile below accelerates through the middle and eases into 86
    var last = performance.now()

    function tick(now) {
      if (!loaderEl) return
      var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      var targetVel
      if (!loaded) {
        targetVel = 18 + 104 * Math.sin(Math.PI * Math.min(1, loaderProgress / 86))
        vel += (targetVel - vel) * Math.min(1, dt * 6)
        setProgress(el, Math.min(86, loaderProgress + vel * dt))
      } else {
        var rem = 100 - loaderProgress
        targetVel = Math.min(110, Math.max(20, rem * 3.1))
        vel += (targetVel - vel) * Math.min(1, dt * 5)
        var next = loaderProgress + vel * dt
        if (next >= 99.6) {
          setProgress(el, 100)
          if (!completed) {
            completed = true
            onComplete()
          }
          return
        }
        setProgress(el, next)
      }
      loaderRaf = requestAnimationFrame(tick)
    }
    loaderRaf = requestAnimationFrame(tick)

    return function markLoaded() {
      loaded = true
    }
  }

  function buildLoader(title, pathText, pct, instant) {
    removeLoader()
    var el = document.createElement('div')
    el.className = 'velo-loader' + (instant ? ' is-instant' : '')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-label', title)
    el.innerHTML =
      '<div class="velo-loader__bg" aria-hidden="true"></div>' +
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
    var bg = el.querySelector('.velo-loader__bg')
    if (bg && window.VeloGradientASCII && !reduce) {
      loaderAscii = window.VeloGradientASCII.mount(bg, {
        colors: window.VeloGradientASCII.defaultVeloColors(true),
        shape: 'horizon',
        characters: ' =+xX0S8#@',
        cellSize: 18,
        density: 0.8,
        glyphOpacity: 0.78,
        gradientOpacity: 0.65,
        glow: 0.16,
        flicker: 0.2,
        softness: 0.52,
        scale: 1,
        flow: 0.55,
        speed: 1,
        grain: 0.06,
        mouseInteraction: true,
        scrambleRadius: 0.1,
        clickEffect: 'wave',
        lightMode: true,
        intro: !instant,
        introDuration: 0.55,
      })
    }
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
      animateProgress(el, startPct, 100, saved ? 680 : 800, resolve)
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
        setTimeout(removeLoader, 460)
      }, 90)
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
        if (c.closest && c.closest('.velo-loader')) continue
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
    if (bgmState.mediaHold) setMediaHold(false) // the page with the playing video is being replaced
    if (bgmState.btn) {
      bgmState.btn.classList.remove('is-docked')
      if (bgmState.btn.parentNode !== body) body.appendChild(bgmState.btn)
    }
    if (!shellFrame) {
      releaseWebGL(document)
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
    var doneClosing = false
    function closeLoader() {
      if (doneClosing) return
      doneClosing = true
      removeLoader()
    }
    var markLoaded = runLoaderProgress(el, function () {
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
        setTimeout(closeLoader, 460)
      }, 80)
    })

    void el.offsetWidth
    requestAnimationFrame(function () {
      if (!loaderEl) return
      el.classList.add('is-open')
    })

    setTimeout(function () {
      var loadTokenSnapshot = shellLoadToken + 1
      // Safety cap so slow/stalled routes cannot pin the overlay indefinitely
      setTimeout(function () {
        if (shellLoadToken === loadTokenSnapshot && loaderEl) closeLoader()
      }, 3000)
      mountShellFrame(target.href, function () {
        if (!loaderEl) {
          navPending = false
          return
        }
        markLoaded()
      })
    }, 200)
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
    // Silent while a page video (the promo film) is playing, so the two soundtracks never overlap.
    if (bgmState.mediaHold) return 0
    var path = pathname || currentRoutePath || location.pathname
    return path.indexOf('/demo/index') >= 0 ? 0.18 : 0.26
  }

  function setMediaHold(on) {
    if (inFrame) {
      try { window.parent.postMessage({ type: 'velo:media', playing: on }, location.origin) } catch (err) {}
      return
    }
    bgmState.mediaHold = on
    if (bgmState.audio && bgmState.running) fadeBgmVolume(targetBgmVolume(), on ? 280 : 950)
  }

  function onMediaEvent(e) {
    var t = e.target
    if (!t || t.tagName !== 'VIDEO') return
    if (e.type === 'play') { setMediaHold(true); return }
    var vids = document.querySelectorAll('video')
    for (var i = 0; i < vids.length; i++) if (!vids[i].paused && !vids[i].ended) return
    setMediaHold(false)
  }
  document.addEventListener('play', onMediaEvent, true)
  document.addEventListener('pause', onMediaEvent, true)
  document.addEventListener('ended', onMediaEvent, true)

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
      } else if (e.data.type === 'velo:media') {
        setMediaHold(!!e.data.playing)
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

  // ---------- Inertial Smooth Scroll + Gentle Proximity Section Snapping ----------
  function setupSmoothScroll() {
    if (reduce || soloMode) return
    var isTouchOnly = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    if (isTouchOnly) return

    var currentY = window.scrollY || window.pageYOffset || 0
    var targetY = currentY
    var lastAppliedY = currentY
    var rafId = 0
    var snapTimer = 0
    var lastTime = 0
    var programmatic = false
    var wheelActive = false
    var activeRate = 11.5
    var lastSnappedY = -1
    var lastWheelStamp = 0

    function maxScrollY() {
      return Math.max(0, doc.scrollHeight - window.innerHeight)
    }

    function isPageScrollable() {
      if (doc.classList.contains('velo-shell')) return false
      if (loaderEl) return false
      if (maxScrollY() <= 4) return false
      var bodyStyle = document.body ? getComputedStyle(document.body) : null
      if (getComputedStyle(doc).overflowY === 'hidden') return false
      if (bodyStyle && bodyStyle.overflowY === 'hidden') return false
      return true
    }

    function hasScrollableAncestor(node, dy) {
      for (var el = node; el && el !== document.body && el !== doc; el = el.parentElement) {
        if (el.hasAttribute && el.hasAttribute('data-no-smooth-scroll')) return true
        var style = getComputedStyle(el)
        var oy = style.overflowY
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true
          if (dy < 0 && el.scrollTop > 1) return true
        }
      }
      return false
    }

    function applyScrollY(y) {
      programmatic = true
      lastAppliedY = y
      var prevBehavior = doc.style.scrollBehavior
      doc.style.scrollBehavior = 'auto'
      try {
        window.scrollTo({ top: y, behavior: 'instant' })
      } catch (err) {
        window.scrollTo(0, y)
      }
      doc.style.scrollBehavior = prevBehavior
      programmatic = false
    }

    function getSnapOffset() {
      var pad = parseFloat(getComputedStyle(doc).scrollPaddingTop)
      return isFinite(pad) && pad > 0 ? pad : 88
    }

    function getSnapTargets() {
      var maxY = maxScrollY()
      var offset = getSnapOffset()
      var nodes = document.querySelectorAll('header.hero, main > section, section.section, section.band, footer.site-foot')
      var targets = [0]
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i]
        if (!el.getClientRects().length || el.offsetHeight < 180) continue
        var rect = el.getBoundingClientRect()
        var y = el.matches('header.hero')
          ? 0
          : Math.max(0, Math.min(maxY, Math.round(rect.top + (window.scrollY || 0) - offset)))
        if (targets.indexOf(y) < 0) targets.push(y)
      }
      if (targets.indexOf(maxY) < 0) targets.push(maxY)
      return targets
    }

    function scheduleSnap() {
      clearTimeout(snapTimer)
      snapTimer = setTimeout(function () {
        if (!isPageScrollable()) return
        if (Date.now() - lastWheelStamp < 140) {
          scheduleSnap()
          return
        }
        var maxY = maxScrollY()
        var threshold = Math.min(130, window.innerHeight * 0.16)
        var targets = getSnapTargets()
        var bestY = -1
        var bestDist = Infinity
        for (var i = 0; i < targets.length; i++) {
          var dist = Math.abs(targetY - targets[i])
          if (dist < bestDist) {
            bestDist = dist
            bestY = targets[i]
          }
        }
        if (bestY >= 0 && bestDist > 2 && bestDist <= threshold && Math.abs(bestY - lastSnappedY) > 4) {
          lastSnappedY = bestY
          targetY = Math.max(0, Math.min(maxY, bestY))
          activeRate = 9
          startLoop()
        }
      }, 170)
    }

    function tick(now) {
      rafId = 0
      var dt = lastTime ? Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)) : 1 / 60
      lastTime = now
      var diff = targetY - currentY
      if (Math.abs(diff) < 0.4) {
        currentY = targetY
        applyScrollY(currentY)
        lastTime = 0
        wheelActive = false
        return
      }
      currentY += diff * (1 - Math.exp(-dt * activeRate))
      applyScrollY(currentY)
      rafId = requestAnimationFrame(tick)
    }

    function startLoop() {
      if (!rafId) {
        lastTime = 0
        rafId = requestAnimationFrame(tick)
      }
    }

    function scrollToY(y, rate) {
      clearTimeout(snapTimer)
      if (!rafId) currentY = window.scrollY || window.pageYOffset || 0
      targetY = Math.max(0, Math.min(maxScrollY(), y))
      activeRate = rate || 9.5
      lastSnappedY = targetY
      startLoop()
    }

    window.addEventListener('wheel', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey) return
      if (!isPageScrollable()) return
      var dy = e.deltaY
      if (!dy) return
      if (e.deltaMode === 1) dy *= 18
      else if (e.deltaMode === 2) dy *= window.innerHeight * 0.85
      if (hasScrollableAncestor(e.target, dy)) return

      e.preventDefault()
      if (!wheelActive) {
        currentY = window.scrollY || window.pageYOffset || 0
        targetY = currentY
        wheelActive = true
      }
      targetY = Math.max(0, Math.min(maxScrollY(), targetY + dy))
      if (lastSnappedY >= 0 && Math.abs(targetY - lastSnappedY) > 64) lastSnappedY = -1
      activeRate = 11.5
      lastWheelStamp = Date.now()
      startLoop()
      scheduleSnap()
    }, { passive: false })

    window.addEventListener('scroll', function () {
      if (programmatic) return
      var y = window.scrollY || window.pageYOffset || 0
      if (rafId && Math.abs(y - lastAppliedY) <= 3) return
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
      clearTimeout(snapTimer)
      wheelActive = false
      currentY = y
      targetY = y
      lastAppliedY = y
    }, { passive: true })

    window.addEventListener('resize', function () {
      var maxY = maxScrollY()
      currentY = Math.min(currentY, maxY)
      targetY = Math.min(targetY, maxY)
    }, { passive: true })

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null
      if (!a || !isPageScrollable()) return
      var href = a.getAttribute('href') || ''
      if (!href) return
      if (href === '#') {
        e.preventDefault()
        scrollToY(0, 9.5)
        return
      }
      var id = ''
      try { id = decodeURIComponent(href.slice(1)) } catch (err) { id = href.slice(1) }
      var targetEl = id ? document.getElementById(id) : null
      if (!targetEl) return
      e.preventDefault()
      var y = id === 'top' || targetEl.matches('header.hero')
        ? 0
        : Math.round(targetEl.getBoundingClientRect().top + (window.scrollY || 0) - getSnapOffset())
      scrollToY(y, 9.5)
      try { history.pushState(null, '', href) } catch (err) {}
    })
  }

  function start() {
    window.VeloMotion.scan(document.body)
    syncRouteUi(location.pathname)
    playEnterPreload()
    mountBgmButton()
    tryStartBgm()
    setupSmoothScroll()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
