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

  const stp = (label, val, key) =>
    `<div class="stp"><span class="v-lbl">${label}</span><div><button data-act="dec:${key}" aria-label="Fewer ${label.toLowerCase()}">−</button><b>${val}</b><button data-act="inc:${key}" aria-label="More ${label.toLowerCase()}">+</button></div></div>`

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
        main: `<div class="ph-cam"${reading ? '' : ' data-act="scan-note" role="button" aria-label="Photograph the delivery note"'}>
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
        main: `<div class="ph-cam"${hit ? '' : ' data-act="scan" role="button" aria-label="Scan the barcode"'}>
            <div class="cam-box"></div>
            <div class="cam-top"><span class="v-chip v-chip--ink">LINE ${i + 1} OF 2</span><span class="v-chip">${hit ? 'READ ✓' : '1D BARCODE'}</span></div>
            <div class="cam-label">
              <div class="cam-label__sup"><span>${D.supplier.toUpperCase()}</span><span>EAN-13</span></div>
              <div class="cam-label__name">${l.name}</div>
              <div class="cam-label__meta"><span>BATCH ${l.batch}</span><span>EXP ${l.exp.toUpperCase()}</span></div>
              ${barcode(l.ean)}
            </div>
            <div class="cam-frame${hit ? ' is-hit' : ''}"><i></i><i></i><i></i><i></i><span class="cam-beam"></span>${hit ? '<span class="cam-hit">✓</span>' : ''}</div>
            <div class="cam-mode"><span class="on">BARCODE · EAN</span><span data-act="fallback:search">SEARCH</span><span data-act="fallback:photo">PHOTO</span></div>
          </div>
          <div class="ph-sheet">${
            hit
              ? `<div class="sheet-hd v-in"><span class="v-chip v-chip--ok">✓ FOUND ON THE NOTE</span><small>EAN-13 · LINE ${i + 1} OF 2</small></div>
                 <h3 class="v-in v-in-2">${l.name}</h3>
                 <div class="cnt v-in v-in-3">${stp('COUNTED GOOD', good, 'good')}${stp('DAMAGED', dmg, 'dmg')}</div>
                 <dl class="kv v-in v-in-3"><div><dt>BATCH</dt><dd>${l.batch}</dd></div><div><dt>EXPIRES</dt><dd>${l.exp.toUpperCase()}${near ? ` · ${l.days} DAYS` : ''}</dd></div></dl>
                 <p class="sheet-note v-in v-in-4">${dmg > 0 ? 'Damaged units need a photo on the flag screen.' : 'Condition good. Counted by hand, not copied from the note.'}${near ? ' Batch expires soon: rules will raise a FEFO alert.' : ''}</p>
                 <div class="sheet-act v-in v-in-5"><button class="v-btn v-btn--fill" data-tap="save" data-act="save-line">${i ? 'Save · see the match →' : 'Save line →'}</button></div>`
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
      const photo = state !== 'form' || o.photo
      const driver = state === 'driver' || o.driver
      const dmgSel = reasons.includes('dmg')
      const needDriver = reasons.some((r) => ['dmg', 'short', 'over', 'wrong'].includes(r))
      const ready = (photo || !dmgSel) && (driver || !needDriver) && reasons.length > 0
      return shell({
        time: '09:26', zone: 'DOCK 1', tab: 'match', back: o.back,
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">FLAG · ${D.lines[0].short.toUpperCase()}</span><span class="v-chip v-chip--ink">YOU DECIDE</span></div>
            <h3 class="ph-h3 v-in v-in-2">What is wrong?</h3>
            <div class="rs v-in v-in-2">${REASONS.map(([k, t]) => `<button class="rsb${reasons.includes(k) ? ' on' : ''}" data-act="reason:${k}" aria-pressed="${reasons.includes(k)}">${t}</button>`).join('')}</div>
            <div class="ev v-in v-in-3"><span class="v-lbl">EVIDENCE${dmgSel ? ' · PHOTO REQUIRED FOR DAMAGE' : ''}</span>${
              photo ? photoThumb(`${o.d ?? 4} CRUSHED TUBES`) : `<button class="ev-add" data-tap="photo" data-act="photo">+ Take photo of the damage</button>`
            }</div>
            <div class="drv v-in v-in-4${driver ? ' is-ok' : ''}"><span class="v-lbl">DRIVER CO-CONFIRMS · SAME PHONE</span>${
              driver
                ? `<div class="ok-row"><span class="v-ok">✓</span><div><b>${D.driver} · ${D.supplier} driver</b><span>CONFIRMS ${o.d ?? 4} DAMAGED ON ARRIVAL · 09:27</span></div></div>`
                : photo
                  ? `<p>Hand the phone to the driver. He checks the photo and the count.</p><button class="v-btn" data-tap="driver" data-act="driver">Driver confirms on this phone</button>`
                  : '<p>Unlocks after the photo, while the driver is still at the dock.</p>'
            }</div>
          </div>
          <div class="ph-actions">${
            ready
              ? `<button class="v-btn v-btn--fill" data-tap="submit" data-act="submit">Submit for approval →</button>`
              : `<button class="v-btn" disabled data-act="submit">${!photo && dmgSel ? 'Photo required to submit' : needDriver && !driver ? 'Driver confirmation needed' : 'Pick a reason to submit'}</button>`
          }</div>`,
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

  const DASH = ['expected', 'live', 'queue', 'approved', 'receipt', 'stock']
  const CLOCK = ['09:10', '09:24', '09:28', '09:34', '09:34', '09:36']
  const NAV = ['Receiving', 'Approvals', 'Receipts', 'Inventory', 'Alerts', 'Suppliers']
  const NAV_ON = [0, 0, 1, 1, 2, 3]

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

  const KPIS = [
    [['SESSIONS TODAY', '3', '1 done · 1 arrived · 1 expected'], ['AWAITING APPROVAL', '0', 'nothing waiting'], ['OPEN CLAIMS', '0', 'with suppliers'], ['EXPIRING ≤ 30 DAYS', '0', 'batches in stock']],
    [['SESSIONS TODAY', '3', '1 done · 1 in progress'], ['AWAITING APPROVAL', '0', 'nothing waiting'], ['OPEN CLAIMS', '0', 'with suppliers'], ['EXPIRING ≤ 30 DAYS', '0', 'batches in stock']],
    [['SESSIONS TODAY', '3', '1 done · 1 waiting · 1 expected'], ['AWAITING APPROVAL', '1', `${D.note} · ${D.supplier}`], ['OPEN CLAIMS', '0', 'with suppliers'], ['EXPIRING ≤ 30 DAYS', '0', 'batches in stock']],
    [['SESSIONS TODAY', '3', '1 done · 1 approved · 1 expected'], ['AWAITING APPROVAL', '0', 'queue clear'], ['OPEN CLAIMS', '1', `${D.claim} · 4 tubes`], ['EXPIRING ≤ 30 DAYS', '0', 'batches in stock']],
    [['SESSIONS TODAY', '3', '2 receipts issued · 1 expected'], ['AWAITING APPROVAL', '0', 'queue clear'], ['OPEN CLAIMS', '1', `${D.claim} · 4 tubes`], ['EXPIRING ≤ 30 DAYS', '0', 'batches in stock']],
    [['SESSIONS TODAY', '3', '2 receipts issued · 1 expected'], ['AWAITING APPROVAL', '0', 'queue clear'], ['OPEN CLAIMS', '1', `${D.claim} · 4 tubes`], ['EXPIRING ≤ 30 DAYS', '1', 'L2406-A · FEFO']],
  ]
  const HOT = [[], [], [1], [1, 2], [], [3]]

  function kpis(i) {
    return `<div class="db-kpis">${KPIS[i].map(([l, v, s], k) => `<div class="db-kpi${HOT[i].includes(k) ? ' is-hot' : ''}"><span class="v-lbl">${l}</span><b>${v}</b><span>${s}</span></div>`).join('')}</div>`
  }

  const SESS_STATUS = [
    ['ARRIVED', ''], ['IN PROGRESS', 'v-chip--pastel'], ['AWAITING APPROVAL', 'v-chip--ink'], ['APPROVED', 'v-chip--ink'], ['RECEIPT ISSUED', ''], ['RECEIPT ISSUED', ''],
  ]
  function sessions(i) {
    const [t, c] = SESS_STATUS[i]
    return `<div class="db-card"><div class="db-card__hd"><h2>Receiving sessions · today</h2><small>${D.date}</small></div>
      <table class="db-table"><thead><tr><th>NOTE</th><th>SUPPLIER</th><th>RECEIVER</th><th>LINES</th><th>RESULT</th><th style="text-align:right">STATUS</th></tr></thead><tbody>
        <tr><td><b>DN-0932</b></td><td>Supplier B</td><td>Quang</td><td>6</td><td>${chip('match', '✓ ALL MATCH')}</td><td style="text-align:right"><span class="v-chip">RECEIPT ISSUED</span></td></tr>
        <tr class="is-cur"><td><b>${D.note}</b><small>${D.po}</small></td><td>${D.supplier}</td><td>${D.receiver.replace(' T.', '')}</td><td>2</td><td>${
          i < 1 ? '<span class="v-chip">NOT STARTED</span>' : i < 2 ? '<span class="v-chip">COUNTING</span>' : `${chip('miss', '1 MISMATCH')} ${chip('attn', '1 ATTENTION')}`
        }</td><td style="text-align:right"><span class="v-chip ${c}">${t}</span></td></tr>
        <tr><td><b>PO-1091</b></td><td>Supplier C</td><td>·</td><td>5</td><td><span class="v-chip">EXPECTED 14:00</span></td><td style="text-align:right"><span class="v-chip">EXPECTED</span></td></tr>
      </tbody></table></div>`
  }

  function expectedCard() {
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Expected delivery · ${D.po}</h2><span class="v-chip v-chip--pastel">RULE</span><small>CREATED FROM CSV · ${D.manager.toUpperCase()}</small></div>
      <div class="db-doc"><div class="db-appr__kv"><div><span class="v-lbl">SUPPLIER</span><b>${D.supplier}</b></div><div><span class="v-lbl">ETA</span><b>09:10 · DOCK 1</b></div><div><span class="v-lbl">DOCUMENT</span><b>${D.note} (ON ARRIVAL)</b></div></div>
      <table class="db-table"><thead><tr><th>PRODUCT</th><th>SKU</th><th>ORDERED</th></tr></thead><tbody>
        ${D.lines.map((l) => `<tr><td><b>${l.name}</b></td><td>${l.sku}</td><td>${l.ordered} ${l.unit}s</td></tr>`).join('')}
      </tbody></table>
      <p class="db-note">No PO on a truck? The receiver starts a no-PO receipt and VELO matches claimed against received, flagging that no order exists.</p></div></div>`
  }

  function liveCard() {
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Live three-way match · ${D.note}</h2><span class="v-chip v-chip--pastel">RULE</span><small>UPDATES AS ${D.receiver.toUpperCase()} COUNTS</small></div>
      <table class="db-table"><thead><tr><th>PRODUCT</th><th>ORDERED</th><th>CLAIMED</th><th>RECEIVED</th><th style="text-align:right">STATUS</th></tr></thead><tbody>
        <tr><td><b>${D.lines[0].name}</b><small>BATCH ${D.lines[0].batch} · EXP ${D.lines[0].exp.toUpperCase()}</small></td><td>100</td><td>100</td><td><b>96</b> <small style="display:inline">+4 damaged</small></td><td style="text-align:right">${chip('miss')}</td></tr>
        <tr><td><b>${D.lines[1].name}</b><small>BATCH ${D.lines[1].batch} · EXP ${D.lines[1].exp.toUpperCase()}</small></td><td>20</td><td>20</td><td><b>20</b></td><td style="text-align:right">${chip('match')}</td></tr>
        <tr><td colspan="4"><b>Batch ${D.lines[0].batch} expires in 20 days</b><small>FEFO alert will be created when the receipt is issued</small></td><td style="text-align:right">${chip('attn')}</td></tr>
      </tbody></table>
      <p class="db-note">Counts are entered by ${D.receiver.split(' ')[0]}. The arithmetic and thresholds are deterministic rules; nothing here changes stock yet.</p></div>`
  }

  function approvalCard(i) {
    const decided = i >= 3
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Approval queue</h2><span class="v-chip v-chip--ink">HUMAN</span><small>${decided ? 'QUEUE CLEAR' : '1 WAITING'}</small></div>
      <div class="db-appr"><div class="db-appr__body">
        <div class="q-tags">${chip('miss', '✕ 4 DAMAGED')}${chip('attn', '! NEAR-EXPIRY · 20 DAYS')}<small>SUBMITTED 09:27 BY ${D.receiver.toUpperCase()}</small></div>
        <h3>${D.supplier} · ${D.note} · ${D.lines[0].name}</h3>
        <p>${D.receiver} received <b>96 good + 4 crushed</b> of 100 claimed. Driver ${D.driver} co-confirmed the damage on her phone at 09:26. Cement matched 20 of 20. Batch ${D.lines[0].batch} expires ${D.lines[0].exp}.</p>
        <div class="q-ev">
          <div class="photo"><div class="photo__img"><i></i><i></i><i></i><i></i></div><div class="photo__cap"><b>PHOTO 1 · 4 CRUSHED TUBES</b><span>09:26 · ${D.receiver} · DRIVER CONFIRMED</span></div></div>
          <div class="q-ai"><span class="v-lbl">AI HINT</span><p>4 damaged is outside ${D.supplier}'s usual range for sealant (0 to 1 per delivery).</p></div>
        </div>
      </div>
      <div class="db-appr__act">${
        decided
          ? `<div class="db-stamp"><b>Accept 96, claim 4</b><span>Approved by ${D.manager} · 09:34. Claim ${D.claim} opened with ${D.supplier}. Receipt generated.</span></div>`
          : `<span class="v-lbl">YOUR DECISION</span>
             <button class="v-btn" data-act="x">Accept as-is</button>
             <button class="v-btn v-btn--fill" data-tap="approve">Accept 96, claim 4</button>
             <button class="v-btn" data-act="x">Partial accept</button>
             <button class="v-btn" data-act="x">Reject line</button>
             <button class="v-btn" data-act="x">Open claim only</button>`
      }</div></div></div>`
  }

  const AUDIT = [
    ['09:14', D.receiver, 'Photographed the delivery note', 'NOTE IMAGE'],
    ['09:16', 'AI + ' + D.receiver, 'Read 2 lines (96%, 88%); both confirmed by the receiver', 'LINES'],
    ['09:22', D.receiver, 'Scanned EAN, counted 96 good + 4 damaged', 'SCAN'],
    ['09:24', 'Rules', 'Match: cement ✓, sealant ✕, near-expiry !', 'RULES'],
    ['09:26', D.receiver + ' + ' + D.driver, 'Flagged damage; driver co-confirmed', 'PHOTO'],
    ['09:34', D.manager, 'Approved: accept 96, claim 4', 'DECISION'],
    ['09:34', 'Rules', `Issued ${D.receipt}; stock +96, +20; ${D.claim} opened`, 'RECEIPT'],
  ]

  function receiptCard() {
    const [a, b] = D.lines
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Phiếu nhập kho · goods receipt note</h2><span class="v-chip v-chip--pastel">RULE</span><small>${D.receipt}</small></div>
      <div class="db-rcpt">
        <div class="rcd">
          <div class="rcd__hd"><div><b>PHIẾU NHẬP KHO</b><span>GOODS RECEIPT NOTE</span></div><span class="v-chip v-chip--ink">ISSUED 09:34</span></div>
          <div class="rcd__meta"><div><span class="v-lbl">SUPPLIER</span><b>${D.supplier}</b></div><div><span class="v-lbl">DELIVERY NOTE · PO</span><b>${D.note} · ${D.po}</b></div><div><span class="v-lbl">WAREHOUSE</span><b>${D.warehouse}</b></div><div><span class="v-lbl">RECEIVER</span><b>${D.receiver}</b></div><div><span class="v-lbl">APPROVER</span><b>${D.manager}</b></div><div><span class="v-lbl">DATE</span><b>12/11/2026</b></div></div>
          <table class="db-table"><thead><tr><th>PRODUCT</th><th>BATCH · EXPIRY</th><th>CLAIMED</th><th>ACCEPTED</th><th>EXCEPTION</th></tr></thead><tbody>
            <tr><td><b>${a.short}</b><small>600 ml sealant</small></td><td>${a.batch}<small>${a.exp}</small></td><td>100</td><td><b>96</b></td><td>4 damaged<small>${D.claim}</small></td></tr>
            <tr><td><b>${b.short}</b><small>50 kg bag</small></td><td>${b.batch}<small>${b.exp}</small></td><td>20</td><td><b>20</b></td><td>None</td></tr>
          </tbody></table>
          <div class="rcd__sig"><span>Receiver confirmed · ${D.receiver} · 09:27</span><span>Driver confirmed · ${D.driver} · 09:26</span><span>Approved · ${D.manager} · 09:34</span></div>
        </div>
        <div class="au"><span class="v-lbl">AUDIT TRAIL · WHO · WHAT · WHEN · EVIDENCE</span>
          <ol>${AUDIT.map(([t, w, x, e]) => `<li><time>${t}</time><div><b>${w}</b><span>${x}</span></div><span class="v-chip">${e}</span></li>`).join('')}</ol></div>
      </div></div>`
  }

  function inventoryCard() {
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Inventory · batch &amp; expiry</h2><span class="v-chip v-chip--pastel">FEFO ORDER</span><small>UPDATED 09:35</small></div>
      <table class="db-table"><thead><tr><th>PRODUCT</th><th>BATCH</th><th>ON HAND</th><th>EXPIRY</th><th>LOCATION</th><th style="text-align:right">STATUS</th></tr></thead><tbody>
        <tr class="is-cur"><td><b>SikaFlex-11FC 600 ml</b><small>NEW · ${D.note}</small></td><td>L2406-A</td><td><b>96</b></td><td>02 Dec 2026 · 20 days</td><td>Shelf B2</td><td style="text-align:right">${chip('attn', '! SELL FIRST')}</td></tr>
        <tr><td><b>SikaFlex-11FC 600 ml</b></td><td>L2403-C</td><td>48</td><td>18 Jan 2027 · 67 days</td><td>Shelf B2</td><td style="text-align:right"><span class="v-chip">IN STOCK</span></td></tr>
        <tr class="is-cur"><td><b>PCB40 cement 50 kg</b><small>NEW · ${D.note}</small></td><td>XM-1108</td><td><b>20</b></td><td>10 Feb 2027 · 90 days</td><td>Yard 1</td><td style="text-align:right"><span class="v-chip">IN STOCK</span></td></tr>
        <tr><td><b>PCB40 cement 50 kg</b></td><td>XM-1102</td><td>140</td><td>05 Feb 2027 · 85 days</td><td>Yard 1</td><td style="text-align:right"><span class="v-chip">IN STOCK</span></td></tr>
        <tr><td><b>Tile adhesive 25 kg</b></td><td>TA-0931</td><td>12</td><td>30 Jun 2027</td><td>Shelf C1</td><td style="text-align:right">${chip('attn', '! LOW · MIN 30')}</td></tr>
      </tbody></table>
      <p class="db-note">The 4 damaged tubes are not in this table. They exist only as claim ${D.claim}.</p></div>`
  }

  function alertsCard() {
    return `<div class="db-card"><div class="db-card__hd"><h2>Alerts</h2><span class="v-chip v-chip--pastel">RULE + AI</span><small>3 OPEN</small></div>
      <ul class="al">
        <li>${chip('attn', 'FEFO')}<div><b>SikaFlex-11FC L2406-A expires in 20 days</b><span>Sell or move to the front before batch L2403-C (18 Jan 2027).</span></div></li>
        <li>${chip('attn', 'LOW STOCK')}<div><b>Tile adhesive 25 kg: 12 bags</b><span>Below the minimum of 30. Reorder suggested; you approve.</span></div></li>
        <li><span class="v-chip">CLAIM</span><div><b>${D.claim} · 4 tubes · ${D.supplier}</b><span>Photo, driver confirmation and approver attached.</span></div></li>
      </ul></div>`
  }

  function supplierCard(i) {
    const after = i >= 3
    const row = (name, v, prev) => `<li><span>${name}</span><div class="acc__bar"><i class="${prev ? 'is-drop' : ''}" style="width:${v}%"></i>${prev ? `<em style="left:${prev}%"></em>` : ''}</div><b>${v}%</b><small>${prev ? '↓ ' + (prev - v) : '·'}</small></li>`
    return `<div class="db-card"><div class="db-card__hd"><h2>Supplier accuracy</h2><small>LAST 20 DELIVERIES</small></div>
      <ul class="acc">${row(D.supplier, after ? 93 : 98, after ? 98 : 0)}${row('Supplier B', 100, 0)}${row('Supplier C', 96, 0)}</ul>
      <p class="db-note">${after ? `${D.supplier} dropped after ${D.note}: 4 damaged tubes recorded.` : 'Share of lines received without an exception.'} Illustrative data.</p></div>`
  }

  function feed(i) {
    const evs = EVENTS.filter((e) => e.s <= i).reverse()
    return `<div class="db-card db-card--grow"><div class="db-card__hd"><h2>Live events · audit</h2><small>EVERY EVENT HAS A NAME</small></div>
      <ol class="db-feed">${evs.map((e) => `<li class="${e.s === i && i > 0 ? 'is-new' : ''}${e.hot && e.s === i ? ' is-hot' : ''}"><time>${e.t}</time><span class="v-chip">${e.k}</span><span>${e.x}</span></li>`).join('')}</ol></div>`
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
      <div class="db-chrome"><i></i><i></i><i></i><span class="db-url"><b>MOCKUP</b>velo · receiving dashboard · illustrative data</span></div>
      <div class="db-app">
        <aside class="db-side">
          <div class="db-brand"><img src="${LOGO}" alt="">VELO</div>
          <div class="db-store"><span class="v-lbl">WAREHOUSE</span><b>${D.warehouse}</b></div>
          <nav class="db-nav">${NAV.map((n, k) => {
            const badge = n === 'Approvals' && i === 2 ? '1' : n === 'Alerts' && i === 5 ? '3' : n === 'Receipts' && i >= 4 ? '2' : ''
            return `<a href="#" class="${k === NAV_ON[i] ? 'on' : ''}">${n}${badge ? `<em>${badge}</em>` : ''}</a>`
          }).join('')}</nav>
          <ul class="db-crew">
            <li><i>LT</i><span><b>${D.receiver}</b>Receiver · Dock 1</span></li>
            <li><i>MN</i><span><b>${D.manager}</b>Warehouse manager</span></li>
          </ul>
          <div class="db-sov"><b>PROTOTYPE MOCKUP</b>Illustrative data. Not a working product. VELO recommends; people decide.</div>
        </aside>
        <main class="db-main">
          <header class="db-head"><h1>Receiving · <b>${D.warehouse}</b></h1><span class="v-chip v-chip--deep db-live">ILLUSTRATIVE</span>
            <span class="db-clock">${CLOCK[i]}</span><span class="db-user"><i>MN</i><span><b>${D.manager}</b>Warehouse manager</span></span></header>
          ${kpis(i)}
          <div class="db-grid">
            <div class="db-col">${left}</div>
            <div class="db-col">${feed(i)}${supplierCard(i)}</div>
          </div>
        </main>
      </div>`
  }

  global.VeloUI = { phone, dash, DASH, shell, taskList, matchOf, chip, STATUS, D, LOGO }
})(window)
