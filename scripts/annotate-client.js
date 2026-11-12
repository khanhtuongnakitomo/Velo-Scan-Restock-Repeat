// Dev-only annotation overlay, injected by scripts/annotate-plugin.ts. Not part of the production build.
// Alt+A (or the "Annotate" button) toggles it. Click an element, describe the change, Save.
// Annotations go to .omp/annotations.json for the coding agent to read and apply.
(() => {
  if (window.__veloAnnotate) return
  window.__veloAnnotate = true

  const API = '/__annotate'
  const STYLE_KEYS = ['display', 'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'padding', 'margin', 'border', 'width', 'height']
  let items = []
  let active = false
  let hovered = null
  let draft = null

  const host = document.createElement('div')
  host.setAttribute('data-annotate-ui', '')
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647'
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `
    <style>
      *{box-sizing:border-box;font:500 13px/1.4 Inter,ui-sans-serif,system-ui,sans-serif}
      .bar{position:fixed;right:16px;bottom:16px;display:flex;gap:8px;pointer-events:auto;background:#fff;padding:6px;border-radius:100px;box-shadow:0 0 48px rgba(0,0,0,.1)}
      button{cursor:pointer;border:1px solid #a6a6a6;background:#fff;color:#000;padding:8px 14px;border-radius:100px}
      button.on{background:#fbdd65;border-color:#fbdd65}
      .box{position:fixed;border:2px solid #000;border-radius:8px;background:rgba(251,221,101,.18);display:none}
      .pin{position:fixed;width:22px;height:22px;display:grid;place-items:center;background:#fbdd65;color:#000;border:1px solid #000;border-radius:50%;pointer-events:auto;cursor:pointer;padding:0;font-size:11px}
      .panel{position:fixed;width:300px;background:#fff;border-radius:16px;box-shadow:0 0 48px rgba(0,0,0,.15);padding:14px;pointer-events:auto;display:none}
      .panel small{display:block;margin-bottom:8px;color:#707070;word-break:break-all;font-size:12px}
      textarea{width:100%;height:84px;border:1px solid #a6a6a6;border-radius:12px;background:#fff;padding:10px;font-weight:400;resize:vertical}
      .row{display:flex;gap:8px;margin-top:8px;justify-content:flex-end}
      .note{position:fixed;max-width:260px;background:#000;color:#fff;border-radius:12px;padding:10px 12px;pointer-events:auto;display:none;font-weight:400}
      .note button{margin-top:6px;padding:2px 10px;font-size:12px}
    </style>
    <div class="box"></div>
    <div class="panel"><small></small><textarea placeholder="What should change here?"></textarea><div class="row"><button data-act="cancel">Cancel</button><button class="on" data-act="save">Save</button></div></div>
    <div class="note"></div>
    <div class="bar"><button data-act="toggle">Annotate</button><button data-act="clear" title="Remove all annotations">Clear</button></div>
  `
  document.documentElement.appendChild(host)
  const $ = (s) => root.querySelector(s)
  const box = $('.box'), panel = $('.panel'), note = $('.note'), toggleBtn = $('[data-act=toggle]')
  const pins = []

  const isUi = (el) => el === host || host.contains(el)

  function selectorFor(el) {
    const unique = (sel) => { try { return document.querySelectorAll(sel).length === 1 } catch { return false } }
    const parts = []
    for (let node = el; node && node.nodeType === 1 && node !== document.documentElement; node = node.parentElement) {
      if (node.id && unique('#' + CSS.escape(node.id))) { parts.unshift('#' + CSS.escape(node.id)); break }
      let part = node.tagName.toLowerCase()
      const classes = [...node.classList].filter((c) => !/^(in|on|open|is-|has-)/.test(c)).slice(0, 2)
      if (classes.length) part += classes.map((c) => '.' + CSS.escape(c)).join('')
      const same = node.parentElement ? [...node.parentElement.children].filter((n) => n.tagName === node.tagName) : []
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`
      parts.unshift(part)
      if (unique(parts.join(' > '))) break
    }
    return parts.join(' > ')
  }

  function describe(el) {
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const section = el.closest('section[id], header[id], footer[id], [id]')
    return {
      page: location.pathname + location.hash,
      selector: selectorFor(el),
      section: section ? '#' + section.id : null,
      tag: el.tagName.toLowerCase(),
      classes: [...el.classList],
      text: (el.innerText || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 200),
      html: el.outerHTML.slice(0, 500),
      rect: { x: Math.round(rect.left + scrollX), y: Math.round(rect.top + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) },
      viewport: { width: innerWidth, height: innerHeight, scrollY: Math.round(scrollY) },
      styles: Object.fromEntries(STYLE_KEYS.map((k) => [k, cs[k]])),
    }
  }

  async function api(method, query = '', body) {
    const res = await fetch(API + query, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    if (!res.ok) throw new Error((await res.json()).error || res.statusText)
    return res.json()
  }

  function place(el, rect, width) {
    el.style.left = Math.max(8, Math.min(rect.left, innerWidth - width - 8)) + 'px'
    el.style.top = Math.max(8, Math.min(rect.bottom + 8, innerHeight - 200)) + 'px'
  }

  function renderPins() {
    pins.splice(0).forEach((p) => p.remove())
    items.forEach((item, i) => {
      let el = null
      try { el = document.querySelector(item.selector) } catch { /* stale selector: pin is skipped */ }
      if (!el) return
      const r = el.getBoundingClientRect()
      const pin = document.createElement('button')
      pin.className = 'pin'
      pin.textContent = String(i + 1)
      pin.style.left = Math.max(0, r.left - 6) + 'px'
      pin.style.top = Math.max(0, r.top - 6) + 'px'
      pin.addEventListener('mouseenter', () => {
        note.innerHTML = ''
        const text = document.createElement('div')
        text.textContent = item.comment
        const del = document.createElement('button')
        del.textContent = 'Delete'
        del.onclick = async () => { items = await api('DELETE', '?id=' + item.id); note.style.display = 'none'; renderPins() }
        note.append(text, del)
        note.style.display = 'block'
        place(note, r, 260)
      })
      root.appendChild(pin)
      pins.push(pin)
    })
  }

  function setActive(on) {
    active = on
    toggleBtn.classList.toggle('on', on)
    toggleBtn.textContent = on ? 'Annotating (Esc)' : 'Annotate'
    document.documentElement.style.cursor = on ? 'crosshair' : ''
    if (!on) { box.style.display = 'none'; closePanel() }
  }

  function closePanel() { draft = null; panel.style.display = 'none' }

  document.addEventListener('mousemove', (e) => {
    if (!active || draft) return
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el || isUi(el)) { box.style.display = 'none'; hovered = null; return }
    hovered = el
    const r = el.getBoundingClientRect()
    Object.assign(box.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' })
  }, true)

  document.addEventListener('click', (e) => {
    if (!active || isUi(e.target)) return
    e.preventDefault()
    e.stopPropagation()
    if (draft || !hovered) return
    draft = describe(hovered)
    panel.querySelector('small').textContent = `${draft.selector}${draft.text ? ' — "' + draft.text.slice(0, 60) + '"' : ''}`
    panel.querySelector('textarea').value = ''
    panel.style.display = 'block'
    place(panel, hovered.getBoundingClientRect(), 300)
    panel.querySelector('textarea').focus()
  }, true)

  root.addEventListener('click', async (e) => {
    const act = e.target.dataset && e.target.dataset.act
    if (act === 'toggle') setActive(!active)
    if (act === 'cancel') closePanel()
    if (act === 'clear') { items = await api('DELETE'); renderPins() }
    if (act === 'save' && draft) {
      const comment = panel.querySelector('textarea').value.trim()
      if (!comment) return
      items = [...items, await api('POST', '', { ...draft, comment })]
      closePanel()
      renderPins()
    }
  })

  addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'a') { e.preventDefault(); setActive(!active) }
    if (e.key === 'Escape' && active) setActive(false)
  })
  addEventListener('scroll', renderPins, { passive: true })
  addEventListener('resize', renderPins)

  api('GET').then((list) => { items = list; renderPins() }).catch(() => {})
})()
