/*
 * Velo demo UI — renders the receiver phone app and the manager dashboard as HTML strings.
 * Shared by index.html (demo player), app.html (interactive) and screens.html (screen board).
 * Scenario: one delivery, three-way match, one planted discrepancy. All data is illustrative.
 * Classic script (not a module) so the pages also work when opened straight from disk.
 */
;(function (global) {
  'use strict'

  const LOGO = '../assets/Logo.png'

  /* ================= scenario data ================= */

  const D = {
    date: 'THU 12 NOV 2026',
    warehouse: 'Kho Bình Tân',
    supplier: 'Supplier A',
    note: 'DN-2481',
    po: 'PO-1087',
    receipt: 'PNK-20261112-01',
    claim: 'CL-2481-01',
    receiver: 'Lan T.',
    manager: 'Minh N.',
    driver: 'Hùng',
    lines: [
      { sku: 'SKF-11FC-600', name: 'SikaFlex-11FC 600 ml sealant', short: 'SikaFlex-11FC', raw: 'Keo Sika 11FC 600ml', rawUnit: 'tuýp', unit: 'tube', ean: '8 936041 230115',
        ordered: 100, claimed: 100, good: 96, dmg: 4, batch: 'L2406-A', exp: '02 Dec 2026', days: 20, conf: 96 },
      { sku: 'PCB40-50', name: 'PCB40 cement 50 kg', short: 'PCB40 cement', raw: 'Xi măng PCB40 bao 50kg', rawUnit: 'bao', unit: 'bag', ean: '8 936041 250021',
        ordered: 20, claimed: 20, good: 20, dmg: 0, batch: 'XM-1108', exp: '10 Feb 2027', days: 90, conf: 88 },
    ],
  }

  const STATUS = {
    match: ['✓ MATCH', 'v-chip--ok'],
    attn: ['! ATTENTION', 'v-chip--attn'],
    miss: ['✕ MISMATCH', 'v-chip--alert'],
  }
  const chip = (st, extra) => `<span class="v-chip ${STATUS[st][1]}">${extra || STATUS[st][0]}</span>`

  /* Deterministic three-way match for one line. Ordered vs claimed vs received (good) + damaged. */
  function matchOf(l, good, dmg) {
    const issues = []
    let st = 'match'
    if (dmg > 0) { st = 'miss'; issues.push('dmg') }
    if (good + dmg < l.claimed) { if (st === 'match') st = (l.claimed - good - dmg) / l.claimed > 0.1 ? 'miss' : 'attn'; issues.push('short') }
    else if (good + dmg > l.claimed) { if (st === 'match') st = (good + dmg - l.claimed) / l.claimed > 0.1 ? 'miss' : 'attn'; issues.push('over') }
    if (st === 'match' && l.claimed !== l.ordered) st = 'attn'
    const near = l.days <= 30
    if (near) issues.push('exp')
    return { st, issues, near }
  }

  /* ================= phone ================= */

  const ICON = {
    deliveries: '<path d="M3 5h2M8 5h9M3 10h2M8 10h9M3 15h2M8 15h9"/>',
    scan: '<path d="M2 6V2h4M14 2h4v4M18 14v4h-4M6 18H2v-4M6 6v8M9 6v8M12 6v8M14 6v8"/>',
    match: '<path d="M3 5l2 2 3-3M10 5h7M3 11l2 2 3-3M10 11h7M3 17h14"/>',
    receipt: '<path d="M5 2h10v16l-2-1.5L10 18l-3-1.5L5 18zM8 6h4M8 10h4"/>',
  }
  const TABS = [['deliveries', 'DELIVERIES'], ['scan', 'SCAN'], ['match', 'MATCH'], ['receipt', 'RECEIPT']]

  function shell({ time, zone, tab, main, back, who }) {
    const nav = tab === false
      ? ''
      : `<nav class="ph-tabs">${TABS.map(([k, l]) => `<button class="ph-tab${k === tab ? ' on' : ''}" data-tab="${k}"><svg viewBox="0 0 20 20" aria-hidden="true">${ICON[k]}</svg>${l}</button>`).join('')}</nav>`
    return `
      <div class="ph-status"><b>${time}</b><span class="ph-island"></span><span class="ph-sys"><span class="ph-sig"><i></i><i></i><i></i><i></i></span><span class="ph-bat"><i></i></span></span></div>
      <div class="ph-top">${back ? '<button class="ph-back" data-act="back" aria-label="Back">←</button>' : ''}<span class="ph-brand"><img src="${LOGO}" alt=""><b>VELO</b></span><span class="v-chip v-chip--pastel">${zone}</span><button class="ph-me" data-act="menu" aria-label="Demo menu">${who || 'LT'}</button></div>
      <div class="ph-main${tab === false ? ' is-bare' : ''}">${main}</div>
      ${nav}
      <span class="ph-home"></span>`
  }

  function taskList(rows) {
    return `<ol class="ph-tasks">${rows
      .map(
        (r, i) => `<li class="ph-task${r.st ? ' is-' + r.st : ''} v-in v-in-${Math.min(i + 2, 5)}"${r.act ? ` data-act="${r.act}"${r.tap ? ` data-tap="${r.tap}"` : ''} role="button" tabindex="0"` : ''}>
          <span class="ph-task__n">${r.st === 'done' ? '✓' : r.n}</span>
          <div><b>${r.title}</b><span>${r.sub}</span></div>
          <span class="v-chip${r.st === 'now' ? ' v-chip--deep' : ''}">${r.tag}</span></li>`,
      )
      .join('')}</ol>`
  }

  function barcode(digits) {
    const widths = '211213111321211231112113121321112211313121112312'
    let bars = ''
    for (let i = 0; i < widths.length; i++) {
      bars += `<i style="width:${widths[i] * 2.2}px${i % 2 ? ';background:transparent' : ''}"></i>`
    }
    return `<div class="bc"><div class="bc__bars">${bars}</div><span>${digits}</span></div>`
  }

  /* ---- form rules: one source for the static screens (screens.html) and the interactive prototype (app.html) ---- */
  const MAXQ = 999
  const wholeMsg = (l) => `Enter a whole number, like ${l.good}. Letters and decimals can't be counted.`
  /* Count field rule. raw = what is in the input, bad = the browser reports unparseable text (type=number). Returns '' when valid. */
  function countCheck(i, key, raw, bad) {
    const l = D.lines[i]
    const s = String(raw ?? '').trim()
    const units = l.unit + 's'
    if (bad) return wholeMsg(l)
    if (s === '') return key === 'good' ? `Enter how many ${units} you counted in good condition, like ${l.good}. Enter 0 if there are none.` : `Enter how many ${units} are damaged. Enter 0 if none are.`
    const n = Number(s)
    if (!Number.isInteger(n)) return wholeMsg(l)
    if (n < 0) return "Counts can't go below 0. Enter 0 if there are none."
    if (n > MAXQ) return `${n} is more than ${MAXQ} ${units}. Check for an extra digit, then recount.`
    if (key === 'dmg' && n > l.claimed) return `Damaged can't be more than the ${l.claimed} ${units} on the note. Recount the damaged pile, or flag OVER on the next screen.`
    return ''
  }
  /* Neutral helper under the count fields. Short or over is an expected outcome, never an error. */
  function countHint(i, good, dmg) {
    const l = D.lines[i]
    const g = Number(good), d = Number(dmg)
    if (!Number.isFinite(g) || !Number.isFinite(d)) return 'Counted by hand, not copied from the note.'
    const t = g + d, diff = t - l.claimed
    const tot = diff === 0 ? `${t} of ${l.claimed} on the note.` : `${t} counted, ${Math.abs(diff)} ${diff < 0 ? 'short of' : 'more than'} the ${l.claimed} on the note. Save it: the match screen handles ${diff < 0 ? 'SHORT' : 'OVER'}.`
    return `${tot} ${d > 0 ? 'Damaged units need a photo on the flag screen.' : 'Condition good.'}${l.days <= 30 ? ' Batch expires soon: rules will raise a FEFO alert.' : ''}`
  }
  const DMG_NEEDS_PHOTO = ['dmg']
  const DRIVER_REASONS = ['dmg', 'short', 'over', 'wrong']
  /* Flag rules. Returns { reasons?, photo?, driver? } messages for everything that is currently missing, in field order. */
  function flagCheck({ reasons, photo, driver }) {
    const e = {}
    const dmgSel = reasons.some((r) => DMG_NEEDS_PHOTO.includes(r))
    const needDriver = reasons.some((r) => DRIVER_REASONS.includes(r))
    if (!reasons.length) e.reasons = 'Pick at least one reason, like DAMAGED if units are crushed.'
    if (dmgSel && !photo) e.photo = "Take a photo of the damaged units. Managers can't approve damage without one."
    if (needDriver && !driver && (photo || !dmgSel)) e.driver = "Hand the phone to the driver and tap confirm. Damage and shortage claims need the driver's OK at the dock."
    return e
  }
  const FIELD_NAMES = { good: 'Counted good', dmg: 'Damaged', reasons: 'reason', photo: 'evidence photo', driver: 'driver confirmation' }
  const summary = (verb, keys) => keys.length ? `Can't ${verb} yet. Fix ${keys.length} ${keys.length > 1 ? 'items' : 'item'} above: ${keys.map((k) => FIELD_NAMES[k]).join(', ')}.` : ''

  const spin = '<span class="v-spin" aria-hidden="true"></span>'
  const errP = (id, msg) => `<p class="v-err" id="${id}" role="alert">${msg || ''}</p>`

  /* A labelled whole-number field: label above, real <input type=number>, optional 44px -/+ adjuncts. */
  const numField = (key, label, val, o = {}) => {
    const id = `ph-${key}`, err = (o.errors && o.errors[key]) || '', dis = o.saving ? ' disabled' : ''
    return `<div class="v-field${err ? ' has-err' : ''}" data-fld="${key}">
      <label class="v-lbl" for="${id}">${label}</label>
      <div class="v-field__row">
        <button type="button" class="v-step" data-act="dec:${key}" aria-label="Fewer ${label.toLowerCase()}"${dis}>−</button>
        <input id="${id}" class="v-input" type="number" inputmode="numeric" min="0" max="${MAXQ}" step="1" autocomplete="off" value="${val}" data-act="set:${key}" aria-describedby="${id}-msg"${err ? ' aria-invalid="true"' : ''}${dis}>
        <button type="button" class="v-step" data-act="inc:${key}" aria-label="More ${label.toLowerCase()}"${dis}>+</button>
      </div>
      ${errP(id + '-msg', err)}
    </div>`
  }

  const photoThumb = (cap) =>
    `<div class="photo"><div class="photo__img"><i></i><i></i><i></i><i></i></div><div class="photo__cap"><b>PHOTO 1 · ${cap}</b><span>09:26 · ${D.receiver} · ATTACHED</span></div></div>`

  const REASONS = [['short', 'SHORT'], ['over', 'OVER'], ['wrong', 'WRONG ITEM'], ['dmg', 'DAMAGED'], ['exp', 'NEAR-EXPIRY'], ['sub', 'SUBSTITUTED']]

  const PHONE = {
    /* 1 · expected deliveries */
    deliveries(state) {
      const done = state === 'done'
      const rows = [
        done
          ? { n: 'A', title: `${D.supplier} · ${D.note}`, sub: 'Received 09:34 · 1 claim open', tag: 'DONE', st: 'done' }
          : { n: 'A', title: `${D.supplier} · ${D.note}`, sub: `${D.po} · 2 lines · truck at Dock 1`, tag: 'ARRIVED', st: 'now', act: 'start', tap: 'start' },
        { n: 'B', title: 'Supplier C · PO-1091', sub: '5 lines · expected 14:00', tag: 'EXPECTED', act: 'other' },
        { n: 'C', title: 'Supplier B · PO-1094', sub: '3 lines · expected tomorrow', tag: 'TOMORROW', act: 'other' },
      ]
      return shell({
        time: done ? '09:35' : '09:12', zone: 'DOCK 1', tab: 'deliveries',
        main: `<div class="ph-pad">
            <div class="ph-hello v-in"><small>${D.date} · ${D.warehouse.toUpperCase()}</small><h2>Good morning, <b>Lan</b></h2><p>Today's expected deliveries, created from purchase orders. Pick the truck at your dock.</p></div>
            ${taskList(rows)}
          </div>
          <div class="ph-cta v-in v-in-5">
            ${done ? '' : `<button class="v-btn v-btn--fill" data-act="start">Start receiving ${D.note} →</button>`}
            <button class="v-btn v-btn--link" data-act="nopo">Truck without a PO? Start a no-PO receipt</button>
          </div>`,
      })
    },

    /* 2 · scan the delivery note */
    note(state, o = {}) {
      const reading = state === 'reading'
      return shell({
        time: '09:14', zone: 'DOCK 1', tab: 'scan', back: o.back,
        main: `<div class="ph-cam"${reading ? '' : ' data-act="scan-note" role="button" tabindex="0" aria-label="Photograph the delivery note"'}>
            <div class="cam-box"></div>
            <div class="cam-top"><span class="v-chip v-chip--ink">${D.po} · ${D.supplier.toUpperCase()}</span><span class="v-chip">${reading ? 'AI READING…' : 'DELIVERY NOTE'}</span></div>
            <div class="cam-note${reading ? ' is-read' : ''}">
              <div class="cam-note__hd"><b>PHIẾU GIAO HÀNG</b><span>No. ${D.note}</span></div>
              <div class="cam-note__sub"><span>${D.supplier}</span><span>12/11/2026</span></div>
              <div class="cam-note__row cam-note__row--h"><span>STT</span><span>Tên hàng</span><span>ĐVT</span><span>SL</span></div>
              ${D.lines.map((l, i) => `<div class="cam-note__row"><span>${i + 1}</span><span class="hl">${l.raw}</span><span>${l.rawUnit}</span><span class="hl">${l.claimed}</span></div>`).join('')}
              <div class="cam-note__ft">Người giao hàng: ………………</div>
            </div>
            <div class="cam-frame cam-frame--note${reading ? ' is-hit' : ''}"><i></i><i></i><i></i><i></i><span class="cam-beam"></span></div>
            <div class="cam-mode"><span class="on">DELIVERY NOTE</span><span>NO PO</span></div>
          </div>
          <div class="ph-sheet">${
            reading
              ? `<div class="sheet-wait"><span class="v-dots"><i></i><i></i><i></i></span>AI is reading the Vietnamese text…</div>
                 <p class="sheet-note">Nothing is saved yet. You confirm every line on the next screen.</p>`
              : `<div class="sheet-wait"><span class="v-dots"><i></i><i></i><i></i></span>${o.tapHint ? 'Tap the camera to photograph the note' : 'Fit the whole note inside the frame'}</div>
                 ${o.tapHint ? '<div class="sheet-act"><button class="v-btn v-btn--fill" data-act="scan-note">Photograph note</button></div>' : ''}
                 <p class="sheet-note">Printed or handwritten, Vietnamese or English. The photo is kept as evidence.</p>`
          }</div>`,
      })
    },

    /* 2b · AI extraction review */
    extract(state, o = {}) {
      const checked = o.checked || (state === 'confirmed' ? [true, true] : [false, false])
      const all = checked.every(Boolean)
      const lines = D.lines.map((l, i) => {
        const low = l.conf < 90
        return `<div class="xl${checked[i] ? ' is-on' : ''} v-in v-in-${i + 2}" data-act="chk:${i}" data-tap="chk${i}" role="button" tabindex="0" aria-pressed="${checked[i]}">
          <div class="xl__top"><span class="v-lbl">ON THE NOTE</span><span class="xl__chk">${checked[i] ? '✓' : ''}</span></div>
          <div class="xl__raw">“${l.raw}” · ${l.rawUnit} · <b>${l.claimed}</b></div>
          <div class="xl__sku"><span class="v-lbl">MATCHED TO CATALOGUE</span><b>${l.name}</b><small>${l.sku} · ${l.claimed} ${l.unit}s</small></div>
          <div class="xl__conf"><span class="conf"><i style="width:${l.conf}%"></i></span><span class="v-chip${low ? ' v-chip--attn' : ''}">${l.conf}%${low ? ' · CHECK' : ''}</span></div>
        </div>`
      }).join('')
      return shell({
        time: '09:16', zone: 'DOCK 1', tab: 'scan', back: o.back,
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">AI · READ FROM THE NOTE</span><span class="v-chip">${D.note}</span></div>
            <h3 class="ph-h3 v-in v-in-2">Check what AI read</h3>
            <p class="ph-p v-in v-in-2">Tap each line to confirm it. You can correct any field. OCR never writes to stock by itself.</p>
            <div class="xls">${lines}</div>
          </div>
          <div class="ph-actions">${
            all
              ? '<button class="v-btn v-btn--fill" data-tap="go" data-act="extract-ok">Continue to counting →</button>'
              : '<button class="v-btn" disabled data-act="extract-ok">Confirm both lines to continue</button>'
          }</div>`,
      })
    },

    /* 3 · scan & count per line */
    count(state, o = {}) {
      const i = o.line || 0
      const l = D.lines[i]
      const hit = state === 'counted'
      const good = o.good ?? l.good
      const dmg = o.dmg ?? l.dmg
      const near = l.days <= 30
      return shell({
        time: i ? '09:23' : hit ? '09:22' : '09:19', zone: 'DOCK 1', tab: 'scan', back: o.back,
        main: `<div class="ph-cam"${hit ? '' : ' data-act="scan" role="button" tabindex="0" aria-label="Scan the barcode"'}>
            <div class="cam-box"></div>
            <div class="cam-top"><span class="v-chip v-chip--ink">LINE ${i + 1} OF 2</span><span class="v-chip">${hit ? 'READ ✓' : '1D BARCODE'}</span></div>
            <div class="cam-label">
              <div class="cam-label__sup"><span>${D.supplier.toUpperCase()}</span><span>EAN-13</span></div>
              <div class="cam-label__name">${l.name}</div>
              <div class="cam-label__meta"><span>BATCH ${l.batch}</span><span>EXP ${l.exp.toUpperCase()}</span></div>
              ${barcode(l.ean)}
            </div>
            <div class="cam-frame${hit ? ' is-hit' : ''}"><i></i><i></i><i></i><i></i><span class="cam-beam"></span>${hit ? '<span class="cam-hit">✓</span>' : ''}</div>
            <div class="cam-mode"><span class="on">BARCODE · EAN</span><button type="button" data-act="fallback:search">SEARCH</button><button type="button" data-act="fallback:photo">PHOTO</button></div>
          </div>
          <div class="ph-sheet">${
            hit
              ? `<div class="sheet-hd v-in"><span class="v-chip v-chip--ok">✓ FOUND ON THE NOTE</span><small>EAN-13 · LINE ${i + 1} OF 2</small></div>
                 <h3 class="v-in v-in-2">${l.name}</h3>
                 <div class="cnt v-in v-in-3">${numField('good', 'COUNTED GOOD', good, o)}${numField('dmg', 'DAMAGED', dmg, o)}</div>
                 <dl class="kv v-in v-in-3"><div><dt>BATCH</dt><dd>${l.batch}</dd></div><div><dt>EXPIRES</dt><dd>${l.exp.toUpperCase()}${near ? ` · ${l.days} DAYS` : ''}</dd></div></dl>
                 <p class="v-hint v-in v-in-4" id="ph-hint" aria-live="polite">${countHint(i, good, dmg)}</p>
                 <div class="sheet-act v-in v-in-5"><p class="v-sum" id="ph-sum" role="alert">${o.summary || ''}</p><button type="button" class="v-btn v-btn--fill${o.saving ? ' is-loading' : ''}" data-tap="save" data-act="save-line" aria-describedby="ph-sum"${o.saving ? ' aria-busy="true"' : ''}>${o.saving ? `${spin}Saving…` : i ? 'Save · see the match →' : 'Save line →'}</button></div>`
              : `<div class="sheet-wait"><span class="v-dots"><i></i><i></i><i></i></span>${o.tapHint ? 'Tap the camera to scan the barcode' : 'Scan the product barcode'}</div>
                 ${o.tapHint ? '<div class="sheet-act"><button class="v-btn v-btn--fill" data-act="scan">Scan barcode</button></div>' : ''}
                 <p class="sheet-note">Expected on this line: <b>${l.claimed} ${l.unit}s</b> · ${l.sku}</p>
                 <div class="fb v-in v-in-3"><span class="v-lbl">NO BARCODE?</span>
                   <div class="fb__row"><button class="v-chip" data-act="fallback:search">Search by name</button><button class="v-chip" data-act="fallback:photo">Photo the label</button><button class="v-chip" data-act="fallback:qr">Print an internal QR</button></div></div>`
          }</div>`,
      })
    },

    /* 4 · live three-way match */
    match(state, o = {}) {
      const rows = D.lines.map((l, i) => {
        const g = o.good ? o.good[i] : l.good
        const d = o.dmg ? o.dmg[i] : l.dmg
        return { l, g, d, m: matchOf(l, g, d) }
      })
      const n = { match: 0, attn: 0, miss: 0 }
      rows.forEach((r) => { n[r.m.st === 'attn' ? 'attn' : r.m.st]++; if (r.m.near && r.m.st !== 'attn') n.attn++ })
      const cards = rows.map(({ l, g, d, m }, i) => `<div class="ml ml--${m.st} v-in v-in-${i + 2}">
          <div class="ml__hd"><div><b>${l.name}</b><span>${l.sku}</span></div>${chip(m.st)}</div>
          <div class="m3"><div><dt>ORDERED</dt><dd>${l.ordered}</dd></div><div><dt>CLAIMED</dt><dd>${l.claimed}</dd></div><div><dt>RECEIVED</dt><dd>${g}${d ? `<small> +${d} damaged</small>` : ''}</dd></div></div>
          <div class="ml__flags">${
            m.st === 'match' && !m.near
              ? '<span class="ml__ok">All three agree · condition good</span>'
              : [
                  d ? chip('miss', `${d} DAMAGED`) : '',
                  m.issues.includes('short') ? chip('attn', 'SHORT') : '',
                  m.issues.includes('over') ? chip('attn', 'OVER') : '',
                  m.near ? chip('attn', `NEAR-EXPIRY · ${l.days} DAYS`) : '',
                ].join('')
          }</div>
        </div>`).join('')
      return shell({
        time: '09:24', zone: 'DOCK 1', tab: 'match', back: o.back,
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">THREE-WAY MATCH · RULES</span><span class="v-chip">${D.note}</span></div>
            <div class="ph-stats v-in v-in-2"><div><b>${n.match}</b><span>MATCH</span></div><div><b>${n.attn}</b><span>ATTENTION</span></div><div><b>${n.miss}</b><span>MISMATCH</span></div></div>
            <div class="mls">${cards}</div>
            <p class="sheet-note v-in v-in-4">Rules did the arithmetic. You judge the exceptions.</p>
          </div>
          <div class="ph-actions"><button class="v-btn v-btn--fill" data-tap="flag" data-act="flag">Flag discrepancy →</button></div>`,
      })
    },

    /* 5 · flag with evidence, driver co-confirms */
    flag(state, o = {}) {
      const reasons = o.reasons || ['dmg', 'exp']
      const uploading = !!o.uploading
      const photo = state !== 'form' || o.photo || uploading
      const driver = state === 'driver' || o.driver
      const errors = o.errors || {}
      const errKeys = Object.keys(errors)
      const sub = o.submitting ? ' is-loading' : ''
      return shell({
        time: '09:26', zone: 'DOCK 1', tab: 'match', back: o.back,
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">FLAG · ${D.lines[0].short.toUpperCase()}</span><span class="v-chip v-chip--ink">YOU DECIDE</span></div>
            <fieldset class="v-fieldset v-in v-in-2${errors.reasons ? ' has-err' : ''}" data-fld="reasons" aria-describedby="ph-reasons-msg"${errors.reasons ? ' aria-invalid="true"' : ''}>
              <legend class="v-lbl">WHAT IS WRONG?</legend>
              <div class="rs" role="group">${REASONS.map(([k, t]) => `<label class="rsb${reasons.includes(k) ? ' on' : ''}"><input type="checkbox" class="v-check" data-act="reason:${k}"${reasons.includes(k) ? ' checked' : ''} aria-label="${t}"><span>${t}</span></label>`).join('')}</div>
              ${errP('ph-reasons-msg', errors.reasons)}
            </fieldset>
            <div class="ev v-in v-in-3" data-fld="photo">
              <span class="v-lbl" id="ph-photo-lbl">EVIDENCE${reasons.includes('dmg') ? ' · PHOTO REQUIRED FOR DAMAGE' : ''}</span>
              ${photo ? (uploading ? `<button type="button" class="ev-add is-loading" id="ph-photo" aria-busy="true" disabled data-act="photo" data-tap="photo" aria-describedby="ph-photo-msg">${spin}Uploading…</button>` : photoThumb(`${o.d ?? 4} CRUSHED TUBES`)) : `<button type="button" class="ev-add" id="ph-photo" data-tap="photo" data-act="photo" aria-describedby="ph-photo-msg">+ Take photo of the damage</button>`}
              ${errP('ph-photo-msg', errors.photo)}
            </div>
            <div class="drv v-in v-in-4${driver ? ' is-ok' : ''}" data-fld="driver">
              <span class="v-lbl" id="ph-driver-lbl">DRIVER CO-CONFIRMS · SAME PHONE</span>${
                driver
                  ? `<div class="ok-row"><span class="v-ok">✓</span><div><b>${D.driver} · ${D.supplier} driver</b><span>CONFIRMS ${o.d ?? 4} DAMAGED ON ARRIVAL · 09:27</span></div></div>`
                  : `<p>Hand the phone to the driver. He checks the photo and the count.</p><button type="button" class="v-btn" id="ph-driver" data-tap="driver" data-act="driver" aria-describedby="ph-driver-msg"${photo ? '' : ' disabled'}>${!photo ? 'Locked until the photo is added' : 'Driver confirms on this phone'}</button>${errP('ph-driver-msg', errors.driver)}`
              }
            </div>
          </div>
          <div class="ph-actions">
            <p class="v-sum" id="ph-sum" role="alert">${o.submitting ? '' : summary('submit', errKeys)}</p>
            <button type="button" class="v-btn v-btn--fill${sub}" id="ph-submit" data-tap="submit" data-act="submit" aria-describedby="ph-sum"${o.submitting ? ' aria-busy="true"' : ''}>${o.submitting ? `${spin}Submitting…` : 'Submit for approval →'}</button>
          </div>`,
      })
    },

    /* 6 · submitted, waiting for approval */
    submitted(state, o = {}) {
      return shell({
        time: '09:27', zone: 'DOCK 1', tab: 'match',
        main: `<div class="ph-pad">
            <div class="ok-row v-in"><span class="v-ok">✓</span><div><b>Sent to ${D.manager} for approval</b><span>${D.note} · 09:27</span></div></div>
            <ol class="steps v-in v-in-2">
              <li class="is-done"><i>✓</i>Counted and matched by rules<span>09:24</span></li>
              <li class="is-done"><i>✓</i>Photo + driver confirmation<span>09:27</span></li>
              <li class="is-now"><i>3</i>Manager approval<span>WAITING</span></li>
              <li><i>4</i>Receipt (phiếu nhập kho)<span>AFTER APPROVAL</span></li>
            </ol>
            <ul class="why v-in v-in-3"><li><span><b>Nothing enters stock yet.</b> Only a named approver can accept an exception.</span></li><li><span><b>The 4 damaged tubes</b> will exist only as a documented claim.</span></li></ul>
          </div>
          <div class="ph-actions">${
            o.demo
              ? `<span class="v-lbl">DEMO CONTROL</span><button class="v-btn v-btn--fill" data-tap="switch" data-act="to-manager">Switch to ${D.manager}, manager →</button>`
              : `<div class="sheet-wait"><span class="v-dots"><i></i><i></i><i></i></span>Waiting for ${D.manager.split(' ')[0]}…</div>`
          }</div>`,
      })
    },

    /* 7 · receipt issued */
    receipt(state, o = {}) {
      const l0 = D.lines[0], l1 = D.lines[1]
      return shell({
        time: '09:34', zone: 'DOCK 1', tab: 'receipt',
        main: `<div class="ph-pad">
            <div class="ok-row v-in"><span class="v-ok">✓</span><div><b>Receipt issued</b><span>APPROVED BY ${D.manager.toUpperCase()} · 09:34</span></div></div>
            <div class="rc v-in v-in-2">
              <div class="rc__hd"><div><b>PHIẾU NHẬP KHO</b><span>Goods receipt note · ${D.receipt}</span></div><span class="v-chip v-chip--ink">ISSUED</span></div>
              <div class="rc__meta"><span>${D.supplier} · ${D.note}</span><span>${D.po} · ${D.warehouse}</span></div>
              <div class="rc__row"><div><b>${l0.name}</b><small>BATCH ${l0.batch} · EXP ${l0.exp.toUpperCase()}</small></div><div class="rc__q"><b>96</b><small>ACCEPTED</small></div></div>
              <div class="rc__row rc__row--claim"><div><b>Claim ${D.claim}</b><small>4 DAMAGED · PHOTO + DRIVER CONFIRMED</small></div><div class="rc__q"><b>4</b><small>CLAIM</small></div></div>
              <div class="rc__row"><div><b>${l1.name}</b><small>BATCH ${l1.batch} · EXP ${l1.exp.toUpperCase()}</small></div><div class="rc__q"><b>20</b><small>ACCEPTED</small></div></div>
              <div class="rc__sig"><span>Received · ${D.receiver} · 09:27</span><span>Approved · ${D.manager} · 09:34</span></div>
            </div>
            <p class="sheet-note v-in v-in-3">Stock is updated with batch and expiry. Every step is in the audit trail.</p>
          </div>
          ${o.next ? '<div class="ph-actions"><button class="v-btn v-btn--fill" data-act="home">Back to deliveries →</button></div>' : ''}`,
      })
    },

    /* manager's approval, on the same prototype */
    approve(state, o = {}) {
      const done = state === 'done'
      const g = o.good ?? 96
      const d = o.dmg ?? 4
      return shell({
        time: done ? '09:34' : '09:28', zone: 'MANAGER', tab: false, who: 'MN',
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">APPROVAL QUEUE · 1</span><span class="v-chip v-chip--ink">${D.manager.toUpperCase()}</span></div>
            <h3 class="ph-h3 v-in v-in-2">${D.supplier} · ${D.note}</h3>
            <dl class="kv v-in v-in-2"><div><dt>RECEIVED</dt><dd>${g} OF 100 TUBES</dd></div><div><dt>DAMAGED</dt><dd>${d} · DRIVER OK</dd></div><div><dt>CEMENT</dt><dd>20 OF 20 ✓</dd></div><div><dt>BATCH L2406-A</dt><dd>20 DAYS LEFT</dd></div></dl>
            <div class="ev v-in v-in-3" style="margin-top:var(--space-12)">${photoThumb(`${d} CRUSHED TUBES`)}</div>
            <p class="sheet-note v-in v-in-3">AI hint: ${d} damaged is outside this supplier's usual range for sealant (0 to 1 per delivery).</p>
            ${
              done
                ? `<div class="db-stamp v-in" style="margin-top:var(--space-12)"><b>${d ? `Accept ${g}, claim ${d}` : `Accept ${g}`}</b><span>Approved by ${D.manager} · 09:34.${d ? ` Claim ${D.claim} opened.` : ''} Receipt ${D.receipt} issued.</span></div>`
                : ''
            }
          </div>
          <div class="ph-actions">${
            done
              ? `<span class="v-lbl">DEMO CONTROL</span><button class="v-btn v-btn--fill" data-act="to-receiver">Back to Lan's phone →</button>`
              : `<button class="v-btn v-btn--fill" data-tap="approve" data-act="approve">${d ? `Accept ${g}, claim ${d}` : `Accept ${g}`}</button>
                 <div class="act2"><button class="v-btn" data-act="mgr-other">Accept as-is</button><button class="v-btn" data-act="mgr-other">Partial accept</button><button class="v-btn" data-act="mgr-other">Reject line</button><button class="v-btn" data-act="mgr-other">Open claim only</button></div>`
          }</div>`,
      })
    },
  }

  function phone(screen, state, opts) {
    return PHONE[screen](state, opts)
  }

  /* ================= dashboard ================= */
  /* System (design/audit/dashboard.md §2): 4 type sizes, 5 colours, no pills. Status = glyph + text. */

  const DASH = ['expected', 'live', 'queue', 'approved', 'receipt', 'stock']
  const CLOCK = ['09:10', '09:24', '09:28', '09:34', '09:34', '09:36']
  const NAV = ['Receiving', 'Approvals', 'Receipts', 'Inventory', 'Alerts', 'Suppliers']
  const NAV_ON = [0, 0, 1, 1, 2, 3]
  const DATE = D.date.replace(/\b(\w)(\w+)/g, (m, a, b) => a + b.toLowerCase())

  const GLYPH = { ok: '✓', attn: '!', miss: '✕', idle: '○', live: '●' }
  const tag = (k, t) => `<span class="db-tag db-tag--${k}"><i aria-hidden="true">${GLYPH[k]}</i>${t}</span>`
  const MATCH = { match: ['ok', 'Match'], attn: ['attn', 'Attention'], miss: ['miss', 'Mismatch'] }
  const mtag = (st, t) => tag(MATCH[st][0], t || MATCH[st][1])

  /* Table with a label on every cell so CSS can stack it into cards. cell = html | { h, label, span } */
  const tbl = (cols, rows) =>
    `<table class="db-table"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r) => {
        let k = 0
        return `<tr${r.cur ? ' class="is-cur"' : ''}>${r.c
          .map((v) => {
            const o = typeof v === 'object' ? v : { h: v }
            const lab = o.label || cols[k]
            const out = `<td data-label="${lab}"${o.span ? ` colspan="${o.span}"` : ''}>${o.h}</td>`
            k += o.span || 1
            return out
          })
          .join('')}</tr>`
      })
      .join('')}</tbody></table>`

  const card = (title, meta, body, cls = '') =>
    `<section class="db-card ${cls}"><div class="db-card__hd"><h2>${title}</h2><span>${meta}</span></div>${body}</section>`

  const EVENTS = [
    { s: 0, t: '06:45', k: 'IMPORT', x: `${D.po} imported from CSV · ${D.supplier} · 2 lines` },
    { s: 0, t: '09:05', k: 'ARRIVED', x: `${D.supplier} truck at Dock 1 · ${D.note}` },
    { s: 1, t: '09:14', k: 'NOTE', x: `${D.receiver} photographed ${D.note} · AI extracted 2 lines` },
    { s: 1, t: '09:16', k: 'HUMAN', x: `${D.receiver} confirmed both lines · catalogue match 96% and 88%` },
    { s: 1, t: '09:22', k: 'COUNT', x: 'SikaFlex-11FC: 96 good, 4 damaged · EAN scanned' },
    { s: 1, t: '09:24', k: 'MATCH', x: 'Cement matches · sealant mismatch · batch expires in 20 days', hot: 1 },
    { s: 2, t: '09:26', k: 'FLAG', x: `Damage flagged with photo · driver ${D.driver} co-confirmed`, hot: 1 },
    { s: 2, t: '09:27', k: 'QUEUE', x: `${D.note} waiting for approval · ${D.receiver}` },
    { s: 3, t: '09:34', k: 'APPROVED', x: `${D.manager}: accept 96, claim 4 · ${D.claim} opened`, hot: 1 },
    { s: 4, t: '09:34', k: 'RECEIPT', x: `Phiếu nhập kho ${D.receipt} issued` },
    { s: 5, t: '09:35', k: 'STOCK', x: '+96 SikaFlex L2406-A · +20 PCB40 XM-1108 · audit trail saved' },
    { s: 5, t: '09:36', k: 'ALERT', x: 'FEFO · SikaFlex L2406-A expires in 20 days', hot: 1 },
    { s: 5, t: '09:36', k: 'SUPPLIER', x: `${D.supplier} accuracy 98% to 93%` },
  ]

  const KL = ['Sessions today', 'Awaiting approval', 'Open claims', 'Expiring ≤ 30 days']
  const KPIS = [
    [['3', '1 done · 1 arrived · 1 expected'], ['0', 'nothing waiting'], ['0', 'with suppliers'], ['0', 'batches in stock']],
    [['3', '1 done · 1 in progress'], ['0', 'nothing waiting'], ['0', 'with suppliers'], ['0', 'batches in stock']],
    [['3', '1 done · 1 waiting · 1 expected'], ['1', `${D.note} · ${D.supplier}`], ['0', 'with suppliers'], ['0', 'batches in stock']],
    [['3', '1 done · 1 approved · 1 expected'], ['0', 'queue clear'], ['1', `${D.claim} · 4 tubes`], ['0', 'batches in stock']],
    [['3', '2 receipts issued · 1 expected'], ['0', 'queue clear'], ['1', `${D.claim} · 4 tubes`], ['0', 'batches in stock']],
    [['3', '2 receipts issued · 1 expected'], ['0', 'queue clear'], ['1', `${D.claim} · 4 tubes`], ['1', 'L2406-A · FEFO']],
  ]
  const HOT = [[], [], [1], [2], [], [3]] // violet = needs you, alert = expiring

  function kpis(i) {
    return `<div class="db-kpis">${KPIS[i]
      .map(([v, s], k) => `<div class="db-kpi${HOT[i].includes(k) ? (k === 3 ? ' is-alert' : ' is-hot') : ''}"><span>${KL[k]}</span><b>${v}</b><span>${s}</span></div>`)
      .join('')}</div>`
  }

  const SESS_STATUS = [
    ['live', 'Arrived'], ['live', 'In progress'], ['attn', 'Awaiting approval'], ['ok', 'Approved'], ['ok', 'Receipt issued'], ['ok', 'Receipt issued'],
  ]
  function sessions(i) {
    const [k, t] = SESS_STATUS[i]
    const cols = ['Note', 'Supplier', 'Receiver', 'Lines', 'Result', 'Status']
    return card(
      'Receiving sessions · today',
      DATE,
      tbl(cols, [
        { c: ['DN-0932', 'Supplier B', 'Quang', '6', tag('ok', 'All match'), tag('ok', 'Receipt issued')] },
        {
          cur: 1,
          c: [
            `${D.note}<small>${D.po}</small>`,
            D.supplier,
            D.receiver.replace(' T.', ''),
            '2',
            i < 1 ? tag('idle', 'Not started') : i < 2 ? tag('live', 'Counting') : `${tag('miss', '1 mismatch')} ${tag('attn', '1 attention')}`,
            tag(k, t),
          ],
        },
        { c: ['PO-1091', 'Supplier C', '·', '5', tag('idle', 'Expected 14:00'), tag('idle', 'Expected')] },
      ]),
    )
  }

  function expectedCard() {
    const kv = (l, v) => `<div><span>${l}</span><b>${v}</b></div>`
    return card(
      `Expected delivery · ${D.po}`,
      `Rule · created from CSV · ${D.manager}`,
      `<div class="db-doc"><div class="db-kv">${kv('Supplier', D.supplier)}${kv('ETA', '09:10 · Dock 1')}${kv('Document', `${D.note} (on arrival)`)}</div>
      ${tbl(['Product', 'SKU', 'Ordered'], D.lines.map((l) => ({ c: [l.name, l.sku, `${l.ordered} ${l.unit}s`] })))}
      <p class="db-note">No PO on a truck? The receiver starts a no-PO receipt and VELO matches claimed against received, flagging that no order exists.</p></div>`,
      'db-card--grow',
    )
  }

  function liveCard() {
    const [a, b] = D.lines
    return card(
      `Live three-way match · ${D.note}`,
      `Rule · updates as ${D.receiver} counts`,
      `${tbl(['Product', 'Ordered', 'Claimed', 'Received', 'Status'], [
        { c: [`${a.name}<small>Batch ${a.batch} · exp ${a.exp}</small>`, '100', '100', '96 <small class="is-inline">+4 damaged</small>', mtag('miss')] },
        { c: [`${b.name}<small>Batch ${b.batch} · exp ${b.exp}</small>`, '20', '20', '20', mtag('match')] },
        { c: [{ h: `Batch ${a.batch} expires in 20 days<small>FEFO alert will be created when the receipt is issued</small>`, span: 4, label: 'Expiry' }, mtag('attn')] },
      ])}
      <p class="db-note">Counts are entered by ${D.receiver.split(' ')[0]}. The arithmetic and thresholds are deterministic rules; nothing here changes stock yet.</p>`,
      'db-card--grow',
    )
  }

  function approvalCard(i) {
    const decided = i >= 3
    const l = D.lines[0]
    const act = decided
      ? `<div class="db-stamp"><b>${tag('ok', 'Accept 96, claim 4')}</b><span>Approved by ${D.manager} · 09:34. Claim ${D.claim} opened with ${D.supplier}. Receipt generated.</span></div>`
      : `<span class="db-lbl">Your decision</span>
         <button class="v-btn v-btn--fill db-primary" data-tap="approve">Accept 96, claim 4</button>
         <p class="db-hint">Stock +96 good tubes and a claim for 4 damaged with ${D.supplier}.</p>
         <ul class="db-alt">${['Accept as-is', 'Partial accept', 'Reject line', 'Open claim only'].map((t) => `<li><button data-act="x">${t}</button></li>`).join('')}</ul>`
    return card(
      'Approval queue',
      decided ? 'Human decision · queue clear' : 'Human decision · 1 waiting',
      `<div class="db-appr"><div class="db-appr__body">
        <div class="q-tags">${tag('miss', '4 damaged')}${tag('attn', 'Near-expiry · 20 days')}<small>Submitted 09:27 by ${D.receiver}</small></div>
        <h3>${D.supplier} · ${D.note} · ${l.name}</h3>
        <p>${D.receiver} received <b>96 good + 4 crushed</b> of 100 claimed. Driver ${D.driver} co-confirmed the damage on her phone at 09:26. Cement matched 20 of 20. Batch ${l.batch} expires ${l.exp}.</p>
        <div class="q-ev">
          <div class="db-ph"><div class="db-ph__img"><i></i><i></i><i></i><i></i></div><div><b>Photo 1 · 4 crushed tubes</b><span>09:26 · ${D.receiver} · driver confirmed</span></div></div>
          <div class="q-ai"><span>AI hint</span><p>4 damaged is outside ${D.supplier}'s usual range for sealant (0 to 1 per delivery).</p></div>
        </div>
      </div><div class="db-appr__act">${act}</div></div>`,
      'db-card--grow',
    )
  }

  const AUDIT = [
    ['09:14', D.receiver, 'Photographed the delivery note', 'Note image'],
    ['09:16', 'AI + ' + D.receiver, 'Read 2 lines (96%, 88%); both confirmed by the receiver', 'Lines'],
    ['09:22', D.receiver, 'Scanned EAN, counted 96 good + 4 damaged', 'Scan'],
    ['09:24', 'Rules', 'Match: cement ✓, sealant ✕, near-expiry !', 'Rules'],
    ['09:26', D.receiver + ' + ' + D.driver, 'Flagged damage; driver co-confirmed', 'Photo'],
    ['09:34', D.manager, 'Approved: accept 96, claim 4', 'Decision'],
    ['09:34', 'Rules', `Issued ${D.receipt}; stock +96, +20; ${D.claim} opened`, 'Receipt'],
  ]

  function receiptCard() {
    const [a, b] = D.lines
    const kv = (l, v) => `<div><span>${l}</span><b>${v}</b></div>`
    return card(
      'Phiếu nhập kho · goods receipt note',
      `Rule · ${D.receipt}`,
      `<div class="db-rcpt">
        <div class="rcd">
          <div class="rcd__hd"><div><b>Phiếu nhập kho</b><span>Goods receipt note</span></div>${tag('ok', 'Issued 09:34')}</div>
          <div class="db-kv db-kv--6">${kv('Supplier', D.supplier)}${kv('Delivery note · PO', `${D.note} · ${D.po}`)}${kv('Warehouse', D.warehouse)}${kv('Receiver', D.receiver)}${kv('Approver', D.manager)}${kv('Date', '12/11/2026')}</div>
          ${tbl(['Product', 'Batch · expiry', 'Claimed', 'Accepted', 'Exception'], [
            { c: [`${a.short}<small>600 ml sealant</small>`, `${a.batch}<small>${a.exp}</small>`, '100', '96', `4 damaged<small>${D.claim}</small>`] },
            { c: [`${b.short}<small>50 kg bag</small>`, `${b.batch}<small>${b.exp}</small>`, '20', '20', 'None'] },
          ])}
          <div class="rcd__sig"><span>Receiver confirmed · ${D.receiver} · 09:27</span><span>Driver confirmed · ${D.driver} · 09:26</span><span>Approved · ${D.manager} · 09:34</span></div>
        </div>
        <div class="au"><span class="db-lbl">Audit trail: who, what, when, evidence</span>
          <ol>${AUDIT.map(([t, w, x, e]) => `<li><time>${t}</time><div><b>${w}</b><span>${x}</span></div><em>${e}</em></li>`).join('')}</ol></div>
      </div>`,
      'db-card--grow',
    )
  }

  function inventoryCard() {
    const n = D.note
    return card(
      'Inventory · batch &amp; expiry',
      'FEFO order · updated 09:35',
      `${tbl(['Product', 'Batch', 'On hand', 'Expiry', 'Location', 'Status'], [
        { cur: 1, c: [`SikaFlex-11FC 600 ml<small>New · ${n}</small>`, 'L2406-A', '96', '02 Dec 2026 · 20 days', 'Shelf B2', tag('attn', 'Sell first')] },
        { c: ['SikaFlex-11FC 600 ml', 'L2403-C', '48', '18 Jan 2027 · 67 days', 'Shelf B2', tag('ok', 'In stock')] },
        { cur: 1, c: [`PCB40 cement 50 kg<small>New · ${n}</small>`, 'XM-1108', '20', '10 Feb 2027 · 90 days', 'Yard 1', tag('ok', 'In stock')] },
        { c: ['PCB40 cement 50 kg', 'XM-1102', '140', '05 Feb 2027 · 85 days', 'Yard 1', tag('ok', 'In stock')] },
        { c: ['Tile adhesive 25 kg', 'TA-0931', '12', '30 Jun 2027', 'Shelf C1', tag('attn', 'Low · min 30')] },
      ])}
      <p class="db-note">The 4 damaged tubes are not in this table. They exist only as claim ${D.claim}.</p>`,
      'db-card--grow',
    )
  }

  function alertsCard() {
    return card(
      'Alerts',
      'Rule + AI · 3 open',
      `<ul class="al">
        <li>${tag('attn', 'FEFO')}<div><b>SikaFlex-11FC L2406-A expires in 20 days</b><span>Sell or move to the front before batch L2403-C (18 Jan 2027).</span></div></li>
        <li>${tag('attn', 'Low stock')}<div><b>Tile adhesive 25 kg: 12 bags</b><span>Below the minimum of 30. Reorder suggested; you approve.</span></div></li>
        <li>${tag('idle', 'Claim')}<div><b>${D.claim} · 4 tubes · ${D.supplier}</b><span>Photo, driver confirmation and approver attached.</span></div></li>
      </ul>`,
    )
  }

  function supplierCard(i) {
    const after = i >= 3
    const row = (name, v, prev) =>
      `<li><span>${name}</span><div class="acc__bar"><i class="${prev ? 'is-drop' : ''}" style="width:${v}%"></i>${prev ? `<em style="left:${prev}%"></em>` : ''}</div><b class="${prev ? 'is-drop' : ''}">${v}%</b><small>${prev ? '↓ ' + (prev - v) : '·'}</small></li>`
    return card(
      'Supplier accuracy',
      'Last 20 deliveries',
      `<ul class="acc">${row(D.supplier, after ? 93 : 98, after ? 98 : 0)}${row('Supplier B', 100, 0)}${row('Supplier C', 96, 0)}</ul>
      <p class="db-note">${after ? `${D.supplier} dropped after ${D.note}: 4 damaged tubes recorded.` : 'Share of lines received without an exception.'} Illustrative data.</p>`,
    )
  }

  function feed(i) {
    const evs = EVENTS.filter((e) => e.s <= i).reverse()
    return card(
      'Live events · audit',
      'Every event has a name',
      `<ol class="db-feed">${evs
        .map((e) => `<li class="${e.s === i && i > 0 ? 'is-new' : ''}${e.hot && e.s === i ? ' is-hot' : ''}"><time>${e.t}</time><div><b>${e.k[0] + e.k.slice(1).toLowerCase()}</b> <span>${e.x}</span></div></li>`)
        .join('')}</ol>`,
      'db-card--rail',
    )
  }

  function dash(key) {
    const i = Math.max(0, DASH.indexOf(key))
    const left = [
      `${sessions(i)}${expectedCard()}`,
      `${sessions(i)}${liveCard()}`,
      `${approvalCard(i)}${sessions(i)}`,
      `${approvalCard(i)}${sessions(i)}`,
      receiptCard(),
      `${inventoryCard()}${alertsCard()}`,
    ][i]
    return `
      <div class="db-chrome"><i></i><i></i><i></i><span class="db-url"><b>Mockup</b>velo · receiving dashboard · illustrative data</span></div>
      <div class="db-app">
        <aside class="db-side">
          <div class="db-brand"><img src="${LOGO}" alt="">VELO</div>
          <nav class="db-nav">${NAV.map((n, k) => {
            const badge = n === 'Approvals' && i === 2 ? '1' : n === 'Alerts' && i === 5 ? '3' : n === 'Receipts' && i >= 4 ? '2' : ''
            return `<a href="#" class="${k === NAV_ON[i] ? 'on' : ''}">${n}${badge ? `<em>${badge}</em>` : ''}</a>`
          }).join('')}</nav>
        </aside>
        <main class="db-main">
          <header class="db-head"><h1>Receiving · <b>${D.warehouse}</b></h1>
            <span class="db-clock">${CLOCK[i]}</span><span class="db-user"><i>MN</i><span><b>${D.manager}</b>Warehouse manager</span></span></header>
          ${kpis(i)}
          <div class="db-grid">
            <div class="db-col">${left}</div>
            <div class="db-col db-col--rail">${feed(i)}${supplierCard(i)}</div>
          </div>
        </main>
      </div>`
  }

  global.VeloUI = { phone, dash, DASH, shell, taskList, matchOf, chip, STATUS, D, LOGO, countCheck, countHint, flagCheck, summary, FIELD_NAMES }
})(window)
