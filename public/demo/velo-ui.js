/*
 * Velo demo UI — renders the clerk phone app and the store hub dashboard as HTML strings.
 * Shared by index.html (demo player) and screens.html (screen board). All data is illustrative.
 * Classic script (not a module) so the pages also work when opened straight from disk.
 */
;(function (global) {
  'use strict'

  const LOGO = '../assets/Logo.png'

  /* ================= phone ================= */

  const ICON = {
    tasks: '<path d="M3 5h2M8 5h9M3 10h2M8 10h9M3 15h2M8 15h9"/>',
    scan: '<path d="M2 6V2h4M14 2h4v4M18 14v4h-4M6 18H2v-4M6 6v8M9 6v8M12 6v8M14 6v8"/>',
    ask: '<path d="M3 3h14v11H9l-4 3v-3H3z"/>',
    map: '<path d="M2 2h16v16H2zM2 9h9M11 2v16"/>',
  }
  const TABS = [['tasks', 'TASKS'], ['scan', 'SCAN'], ['ask', 'ASK'], ['map', 'MAP']]

  function shell({ time, zone, tab, main, back }) {
    return `
      <div class="ph-status"><b>${time}</b><span class="ph-island"></span><span class="ph-sys"><span class="ph-sig"><i></i><i></i><i></i><i></i></span><span class="ph-bat"><i></i></span></span></div>
      <div class="ph-top">${back ? '<button class="ph-back" data-act="back" aria-label="Back">←</button>' : ''}<span class="ph-brand"><img src="${LOGO}" alt=""><b>VELO</b></span><span class="v-chip v-chip--pastel">${zone}</span><button class="ph-me" data-act="menu" aria-label="Clerk menu">MK</button></div>
      <div class="ph-main">${main}</div>
      <nav class="ph-tabs">${TABS.map(([k, l]) => `<button class="ph-tab${k === tab ? ' on' : ''}" data-tab="${k}"><svg viewBox="0 0 20 20" aria-hidden="true">${ICON[k]}</svg>${l}</button>`).join('')}</nav>
      <span class="ph-home"></span>`
  }

  function taskList(rows) {
    return `<ol class="ph-tasks">${rows
      .map(
        (r, i) => `<li class="ph-task${r.st ? ' is-' + r.st : ''} v-in v-in-${Math.min(i + 2, 5)}"${r.act ? ` data-act="${r.act}" role="button" tabindex="0"` : ''}>
          <span class="ph-task__n">${r.st === 'done' ? '✓' : r.n}</span>
          <div><b>${r.title}</b><span>${r.sub}</span></div>
          <span class="v-chip${r.st === 'now' ? ' v-chip--deep' : ''}">${r.tag}</span></li>`,
      )
      .join('')}</ol>`
  }

  const TASKS_PLAN = [
    { n: '01', title: 'Receive PO-88213', sub: 'Dock 2 · truck 07:20 · 24 cartons', tag: 'NOW', st: 'now' },
    { n: '02', title: 'FEFO: rotate SikaFlex #388', sub: 'Bay B-04 · expires in 14 days', tag: 'FEFO' },
    { n: '03', title: 'Move mortar M5 #77 to front', sub: 'Bay B-02 → Aisle 4 · 9 days left', tag: 'FEFO' },
  ]

  function barcode(digits) {
    const widths = '211213111321211231112113121321112211313121112312'
    let bars = ''
    for (let i = 0; i < widths.length; i++) {
      bars += `<i style="width:${widths[i] * 2.2}px${i % 2 ? ';background:transparent' : ''}"></i>`
    }
    return `<div class="bc"><div class="bc__bars">${bars}</div><span>${digits}</span></div>`
  }

  const PHONE = {
    tasks(state) {
      if (state === 'after') {
        return shell({
          time: '10:20',
          zone: 'ZONE C · FLOOR',
          tab: 'tasks',
          main: `<div class="ph-pad">
            <div class="ph-hello v-in"><small>MON 26 OCT · SHIFT 07:00–15:00</small><h2>Your shift <b>so far</b></h2><p>Every task came from a scan or a sale. Nothing was typed into a desktop terminal.</p></div>
            <div class="ph-stats v-in v-in-2"><div><b>2</b><span>DONE</span></div><div><b>2</b><span>LEFT</span></div><div><b>0</b><span>PAPER FORMS</span></div></div>
            ${taskList([
              { n: '01', title: 'Receive PO-88213', sub: 'Put away in B-04 · 07:24', tag: 'DONE', st: 'done' },
              { n: 'R', title: 'Refill Aisle 2 · screws', sub: '20 boxes from C-03 · 4 m 12 s', tag: 'DONE', st: 'done' },
              { n: '02', title: 'FEFO: rotate SikaFlex #388', sub: 'Bay B-04 · expires in 14 days', tag: 'NEXT', st: 'now' },
              TASKS_PLAN[2],
            ])}
          </div>`,
        })
      }
      return shell({
        time: '07:02',
        zone: 'ZONE A · DOCK 2',
        tab: 'tasks',
        main: `<div class="ph-pad">
            <div class="ph-hello v-in"><small>MON 26 OCT · SHIFT 07:00–15:00</small><h2>Good morning, <b>Mads</b></h2><p>Your action guide, sorted by urgency. Velo planned the route; you decide the order.</p></div>
            ${taskList(TASKS_PLAN)}
          </div>
          <div class="ph-cta v-in v-in-5"><button class="v-btn v-btn--fill" data-tap="start" data-act="start">Start receiving →</button></div>`,
      })
    },

    scan(state, opts = {}) {
      const lookup = state === 'lookup'
      const hit = state === 'detected' || lookup
      const lk = lookup || opts.lookup
      return shell({
        time: '07:21',
        zone: lk ? 'ZONE B · LOOKUP' : 'ZONE A · DOCK 2',
        tab: 'scan',
        back: opts.back,
        main: `<div class="ph-cam"${hit ? '' : ' data-act="scan" role="button" aria-label="Scan the label"'}>
            <div class="cam-box"></div>
            <div class="cam-top"><span class="v-chip v-chip--ink">${lk ? 'STOCK LOOKUP' : 'PO-88213'}</span><span class="v-chip">${hit ? 'READ ✓' : opts.hint || '1 / 1 PALLET'}</span></div>
            <div class="cam-label">
              <div class="cam-label__sup"><span>SIKA DANMARK A/S</span><span>SSCC 1</span></div>
              <div class="cam-label__name">SikaFlex-11FC 300 ml</div>
              <div class="cam-label__meta"><span>24 CTN · BATCH 412</span><span>EXP 2027-03-14</span></div>
              ${barcode('5 701234 567898')}
            </div>
            <div class="cam-frame${hit ? ' is-hit' : ''}"><i></i><i></i><i></i><i></i><span class="cam-beam"></span>${hit ? '<span class="cam-hit">✓</span>' : ''}</div>
            <div class="cam-mode"><span class="on">PRODUCT · EAN-13</span><span>BAY · CODE-128</span></div>
          </div>
          <div class="ph-sheet">${
            lookup
              ? `<div class="sheet-hd v-in"><span class="v-chip v-chip--deep">✓ FOUND</span><small>EAN-13 · 138 MS</small></div>
                 <h3 class="v-in v-in-2">SikaFlex-11FC sealant 300 ml</h3>
                 <dl class="kv v-in v-in-3"><div><dt>ON SHELF</dt><dd>12 · AISLE 7</dd></div><div><dt>BACKROOM</dt><dd>${opts.stored || 24} CTN · B-04</dd></div><div><dt>SELL FIRST</dt><dd>#388 · 14 DAYS</dd></div><div><dt>NEXT DELIVERY</dt><dd>THU 29 OCT</dd></div></dl>
                 <p class="sheet-note v-in v-in-4">Same label, different job: outside receiving, a scan becomes a stock lookup.</p>
                 <div class="sheet-act v-in v-in-5"><button class="v-btn" data-act="rescan">Scan another</button></div>`
              : hit
              ? `<div class="sheet-hd v-in"><span class="v-chip v-chip--deep">✓ DETECTED</span><small>EAN-13 · 142 MS</small></div>
                 <h3 class="v-in v-in-2">SikaFlex-11FC sealant 300 ml</h3>
                 <dl class="kv v-in v-in-3"><div><dt>BATCH</dt><dd>#412</dd></div><div><dt>EXPIRES</dt><dd>14 MAR 2027</dd></div><div><dt>QUANTITY</dt><dd>24 CTN</dd></div><div><dt>DELIVERY NOTE</dt><dd>MATCH ✓</dd></div></dl>
                 <p class="sheet-note v-in v-in-4">Logged against PO-88213. No paper checklist, no relabeling.</p>
                 ${opts.next ? '<div class="sheet-act v-in v-in-5"><button class="v-btn v-btn--fill" data-act="suggest">Find a bay →</button></div>' : ''}`
              : `<div class="sheet-wait"><span class="v-dots"><i></i><i></i><i></i></span>${opts.tapHint ? 'Tap the camera to scan the label' : 'Point the camera at the pallet label'}</div>
                 ${opts.tapHint ? '<div class="sheet-act"><button class="v-btn v-btn--fill" data-act="scan">Scan label</button></div>' : ''}
                 <p class="sheet-note">Works with the EAN-13 and Code-128 labels already in the store.</p>`
          }</div>`,
      })
    },

    putaway(state, opts = {}) {
      const done = state === 'confirmed'
      const cells = []
      for (const r of 'ABCD') for (let c = 1; c <= 6; c++) {
        const id = `${r}-0${c}`
        cells.push(`<span class="mini__c${id === 'B-04' ? ' is-target' : ''}">${id === 'B-04' ? 'B-04' : ''}</span>`)
      }
      return shell({
        time: done ? '07:24' : '07:22',
        zone: 'ZONE A → B',
        tab: 'scan',
        back: opts.back,
        main: `<div class="ph-pad">
            <div class="ai-hd v-in"><span class="v-lbl ai-badge">AI SUGGESTION · LOCAL</span><span class="v-chip">24 CTN · #412</span></div>
            <div class="bay-big v-in v-in-2"><small>PUT AWAY IN</small><b>BAY B-04</b><span>Back warehouse · row B · level 1</span></div>
            <div class="mini v-in v-in-3"><div class="mini__grid"><span class="mini__dock">DOCK 2</span>${cells.join('')}</div>
              <div class="mini__foot"><span>DOCK 2 → ROW B → B-04</span><span>38 M · 1 MIN</span></div></div>
            <ul class="why v-in v-in-4">
              <li><span><b>Front-accessible bay.</b> SikaFlex sells about 40 cartons a week.</span></li>
              <li><span><b>Same SKU already here.</b> Older batch #388 stays in front, so it leaves first.</span></li>
              <li><span><b>Shortest walk</b> from Dock 2 with space for 24 cartons.</span></li>
            </ul>
          </div>
          <div class="ph-actions">${
            done
              ? `<div class="ok-row v-in"><span class="v-ok">✓</span><div><b>Put-away confirmed</b><span>CODE-128 · ZONE-WH-BAY-04 · 07:24</span></div></div>
                 ${opts.next ? '<button class="v-btn v-btn--fill" data-act="home">Next task →</button>' : '<p class="fine">The store map is updated for everyone.</p>'}`
              : `<button class="v-btn v-btn--fill" data-tap="confirm" data-act="confirm">Scan bay label to confirm</button>
                 <button class="v-btn v-btn--link" data-act="other-bay">Bay blocked? Scan any bay instead</button>`
          }</div>`,
      })
    },

    refill(state, opts = {}) {
      if (state === 'notify') {
        return shell({
          time: '10:14',
          zone: 'ZONE B · WAREHOUSE',
          tab: 'tasks',
          main: `<div class="ph-push"><img src="${LOGO}" alt=""><div><small><span>VELO · REFILL</span><span>NOW</span></small><b>Aisle 2 needs a refill</b><p>Decking screws: 3 left after a checkout on Lane 2.</p></div></div>
            <div class="ph-pad ph-dim">
              <div class="ph-hello"><small>MON 26 OCT · SHIFT 07:00–15:00</small><h2>Action <b>guide</b></h2></div>
              ${taskList([
                { n: '01', title: 'Receive PO-88213', sub: 'Put away in B-04 · 07:24', tag: 'DONE', st: 'done' },
                { n: '02', title: 'FEFO: rotate SikaFlex #388', sub: 'Bay B-04 · expires in 14 days', tag: 'FEFO', st: 'now' },
                TASKS_PLAN[2],
              ])}
            </div>`,
        })
      }
      const step = { task: 0, picking: 2, done: 3 }[state]
      const steps = [
        ['Walk to Bay C-03', '52 M'],
        ['Scan bay + product', '2 SCANS'],
        ['Restock Aisle 2', '20 BOXES'],
      ]
      const done = state === 'done'
      const shelf = done ? 23 : 3
      return shell({
        time: done ? '10:18' : state === 'picking' ? '10:17' : '10:14',
        zone: done ? 'ZONE C · AISLE 2' : 'ZONE B · C-03',
        tab: 'tasks',
        back: opts.back,
        main: `<div class="ph-pad">
            <div class="rf-hd v-in"><span class="v-chip v-chip--deep">ASSISTED REFILL · P1</span><small>FROM POS · LANE 2</small></div>
            <h2 class="rf-title v-in v-in-2">Decking screws 4.5×50 A2</h2>
            <div class="rf-stock v-in v-in-3"><b>${shelf}<small> ON SHELF</small></b>
              <div><div class="rf-meter"><i style="width:${Math.min(100, (shelf / 30) * 100)}%"></i><em style="left:33.3%"></em></div>
              <div class="rf-meter__lbl"><span>AISLE 2</span><span>MIN 10</span><span>CAP 30</span></div></div></div>
            <div class="rf-pick v-in v-in-4"><div><small>PICK</small><b>20 boxes</b></div><div><small>FROM</small><b>Bay C-03</b></div><div><small>BATCH</small><b>#401 oldest</b></div></div>
            <ol class="steps v-in v-in-5">${steps
              .map(([t, s], i) => `<li class="${i < step ? 'is-done' : i === step ? 'is-now' : ''}"><i>${i < step ? '✓' : i + 1}</i>${t}<span>${s}</span></li>`)
              .join('')}</ol>
            <div class="rf-why v-in v-in-5"><span class="v-lbl">WHY THIS BATCH</span><p>#401 arrived on 12 Aug and is the oldest of the three screw batches in the store. Picking it first keeps the backroom rotating.</p></div>
          </div>
          <div class="ph-actions">${
            done
              ? `<div class="ok-row v-in"><span class="v-ok">✓</span><div><b>Refill complete · 4 m 12 s</b><span>AISLE 2: 23 ON SHELF · SALE → SHELF</span></div></div>
                 ${opts.next ? '<button class="v-btn v-btn--fill" data-act="home">Back to tasks →</button>' : ''}
                 <p class="fine">Bay C-03 is low now. Velo drafted a restock order for your manager.</p>`
              : state === 'picking'
                ? `<div class="ok-row v-in"><span class="v-ok">✓</span><div><b>Pick confirmed</b><span>C-03 · BATCH #401 · 20 BOXES</span></div></div>
                   <button class="v-btn v-btn--fill" data-act="restock">Confirm shelf restocked</button>`
                : `<button class="v-btn v-btn--fill" data-tap="pick" data-act="pick">Scan to pick</button>
                   <button class="v-btn v-btn--link" data-act="handover">Can't do it now? Hand over to Sofie</button>`
          }</div>`,
      })
    },

    ask(state) {
      const q = 'Where are the extra pallets of 15 mm fire-rated gypsum, is any batch expiring, and does it meet TEK17 fire wall rules?'
      const intro = `<div class="msg msg--ai v-in"><span class="msg__who">VELO COPILOT</span>Ask about stock, locations or product specs. Answers come from this store's data and documents, on the local server.</div>`
      let chat = intro
      if (state !== 'typing') chat += `<div class="msg msg--me v-in"><span class="msg__who">MADS K.</span>${q}</div>`
      if (state === 'thinking') {
        chat += `<div class="msg msg--ai think v-in"><span class="v-dots"><i></i><i></i><i></i></span>Searching live stock and 2,140 local documents…</div>`
      }
      if (state === 'answered') {
        chat += `<div class="msg msg--ai is-wide v-in"><span class="msg__who">VELO COPILOT · 1.6 S</span>
            <div class="ans"><span class="v-lbl">STOCK &amp; LOCATION</span><p><b>4</b> on the front shelf, Aisle 5. <b>32 pallets</b> in Bay D-01. Batch #204 expires first, in 45 days.</p></div>
            <div class="ans"><span class="v-lbl">TECHNICAL ANSWER</span><p>Yes. It meets TEK17 REI 60 fire resistance when installed in double layers.</p></div>
            <div class="src"><span class="v-chip">GYPROC DATASHEET · P.4</span><span class="v-chip">TEK17 · CH. 11</span><span class="v-chip">STOCK · LIVE</span></div>
            <div class="ans-meta">ON-PREMISE · 0 EXTERNAL CALLS</div></div>`
      }
      const box =
        state === 'typing'
          ? `<div class="ph-input__box">${q}<span class="ph-input__caret"></span></div>`
          : `<div class="ph-input__box is-empty">Ask in Danish, Norwegian or Swedish…</div>`
      return shell({
        time: '11:05',
        zone: 'ZONE C · AISLE 5',
        tab: 'ask',
        main: `<div class="chat">${chat}</div><div class="ph-input">${box}<span class="ph-input__send">→</span></div>`,
      })
    },
  }

  function phone(screen, state, opts) {
    return PHONE[screen](state, opts)
  }

  /* ================= dashboard ================= */

  const DASH = ['idle', 'received', 'pos', 'refilled', 'approved']
  const CLOCK = ['07:05', '07:24', '10:14', '10:18', '10:19']

  const EVENTS = [
    { s: 0, t: '06:00', k: 'SYNC', x: 'ERP orders, POS and 30,412 SKUs indexed on the local server' },
    { s: 0, t: '06:30', k: 'FEFO', x: '3 batches expire within 14 days · added to action guides' },
    { s: 0, t: '07:02', k: 'SHIFT', x: 'Mads K. checked in · 3 tasks planned, sorted by urgency' },
    { s: 1, t: '07:21', k: 'SCAN', x: 'PO-88213 · 24 ctn SikaFlex-11FC #412 · EAN-13 · 142 ms' },
    { s: 1, t: '07:24', k: 'PUT-AWAY', x: 'Bay B-04 confirmed by Code-128 scan · Mads K.' },
    { s: 2, t: '10:14', k: 'POS', x: 'Lane 2 · sold 15 × decking screws 4.5×50 A2' },
    { s: 2, t: '10:14', k: 'REFILL', x: 'Aisle 2 at 3, below min 10 → task sent to Mads K.', hot: true },
    { s: 3, t: '10:17', k: 'PICK', x: '20 boxes from C-03 · batch #401 (oldest) · scan confirmed' },
    { s: 3, t: '10:18', k: 'SHELF', x: 'Aisle 2 restocked to 23 · sale → shelf in 4 m 12 s' },
    { s: 3, t: '10:18', k: 'DRAFT', x: 'C-03 at 60, below safety stock 80 → restock order awaits approval', hot: true },
    { s: 4, t: '10:19', k: 'APPROVED', x: 'Ingrid H. approved PO-88342 · 200 boxes · sent to ERP' },
  ]

  function tasksFor(i) {
    return [
      { n: 'Receive PO-88213', z: 'A', who: 'MADS K.', st: i >= 1 ? 'DONE' : 'NOW' },
      { n: 'Refill Aisle 2 · screws', z: 'B→C', who: 'MADS K.', st: i < 2 ? null : i === 2 ? 'SENT' : 'DONE' },
      { n: 'FEFO rotate SikaFlex #388', z: 'B', who: 'MADS K.', st: 'QUEUED' },
      { n: 'Move mortar M5 #77 to front', z: 'B→C', who: 'MADS K.', st: 'QUEUED' },
      { n: 'Click & Collect · 3 orders', z: 'C', who: 'SOFIE L.', st: i >= 2 ? 'PICKING' : 'QUEUED' },
      { n: 'Approve restock order', z: 'MGR', who: 'INGRID H.', st: i < 3 ? null : i === 3 ? 'WAITING' : 'DONE' },
    ].filter((r) => r.st)
  }

  const MAP = [
    { 'D-2': { c: 'src', n: 'TRUCK 07:20' }, 'B-04': { c: 'fefo' }, 'B-02': { c: 'fefo' }, 'C-05': { c: 'fefo' } },
    { 'D-2': { n: 'UNLOADED' }, 'B-04': { c: 'target fefo', n: '+24 CTN', pin: 'MK' }, 'B-02': { c: 'fefo' }, 'C-05': { c: 'fefo' } },
    { 'L-2': { c: 'target', n: 'SALE −15' }, 'A-2': { c: 'alert', n: '3 / MIN 10' }, 'C-03': { c: 'src', n: '80 BOX' }, 'B-04': { c: 'fefo' }, 'B-02': { c: 'fefo' }, 'C-05': { c: 'fefo' } },
    { 'A-2': { c: 'target', n: '23 / MIN 10', pin: 'MK' }, 'C-03': { c: 'alert', n: '60 < 80' }, 'B-04': { c: 'fefo' }, 'B-02': { c: 'fefo' }, 'C-05': { c: 'fefo' } },
    { 'A-2': { n: '23 / MIN 10' }, 'C-03': { c: 'src', n: 'PO SENT' }, 'B-04': { c: 'fefo' }, 'B-02': { c: 'fefo' }, 'C-05': { c: 'fefo' } },
  ]

  function cell(i, id, label) {
    const m = MAP[i][id] || {}
    const cls = (m.c || '').split(' ').filter(Boolean).map((c) => ' is-' + c).join('')
    return `<span class="cell${cls}">${label}${m.n ? `<em>${m.n}</em>` : ''}${m.pin ? `<span class="pin">${m.pin}</span>` : ''}</span>`
  }

  function storeMap(i) {
    const docks = [1, 2, 3].map((n) => cell(i, `D-${n}`, `DOOR ${n}`)).join('')
    let bays = ''
    for (const r of 'ABCD') for (let c = 1; c <= 6; c++) bays += cell(i, `${r}-0${c}`, `${r}-0${c}`)
    const aisles = [1, 2, 3, 4, 5, 6].map((n) => cell(i, `A-${n}`, `AISLE ${n}`)).join('')
    const lanes = [1, 2, 3].map((n) => cell(i, `L-${n}`, `LANE ${n}`)).join('')
    return `<div class="db-map">
        <div class="mz mz--a"><span class="mz__lbl">A · DOCK</span><div class="cells">${docks}</div></div>
        <div class="mz mz--b"><span class="mz__lbl">B · BACK WAREHOUSE</span><div class="cells">${bays}</div></div>
        <div class="mz mz--c"><span class="mz__lbl">C · FRONT FLOOR</span><div class="cells">${aisles}</div></div>
        <div class="mz mz--d"><span class="mz__lbl">D · POS CHECKOUT</span><div class="cells">${lanes}</div></div>
      </div>
      <div class="db-legend">
        <span><i style="background:var(--yellow-deep);border-color:var(--ink)"></i>ACTIVE</span>
        <span><i style="background:var(--yellow)"></i>STOCK SOURCE</span>
        <span><i style="background:var(--ink);border-color:var(--ink)"></i>NEEDS ACTION</span>
        <span><i class="lg-fefo"></i>EXPIRES ≤ 14 DAYS</span>
        <span><b class="lg-pin">MK</b>CLERK</span>
      </div>`
  }

  function kpis(i) {
    const open = tasksFor(i).filter((t) => t.st !== 'DONE').length
    const shelf = ['97.8%', '97.8%', '97.1%', '98.4%', '98.4%'][i]
    const shelfSub = ['across 412 shelf faces', 'across 412 shelf faces', 'Aisle 2 below minimum', 'Aisle 2 back above minimum', 'Aisle 2 back above minimum'][i]
    const refill = ['6m 40s', '6m 40s', 'RUNNING', '4m 12s', '4m 12s'][i]
    const refillSub = ['7-day average', '7-day average', 'task sent 10:14', 'last refill · Aisle 2', 'last refill · Aisle 2'][i]
    const k = (lbl, val, sub, hot) => `<div class="db-kpi${hot ? ' is-hot' : ''}"><span class="v-lbl">${lbl}</span><b>${val}</b><span>${sub}</span></div>`
    return `<div class="db-kpis">
        ${k('Shelf availability', shelf, shelfSub, i === 2 || i === 3)}
        ${k('Open tasks', open, `${tasksFor(i).length - open} done today`, i === 2)}
        ${k('Expiring ≤ 14 days', '3 batches', 'all in action guides', false)}
        ${k('Sale → shelf', refill, refillSub, i === 3)}
      </div>`
  }

  function fefo(i) {
    return `<div class="db-card"><div class="db-card__hd"><h2>FEFO watch</h2><small>FIRST EXPIRED, FIRST OUT</small></div>
        <table class="db-table"><thead><tr><th>Batch</th><th>Bay</th><th>Expires</th><th>Velo suggests</th></tr></thead><tbody>
          <tr><td><b>SikaFlex-11FC #388</b>${i >= 1 ? '<small>New batch #412 stored behind it</small>' : ''}</td><td>B-04</td><td><span class="v-chip v-chip--deep">14 DAYS</span></td><td>Sell #388 first</td></tr>
          <tr><td><b>Mortar M5 25 kg #77</b></td><td>B-02</td><td><span class="v-chip v-chip--ink">9 DAYS</span></td><td>Move to Aisle 4 front</td></tr>
          <tr><td><b>Tile grout CG2 #19</b></td><td>C-05</td><td><span class="v-chip v-chip--deep">12 DAYS</span></td><td>Bundle with tile offer</td></tr>
        </tbody></table></div>`
  }

  function approval(i) {
    const done = i >= 4
    return `<div class="db-card"><div class="db-card__hd"><h2>${done ? 'Restock order approved' : 'Needs your approval'}</h2><small>VELO NEVER ORDERS ON ITS OWN</small></div>
        <div class="db-appr">
          <div class="db-appr__body">
            <h3>Draft restock order · decking screws 4.5×50 A2</h3>
            <p>Bay C-03 dropped to 60 boxes after the Aisle 2 refill, below its safety stock of 80. Seven-day sales: 112 boxes.</p>
            <div class="db-appr__kv"><div><span class="v-lbl">QUANTITY</span><b>200 boxes</b></div><div><span class="v-lbl">SUPPLIER</span><b>ERP #S-2207</b></div><div><span class="v-lbl">ARRIVES</span><b>Wed 28 Oct</b></div></div>
          </div>
          <div class="db-appr__act">${
            done
              ? `<div class="db-stamp"><b>✓ APPROVED</b><span>Ingrid H. · 10:19<br>PO-88342 sent to ERP</span></div>`
              : `<button class="v-btn v-btn--fill" data-tap="approve">Approve order</button><button class="v-btn">Edit quantity</button><button class="v-btn v-btn--link">Reject</button>`
          }</div>
        </div></div>`
  }

  function dash(key) {
    const i = Math.max(0, DASH.indexOf(key))
    const events = EVENTS.filter((e) => e.s <= i).reverse()
    const tasks = tasksFor(i)
    const stChip = { NOW: 'v-chip--deep', SENT: 'v-chip--deep', WAITING: 'v-chip--ink', PICKING: 'v-chip--pastel', DONE: '', QUEUED: '' }
    return `
      <div class="db-chrome"><i></i><i></i><i></i><span class="db-url"><b>LAN</b>velo.local/hub/odense-014</span></div>
      <div class="db-app">
        <aside class="db-side">
          <div class="db-brand"><img src="${LOGO}" alt=""><span>VELO</span></div>
          <div class="db-store"><span class="v-lbl">STORE</span><b>Odense 014 · DK</b></div>
          <nav class="db-nav"><a class="on">Overview</a><a>Zone map</a><a>Tasks</a><a>FEFO watch</a><a>Copilot</a><a>Network <em>PHASE 2</em></a></nav>
          <ul class="db-crew">
            <li><i>MK</i><span><b>Mads K.</b>Clerk · zones A–B</span></li>
            <li><i>SL</i><span><b>Sofie L.</b>Clerk · zone C</span></li>
            <li><i>IH</i><span><b>Ingrid H.</b>Store manager</span></li>
          </ul>
          <div class="db-sov"><b>LOCAL AI</b>Runs on the store server. 0 external API calls today.</div>
        </aside>
        <main class="db-main">
          <header class="db-head"><h1>Store hub · <b>Odense 014</b></h1><span class="v-chip v-chip--deep db-live">LIVE</span>
            <span class="db-clock">${CLOCK[i]}</span><span class="db-user"><i>IH</i><span><b>Ingrid H.</b>Store manager</span></span></header>
          ${kpis(i)}
          <div class="db-grid">
            <div class="db-col">
              <div class="db-card"><div class="db-card__hd"><h2>Store zone map</h2><small>UPDATED BY EVERY SCAN</small></div>${storeMap(i)}</div>
              ${i >= 3 ? approval(i) : fefo(i)}
            </div>
            <div class="db-col">
              <div class="db-card db-card--grow"><div class="db-card__hd"><h2>Live events</h2><small>WEBSOCKET</small></div>
                <ol class="db-feed">${events
                  .map((e) => `<li class="${e.s === i && i > 0 ? 'is-new' : ''}${e.hot && e.s === i ? ' is-hot' : ''}"><time>${e.t}</time><span class="v-chip">${e.k}</span><span>${e.x}</span></li>`)
                  .join('')}</ol></div>
              <div class="db-card"><div class="db-card__hd"><h2>Task queue</h2><small>${tasks.filter((t) => t.st !== 'DONE').length} OPEN</small></div>
                <table class="db-table"><tbody>${tasks
                  .map((t) => `<tr><td><b>${t.n}</b><small>${t.who} · ZONE ${t.z}</small></td><td style="text-align:right"><span class="v-chip ${stChip[t.st]}">${t.st}</span></td></tr>`)
                  .join('')}</tbody></table></div>
            </div>
          </div>
        </main>
      </div>`
  }

  global.VeloUI = { phone, dash, DASH, shell, taskList, LOGO }
})(window)
