// Rebuilds the whole VELO design in FigCraft (design/figcraft/velo.figcraft) from code.
//   node design/figcraft/build.mjs
// Needs figcraft-cli (env FIGCRAFT_CLI, default D:/Coding/Application/FigCraft/...) and the fonts in
// FIGCRAFT_FONTS (default D:/Coding/Application/FigCraft/fonts): Archivo Black, IBM Plex Sans, IBM Plex Mono.
// The source of truth for tokens is public/tokens.css; TOKENS in lib.mjs mirrors it.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { frame, rect, ellipse, text, image, instance, steps, push, ref, setupSteps, styleSteps, linkStyles } from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..', '..')
const CLI = process.env.FIGCRAFT_CLI ?? 'D:/Coding/Application/FigCraft/figcraft-0.17.0-windows-x64-portable/figcraft-cli.exe'
const FONTS = process.env.FIGCRAFT_FONTS ?? 'D:/Coding/Application/FigCraft/fonts'
const ASSETS = resolve(repo, 'public', 'assets').replaceAll('\\', '/')

const page = (name) => {
  push('page.add', { name })
  push('page.select', { index: pageCount++ })
}
let pageCount = 0
push('page.rename', { name: 'Design system' })
pageCount = 1
push('page.select', { index: 0 })

// ---------------------------------------------------------------- components
const comp = {}
function makeComponent(name, build, textLayerName) {
  const root = build()
  push('component.create', { ids: [ref(root)] })
  if (textLayerName) {
    push('node.find', { root: ref(root), type: 'TEXT', limit: 1 }, root + 't')
    push('component.addProperty', { id: ref(root), name: 'Label', type: 'text', layer: { $ref: root + 't', field: 'ids/0' } })
  }
  comp[name] = root
  return root
}

const dsBoard = frame(null, 'Components', { x: 0, y: 0, dir: 'v', gap: 32, pad: 48, fill: 'cream', sizeH: 'hug' })
text(dsBoard, 'Components', 'Display/H2')
const compRow = frame(dsBoard, 'Row', { dir: 'h', gap: 32, cross: 'min' })

function button(parent, label, primary) {
  const b = frame(parent, primary ? 'Button/Primary' : 'Button/Secondary', {
    dir: 'h', gap: 8, pad: [14, 22, 14, 22], fill: primary ? 'red' : 'paper', stroke: 'ink', sw: 3, shadow: { x: 3, y: 3, color: '#20201D' }, cross: 'center',
  })
  text(b, label, 'Label/Button', { color: primary ? 'white' : 'ink', name: 'Label' })
  return b
}
makeComponent('Button/Primary', () => button(compRow, 'Watch demo', true), true)
makeComponent('Button/Secondary', () => button(compRow, 'Meet the team', false), true)
makeComponent('Tag', () => {
  const t = frame(compRow, 'Tag', { dir: 'h', gap: 6, pad: [4, 8, 4, 8], fill: 'paper', stroke: 'ink', sw: 2, cross: 'center' })
  text(t, 'Deliveries', 'Label/Small', { name: 'Label' })
  return t
}, true)
makeComponent('Kicker', () => {
  const k = frame(compRow, 'Kicker', { dir: 'h', gap: 8, pad: [6, 12, 6, 12], fill: 'paper', stroke: 'ink', sw: 3, shadow: { x: 3, y: 3, color: '#20201D' }, cross: 'center' })
  text(k, '01 / What Velo does', 'Label/Default', { name: 'Label' })
  return k
}, true)

const btn = (parent, label, primary = true, set = {}) =>
  instance(parent, comp[primary ? 'Button/Primary' : 'Button/Secondary'], { props: { Label: label }, set })
const tag = (parent, label) => instance(parent, comp.Tag, { props: { Label: label } })
const kicker = (parent, label) => instance(parent, comp.Kicker, { props: { Label: label } })

// Colour + type reference board
const swatches = frame(dsBoard, 'Palette', { dir: 'h', gap: 16, wrap: true })
for (const [n, c, onDark] of [['ink', 'Dark Ink', true], ['ink-soft', 'Ink Soft', true], ['paper', 'Warm Paper'], ['cream', 'Stockroom Cream'], ['yellow', 'Bauhaus Yellow'], ['red', 'Workshop Red', true], ['blue', 'Cobalt Blue', true]]) {
  const s = frame(swatches, c, { dir: 'v', gap: 6, pad: 14, w: 168, h: 96, fill: n, stroke: 'ink', sw: 3, main: 'max' })
  text(s, c, 'Label/Small', { color: onDark ? 'paper' : 'ink' })
}

// ---------------------------------------------------------------- phone screens
function phoneShell(parent, name, w, h) {
  const shell = frame(parent, name, { dir: 'v', w, h, r: 44, fill: 'ink', pad: 10, clip: true })
  const screen = frame(shell, 'Screen', { dir: 'v', fill: 'paper', r: 34, clip: true, sizeH: 'fill', sizeV: 'fill' })
  return screen
}
function phoneHeader(screen, zone = 'Zone A · Dock 2') {
  const bar = frame(screen, 'Status', { dir: 'h', pad: [18, 22, 4, 22], main: 'spaceBetween', cross: 'center', sizeH: 'fill' })
  text(bar, '10:14', 'Label/Default')
  text(bar, '5G', 'Label/Small')
  const head = frame(screen, 'App bar', { dir: 'h', gap: 8, pad: [8, 16, 12, 16], cross: 'center', sizeH: 'fill', sides: [0, 0, 2, 0], stroke: 'ink', sw: 2 })
  text(head, 'Velo', 'Display/Brand')
  const sp = frame(head, 'spacer', { dir: 'h', sizeH: 'fill', h: 1 })
  const chip = frame(head, 'Zone chip', { dir: 'h', pad: [3, 8, 3, 8], fill: 'yellow', stroke: 'ink', sw: 2 })
  text(chip, zone, 'Label/Small')
  const me = frame(head, 'Avatar', { dir: 'h', w: 30, h: 30, fill: 'yellow', stroke: 'ink', sw: 2, main: 'center', cross: 'center' })
  text(me, 'MK', 'Label/Small')
}
function tabBar(screen, active) {
  const bar = frame(screen, 'Tab bar', { dir: 'h', sizeH: 'fill', pad: [12, 8, 22, 8], sides: [2, 0, 0, 0], stroke: 'ink', sw: 2, main: 'spaceEvenly', fill: 'paper' })
  for (const t of ['Tasks', 'Scan', 'Ask', 'Map']) text(bar, t, 'Label/Small', { color: t === active ? 'red' : 'ink-soft' })
}
function taskRow(parent, n, title, sub, tagText, now) {
  const row = frame(parent, 'Task ' + n, { dir: 'h', gap: 10, pad: 12, cross: 'center', sizeH: 'fill', fill: now ? 'yellow' : 'paper', stroke: 'ink', sw: 2, shadow: { x: 3, y: 3, color: '#20201D' } })
  const num = frame(row, 'n', { dir: 'h', w: 30, h: 30, fill: now ? 'ink' : 'cream', stroke: 'ink', sw: 2, main: 'center', cross: 'center' })
  text(num, n, 'Label/Small', { color: now ? 'yellow' : 'ink' })
  const col = frame(row, 'Text', { dir: 'v', gap: 2, sizeH: 'fill' })
  text(col, title, 'Body/Strong', { fill: true })
  text(col, sub, 'Body/Small', { fill: true, color: 'text-muted' })
  const t = frame(row, 'Tag', { dir: 'h', pad: [3, 8, 3, 8], fill: now ? 'red' : 'paper', stroke: 'ink', sw: 2 })
  text(t, tagText, 'Label/Small', { color: now ? 'white' : 'ink' })
}
function tasksScreen(screen) {
  phoneHeader(screen)
  const body = frame(screen, 'Body', { dir: 'v', gap: 12, pad: [16, 16, 16, 16], sizeH: 'fill', sizeV: 'fill', fill: 'cream' })
  text(body, 'Mon 26 Oct · Shift 07:00–15:00', 'Label/Small', { color: 'ink-soft' })
  text(body, 'Good morning, Mads', 'Display/Number', { fill: true })
  text(body, 'Your action guide, sorted by urgency. Velo planned the route; you decide the order.', 'Body/Small', { fill: true })
  taskRow(body, '01', 'Receive PO-88213', 'Dock 2 · truck 07:20 · 24 cartons', 'NOW', true)
  taskRow(body, '02', 'FEFO: rotate SikaFlex #388', 'Bay B-04 · expires in 14 days', 'FEFO')
  taskRow(body, '03', 'Move mortar M5 #77 to front', 'Bay B-02 → Aisle 4 · 9 days left', 'FEFO')
  frame(body, 'flex', { dir: 'v', sizeH: 'fill', sizeV: 'fill', h: 1 })
  btn(body, 'Start receiving', true, { sizingH: 'fill', mainAlign: 'center' })
  tabBar(screen, 'Tasks')
}
function refillScreen(screen, compact = false) {
  phoneHeader(screen, 'Zone C · Lane 2')
  const body = frame(screen, 'Body', { dir: 'v', gap: 12, pad: 16, sizeH: 'fill', sizeV: 'fill', fill: 'cream' })
  const top = frame(body, 'Meta', { dir: 'h', main: 'spaceBetween', cross: 'center', sizeH: 'fill' })
  const urgent = frame(top, 'Urgent', { dir: 'h', pad: [3, 8, 3, 8], fill: 'red', stroke: 'ink', sw: 2 })
  text(urgent, 'Shelf refill · P1', 'Label/Small', { color: 'white' })
  if (!compact) text(top, 'From POS · Lane 2', 'Label/Small', { color: 'ink-soft' })
  text(body, 'Decking screws 4.5×50 A2', 'Display/H3', { fill: true })
  const meter = frame(body, 'Shelf level', { dir: 'h', gap: 10, pad: 12, cross: 'center', sizeH: 'fill', fill: 'paper', stroke: 'ink', sw: 2 })
  text(meter, '3', 'Display/Stat', { color: 'red' })
  const mcol = frame(meter, 'col', { dir: 'v', gap: 2, sizeH: 'fill' })
  text(mcol, 'On shelf · Aisle 2', 'Label/Small')
  text(mcol, 'Min 20 · Cap 36', 'Body/Small', { color: 'text-muted' })
  const pick = frame(body, 'Pick', { dir: 'h', gap: 8, pad: 12, sizeH: 'fill', fill: 'yellow', stroke: 'ink', sw: 2, main: 'spaceBetween' })
  for (const [k, v] of [['Pick', '20 boxes'], ['From', 'Bay C-03'], ['Batch', compact ? '#401' : '#401 oldest']]) {
    const c = frame(pick, k, { dir: 'v', gap: 2 })
    text(c, k, 'Label/Small', { color: 'ink-soft' })
    text(c, v, 'Body/Strong')
  }
  for (const [i, t, s] of [['1', 'Walk to C-03', '12 m'], ['2', 'Scan bay + product', '2 scans'], ['3', 'Restock Aisle 2', '20 boxes']]) {
    const r = frame(body, 'Step ' + i, { dir: 'h', gap: 10, pad: 10, cross: 'center', sizeH: 'fill', fill: 'paper', stroke: 'ink', sw: 2 })
    const n = frame(r, 'n', { dir: 'h', w: 26, h: 26, stroke: 'ink', sw: 2, main: 'center', cross: 'center', fill: 'cream' })
    text(n, i, 'Label/Small')
    text(r, t, 'Body/Strong', { fill: true })
    text(r, s, 'Label/Small', { color: 'ink-soft' })
  }
  if (!compact) {
    const why = frame(body, 'Why', { dir: 'v', gap: 4, pad: 12, sizeH: 'fill', stroke: 'ink', sw: 2 })
    text(why, 'Why this batch', 'Label/Small')
    text(why, '#401 arrived on 12 Aug and is the oldest of the three screw batches in the store. Picking it first keeps the back room fresh.', 'Body/Small', { fill: true })
  }
  frame(body, 'flex', { dir: 'v', sizeH: 'fill', sizeV: 'fill', h: 1 })
  btn(body, 'Scan to pick', true, { sizingH: 'fill', mainAlign: 'center' })
  tabBar(screen, 'Tasks')
}
function scanScreen(screen) {
  phoneHeader(screen, 'Zone B · Dock 2')
  const cam = frame(screen, 'Camera', { dir: 'v', fill: 'ink', sizeH: 'fill', sizeV: 'fill', main: 'center', cross: 'center', gap: 20 })
  const finder = frame(cam, 'Viewfinder', { dir: 'v', w: 260, h: 170, stroke: 'yellow', sw: 4, main: 'center', cross: 'center' })
  rect(finder, 'Laser', { w: 220, h: 3, fill: 'red' })
  const label = frame(cam, 'Label', { dir: 'v', gap: 4, pad: 12, w: 262, fill: 'paper', stroke: 'ink', sw: 2, shadow: { x: 4, y: 4, color: '#20201D' } })
  text(label, 'PO-88213 · SikaFlex-11FC', 'Label/Small')
  text(label, 'EAN-13 · 24 ctn · batch #412', 'Body/Small', { color: 'text-muted' })
  const mode = frame(cam, 'Mode', { dir: 'h', stroke: 'paper', sw: 2 })
  for (const [m, on] of [['Receive', true], ['Pick', false], ['Check', false]]) {
    const c = frame(mode, m, { dir: 'h', pad: [6, 10, 6, 10], fill: on ? 'red' : 'none' })
    text(c, m, 'Label/Small', { color: on ? 'white' : 'paper' })
  }
  const sheet = frame(screen, 'Suggestion', { dir: 'v', gap: 8, pad: 16, sizeH: 'fill', sides: [2, 0, 0, 0], stroke: 'ink', sw: 2, fill: 'paper' })
  const h = frame(sheet, 'hd', { dir: 'h', main: 'spaceBetween', sizeH: 'fill', cross: 'center' })
  text(h, 'AI suggestion · Local', 'Label/Small', { color: 'red' })
  tag(h, '24 ctn · #412')
  text(sheet, 'Store in Bay B-04', 'Display/H3', { fill: true })
  text(sheet, 'Same SKU already here. Older batch #388 stays in front, so it leaves first.', 'Body/Small', { fill: true })
  btn(sheet, 'Confirm put-away', true, { sizingH: 'fill', mainAlign: 'center' })
  tabBar(screen, 'Scan')
}
function askScreen(screen) {
  phoneHeader(screen, 'Zone A · Aisle 5')
  const body = frame(screen, 'Chat', { dir: 'v', gap: 12, pad: 16, sizeH: 'fill', sizeV: 'fill', fill: 'cream' })
  const q = frame(body, 'Question', { dir: 'v', pad: 12, sizeH: 'fill', fill: 'yellow', stroke: 'ink', sw: 2 })
  text(q, 'Where is the extra gypsum 15 mm fire-rated stock?', 'Body/Strong', { fill: true })
  const a = frame(body, 'Answer', { dir: 'v', gap: 6, pad: 12, sizeH: 'fill', fill: 'paper', stroke: 'ink', sw: 2, shadow: { x: 3, y: 3, color: '#20201D' } })
  text(a, 'Stock & location', 'Label/Small', { color: 'red' })
  text(a, '4 on the front shelf, Aisle 5. 32 pallets in Bay D-01. Batch #204 expires first, in 45 days.', 'Body/Regular', { fill: true })
  const q2 = frame(body, 'Question 2', { dir: 'v', pad: 12, sizeH: 'fill', fill: 'yellow', stroke: 'ink', sw: 2 })
  text(q2, 'Is this board approved for a fire wall?', 'Body/Strong', { fill: true })
  const a2 = frame(body, 'Answer 2', { dir: 'v', gap: 6, pad: 12, sizeH: 'fill', fill: 'paper', stroke: 'ink', sw: 2 })
  text(a2, 'Answer · under 2 s', 'Label/Small', { color: 'red' })
  text(a2, 'Yes. Type F boards meet EI 60 in a double layer. Source: product sheet, section 4.', 'Body/Regular', { fill: true })
  frame(body, 'flex', { dir: 'v', sizeH: 'fill', sizeV: 'fill', h: 1 })
  const input = frame(body, 'Input', { dir: 'h', gap: 8, sizeH: 'fill', cross: 'center' })
  const box = frame(input, 'Field', { dir: 'h', pad: 12, sizeH: 'fill', fill: 'white', stroke: 'ink', sw: 2 })
  text(box, 'Ask about a product…', 'Body/Small', { color: 'text-muted' })
  const send = frame(input, 'Send', { dir: 'h', w: 42, h: 42, fill: 'red', stroke: 'ink', sw: 2, main: 'center', cross: 'center' })
  text(send, '→', 'Label/Button', { color: 'white' })
  tabBar(screen, 'Ask')
}

page('App screens')
const screensRow = frame(null, 'Clerk app', { dir: 'h', gap: 64, pad: 64, fill: 'yellow', cross: 'min' })
for (const [name, fn] of [['Tasks', tasksScreen], ['Refill task', refillScreen], ['Scan', scanScreen], ['Ask', askScreen]]) {
  const col = frame(screensRow, name, { dir: 'v', gap: 16 })
  text(col, name, 'Label/Default')
  fn(phoneShell(col, name + ' screen', 390, 844))
}

// ---------------------------------------------------------------- landing page
function landing(M) {
  const W = M ? 390 : 1440
  const PAD = M ? 20 : 100
  const H1 = M ? 'Display/H1 mobile' : 'Display/H1'
  const H2 = M ? 'Display/H2 mobile' : 'Display/H2'
  const root = frame(null, M ? 'Landing — Mobile 390' : 'Landing — Desktop 1440', { dir: 'v', w: W, fill: 'paper', sizeV: 'hug' })
  const section = (name, fill, o = {}) =>
    frame(root, 'Section: ' + name, { dir: 'v', gap: o.gap ?? (M ? 24 : 40), pad: o.pad ?? [M ? 48 : 96, PAD, M ? 48 : 96, PAD], fill, sizeH: 'fill', sides: o.sides ?? [0, 0, 4, 0], stroke: 'ink', sw: 4, ...o.extra })
  const cols = (parent, name, n, o = {}) => frame(parent, (M ? 'Stack: ' : o.eq === false ? 'Row: ' : 'Eq: ') + name, { dir: M ? 'v' : 'h', gap: o.gap ?? (M ? 16 : 24), sizeH: 'fill', cross: 'min', ...o.extra })
  const head = (parent, label, title, body, onDark) => {
    const c = frame(parent, 'Section head', { dir: 'v', gap: M ? 12 : 16, sizeH: 'fill' })
    kicker(c, label)
    text(c, title, H2, { fill: true, color: onDark ? 'paper' : 'ink' })
    if (body) text(c, body, M ? 'Body/Regular' : 'Body/Large', { w: M ? W - 2 * PAD : 760, color: onDark ? 'text-muted-on-dark' : 'ink' })
    return c
  }
  const card = (parent, name, o = {}) => frame(parent, name, { dir: 'v', gap: 12, pad: M ? 20 : 28, fill: o.fill ?? 'paper', stroke: o.stroke ?? 'ink', sw: 3, sizeH: 'fill', ...o.extra })

  // nav
  const nav = frame(root, 'Nav', { dir: 'h', pad: [12, PAD, 12, PAD], cross: 'center', main: 'spaceBetween', sizeH: 'fill', fill: 'paper', sides: [0, 0, 4, 0], stroke: 'ink', sw: 4 })
  image(nav, 'Velo logo', `${ASSETS}/LogoName.png`, { w: 96, h: 54 })
  if (!M) {
    const links = frame(nav, 'Links', { dir: 'h', gap: 28, cross: 'center' })
    for (const [n, l] of [['01', 'Product'], ['02', 'Plan'], ['03', 'Tech'], ['04', 'Timeline'], ['05', 'Team'], ['06', 'FAQ']]) {
      const a = frame(links, l, { dir: 'h', gap: 4 })
      text(a, n, 'Label/Small', { color: 'red' })
      text(a, l, 'Label/Small')
    }
    const acts = frame(nav, 'Actions', { dir: 'h', gap: 12 })
    btn(acts, 'Watch demo', false)
    btn(acts, 'Try the app', true)
  } else btn(nav, 'Menu', false)

  // hero
  const hero = section('Hero', 'yellow', { gap: M ? 32 : 48, extra: { clip: true } })
  const heroRow = cols(hero, 'Hero columns', 2, { gap: 64, eq: false })
  const left = frame(heroRow, 'Copy', { dir: 'v', gap: M ? 20 : 28, sizeH: 'fill' })
  kicker(left, 'Netcompany IT Consultant Challenge 2026')
  const h1 = frame(left, 'H1', { dir: 'v', sizeH: 'fill' })
  for (const line of ['Stock in', 'place.', 'People', null]) {
    if (line) text(h1, line, H1)
    else {
      const r = frame(h1, 'line', { dir: 'h', gap: M ? 12 : 24 })
      text(r, 'In', H1)
      text(r, 'flow.', H1, { color: 'red' })
    }
  }
  text(left, 'Velo is a phone app for staff in building-supply stores. Scan a product and it tells you where it goes, what to refill and how to answer the customer.', M ? 'Body/Regular' : 'Body/Large', { w: M ? W - 2 * PAD : 560 })
  const ctas = frame(left, 'CTAs', { dir: 'h', gap: 12, wrap: true })
  btn(ctas, 'See how it works', true)
  btn(ctas, 'Meet the team', false)
  const chips = frame(left, 'Flow chips', { dir: 'h', gap: 8, wrap: true })
  for (const [k, t] of [['A', 'Scan the delivery'], ['B', 'Velo says where it goes'], ['C', 'Ask any product question'], ['D', 'A sale triggers a refill']]) {
    const c = frame(chips, 'Chip ' + k, { dir: 'h', gap: 8, pad: [6, 10, 6, 6], cross: 'center', fill: k === 'B' ? 'yellow' : k === 'D' ? 'red' : 'paper', stroke: 'ink', sw: 2 })
    const em = frame(c, 'k', { dir: 'h', w: 22, h: 22, fill: k === 'D' ? 'white' : k === 'B' ? 'ink' : 'red', main: 'center', cross: 'center' })
    text(em, k, 'Label/Small', { color: k === 'D' ? 'red' : k === 'B' ? 'yellow' : 'white' })
    text(c, t, 'Label/Small', { color: k === 'D' ? 'white' : 'ink' })
  }
  const stage = frame(heroRow, 'Preview', { dir: 'v', w: M ? W - 2 * PAD : 560, ...(M ? {} : { h: 800 }), pad: M ? [24, 0, 24, 0] : 0, fill: 'none', main: 'center', cross: 'center' })
  ellipse(stage, 'Red circle', { abs: true, x: M ? 150 : 320, y: M ? -10 : 0, w: M ? 200 : 260, h: M ? 200 : 260, fill: 'red' })
  rect(stage, 'Blue square', { abs: true, x: M ? 20 : 410, y: M ? 560 : 650, w: M ? 120 : 140, h: M ? 120 : 140, fill: 'blue' })
  const prev = frame(stage, 'Clerk preview card', { dir: 'v', gap: 12, pad: 16, cross: 'center', w: M ? 332 : 440, fill: 'paper', stroke: 'ink', sw: 3, shadow: { x: 10, y: 10, color: '#B92D25' }, rot: -1 })
  const pHead = frame(prev, 'head', { dir: 'h', main: 'spaceBetween', sizeH: 'fill' })
  text(pHead, 'Built for the floor', 'Label/Small')
  text(pHead, '01 / Clerk view', 'Label/Small')
  text(prev, 'A good day. Already organized.', 'Display/H3', { fill: true })
  refillScreen(phoneShell(prev, 'Phone', M ? 300 : 360, M ? 600 : 640), true)
  text(prev, 'Product preview / illustrative data', 'Label/Small', { color: 'text-muted' })

  // marquee
  const mq = frame(root, 'Marquee', { dir: 'h', gap: 40, pad: [18, PAD, 18, PAD], fill: 'blue', sizeH: 'fill', cross: 'center', clip: true, sides: [0, 0, 4, 0], stroke: 'ink', sw: 4 })
  for (const t of ['Check in deliveries', 'Store it in the right place', 'Sell older stock first', 'Keep shelves full', 'Answers in seconds', 'Live store map']) {
    rect(mq, 'sq', { w: 10, h: 10, fill: 'yellow' })
    text(mq, t, 'Label/Default', { color: 'white' })
  }

  // stats
  const stats = frame(root, 'Stats', { dir: M ? 'v' : 'h', sizeH: 'fill', fill: 'paper', sides: [0, 0, 4, 0], stroke: 'ink', sw: 4 })
  for (const [v, l] of [['300+', 'Stores in Denmark, Norway and Sweden'], ['04', 'Areas of the store, one simple app'], ['100%', 'Of company data stays in-house'], ['>75%', "Cheaper than today's scanner guns"]]) {
    const s = frame(stats, 'Stat ' + v, { dir: 'v', gap: 8, pad: M ? 20 : 32, sizeH: 'fill', sides: M ? [0, 0, 2, 0] : [0, 2, 0, 0], stroke: 'ink', sw: 2 })
    rect(s, 'sq', { w: 12, h: 12, fill: 'red' })
    text(s, v, 'Display/Stat', { color: 'red' })
    text(s, l, 'Body/Small', { fill: true })
  }

  // problem
  const pain = section('Problem', 'blue')
  head(pain, '00 / Problem', 'What goes wrong in stores today', 'Staff lose hours searching, shelves sit empty while stock waits in the back room, and products expire before anyone sells them. Independent research puts numbers on it.', true)
  const pGrid = frame(pain, 'Pain grid', { dir: 'v', gap: 24, sizeH: 'fill' })
  const pRow = (n) => cols(pGrid, 'Pain row ' + n, 2)
  const r1 = pRow(1)
  const c1 = card(r1, 'Money lost')
  text(c1, 'Money lost to messy stock', 'Label/Default')
  text(c1, '$1.73T', 'Display/Stat', { color: 'red' })
  text(c1, "lost by retailers worldwide every year because they don't know exactly what they have or where it is.", 'Body/Regular', { fill: true })
  const track1 = frame(c1, 'Track', { dir: 'h', sizeH: 'fill', h: 16, fill: 'track', stroke: 'ink', sw: 2 })
  text(c1, '70% of retailers face this problem every week.', 'Body/Strong', { fill: true })
  text(c1, 'Source: IHL, "The End of Good Enough", Dec 2025', 'Label/Small', { color: 'text-muted', fill: true })
  const c2 = card(r1, 'Waste')
  text(c2, 'Waste eats the profit', 'Label/Default')
  const stack = frame(c2, 'Stacked bar', { dir: 'h', sizeH: 'fill', h: 36, stroke: 'ink', sw: 2 })
  rect(stack, 'Waste 4.5%', { sizeH: 'fixed', w: 40, h: 36, fill: 'red' })
  rect(stack, 'Profit 6.9%', { sizeH: 'fixed', w: 60, h: 36, fill: 'yellow' })
  rect(stack, 'Other 88.6%', { sizeH: 'fill', h: 36, fill: 'ink' })
  const leg = frame(c2, 'Legend', { dir: 'h', gap: 16, wrap: true })
  for (const [k, v, col] of [['Waste', '4.5%', 'red'], ['Profit', '6.9%', 'ink'], ['Other costs', '88.6%', 'ink']]) {
    const i = frame(leg, k, { dir: 'h', gap: 6 })
    text(i, k, 'Label/Small')
    text(i, v, 'Label/Small', { color: col })
  }
  text(c2, 'Out of every 100 kroner in sales, a building-supply store keeps about 6.9 as profit and throws away 4.5 in expired cement, paint and sealant. Waste costs almost as much as the store earns.', 'Body/Regular', { fill: true })
  text(c2, 'Source: Stark Group Annual Report 2024/25, BCG Nordic 2025', 'Label/Small', { color: 'text-muted', fill: true })
  const r2 = pRow(2)
  const c3 = card(r2, 'Walking')
  text(c3, 'Time spent walking', 'Label/Default')
  text(c3, '2.5H lost', 'Display/Stat', { color: 'red' })
  const shift = frame(c3, 'Shift bar', { dir: 'h', sizeH: 'fill', h: 28, stroke: 'ink', sw: 2 })
  rect(shift, 'Lost 2.5h', { sizeH: 'fixed', w: 140, h: 28, fill: 'red' })
  rect(shift, 'Productive 5.5h', { sizeH: 'fill', h: 28, fill: 'track' })
  text(c3, '2.5H of every 8-hour shift, about 32%, goes to walking, searching and paperwork. That adds up to 550H a year for each employee.', 'Body/Regular', { fill: true })
  text(c3, 'Source: our estimate, explained in the proposal', 'Label/Small', { color: 'text-muted', fill: true })
  const c4 = card(r2, 'No answers')
  text(c4, 'Staff without answers', 'Label/Default')
  text(c4, '70%', 'Display/Stat', { color: 'blue' })
  text(c4, 'of store staff struggle to find product or stock information quickly while they are helping a customer.', 'Body/Regular', { fill: true })
  text(c4, 'Source: Zebra Shopper Study, Nov 2025', 'Label/Small', { color: 'text-muted', fill: true })
  const start = frame(pain, 'Starting point', { dir: M ? 'v' : 'h', gap: 12, pad: 16, sizeH: 'fill', fill: 'yellow', stroke: 'ink', sw: 3 })
  text(start, 'Starting point:', 'Label/Default')
  text(start, '300 stores / ~2.5 hours a day lost to walking / works with existing product barcodes', 'Label/Default', { fill: true })

  // product
  const prod = section('Product', 'yellow')
  head(prod, '01 / What Velo does', 'One app. Four jobs. Zero guesswork.', 'Staff scan the barcode that is already on every product. Velo remembers where things are, what is running low and what expires soon, then tells the person what to do next. People always make the final call. Velo only suggests.')
  const pg = frame(prod, 'Job grid', { dir: 'v', gap: 24, sizeH: 'fill' })
  const jobs = [
    ['01', 'Deliveries', 'Check in deliveries, store them right', 'Scan the pallet when the truck arrives. Velo suggests the best spot in the back room and records the expiry date. No paper forms at the loading dock.', 'Scan → Spot → Done'],
    ['02', 'Shelves', 'No more empty shelves', 'When customers buy the last few items, a staff phone gets one clear job: which box, from where, and how many. The oldest stock goes out first, so less is thrown away.', 'Sale → Task → Refilled'],
    ['03', 'Customers', 'Answers in seconds', 'Staff can ask "Is this board approved for a fire wall?" or "Where is the extra stock?" and get an answer in under two seconds, based on the store\'s own product sheets and building rules.', 'Ask → Answer in < 2s'],
    ['04', 'All stores', 'Stores help each other', 'When one store runs out, Velo finds the item in a nearby store and prepares a transfer. The manager approves it with one click.', 'Find → Approve → Move'],
  ]
  for (let i = 0; i < 4; i += 2) {
    const row = cols(pg, 'Job row', 2)
    for (const [n, t, h, p, flow] of jobs.slice(i, i + 2)) {
      const c = card(row, 'Job ' + n)
      const top = frame(c, 'top', { dir: 'h', main: 'spaceBetween', cross: 'center', sizeH: 'fill' })
      text(top, n, 'Display/Number', { color: 'red' })
      tag(top, t)
      text(c, h, 'Display/H3', { fill: true })
      text(c, p, 'Body/Regular', { fill: true })
      text(c, flow, 'Label/Default', { color: 'red' })
    }
  }

  // rollout
  const roll = section('Rollout', 'cream')
  head(roll, '02 / Rollout plan', 'One store first, then all of them.', 'Changing 300 stores at once is risky. We prove that Velo works in a few pilot stores, then grow step by step.')
  const phases = cols(roll, 'Phases', 3)
  for (const [n, when, h, p, bullets] of [
    ['1', 'Months 1–3 · Denmark & Norway', 'Help the staff', 'Barcode check-in, selling older stock first, and automatic refill reminders in a few pilot stores.', ['Waste −60%', 'Shelves 99% full']],
    ['2', 'Months 4–6 · Nearby stores', 'Connect the stores', 'Stores share stock. When one runs out, a nearby store sends it, and the manager approves in one click.', ['1-click approval', 'Shared stock']],
    ['3', 'Months 6–12 · Sweden & delivery', 'Deliver to customers', 'Delivery trucks leave only after every item has been scanned, so customers get the right order the first time.', ['Scanned before it ships', '3 countries']],
  ]) {
    const c = card(phases, 'Phase ' + n)
    const dot = frame(c, 'dot', { dir: 'h', w: 36, h: 36, fill: n === '1' ? 'red' : 'paper', stroke: 'ink', sw: 3, main: 'center', cross: 'center' })
    text(dot, n, 'Label/Button', { color: n === '1' ? 'white' : 'ink' })
    text(c, when, 'Label/Small', { color: 'blue' })
    text(c, h, 'Display/H3', { fill: true })
    text(c, p, 'Body/Regular', { fill: true })
    const bl = frame(c, 'Outcomes', { dir: 'h', gap: 8, wrap: true })
    for (const b of bullets) tag(bl, b)
  }
  const quote = frame(roll, 'Quote', { dir: 'v', gap: 8, pad: M ? 20 : 28, sizeH: 'fill', fill: 'ink' })
  text(quote, 'Help the store staff first. Then grow across the Nordics.', M ? 'Display/H3' : 'Display/H2', { fill: true, color: 'paper' })
  text(quote, '— Our strategy in one sentence', 'Label/Default', { color: 'yellow' })

  // sovereignty / architecture
  const sov = section('Architecture', 'ink')
  head(sov, '03 / Architecture', 'Four building blocks. All in-house.', "Everything runs on Company A's own computers, not on someone else's cloud. Prices, stock levels and supplier details never leave the company, and stores keep working even if the internet goes down.", true)
  const blocks = [
    ['01', 'On the phone', 'Staff app', 'Next.js', 'Turns any store smartphone into a barcode scanner that also tells staff what to do: check in deliveries, put stock away and refill shelves.', "Replaces scanner guns that cost $1,800 or more each. Staff open it in the phone's browser, and basic scanning keeps working without Wi-Fi."],
    ['02', 'The brain', 'Store hub', 'FastAPI', 'The central system that knows what is in stock, where it is and who is doing what. When a till sells something, it sends the right task to the right person straight away.', 'Tasks arrive the moment they are needed, so nobody has to keep checking a screen or a paper list.'],
    ['03', 'The memory', 'Store records', 'PostgreSQL', 'Keeps track of every product, delivery and expiry date, plus sheets for 30,000+ products and the building rules of Denmark, Norway and Sweden.', 'All store information sits in one place, so it is simple to back up and easy for the IT team to check.'],
    ['04', 'The assistant', 'In-house AI', 'Llama / Qwen', "A free, open-source AI that runs on the company's own computer. It answers staff questions from the store's own documents in under two seconds.", 'No data is sent to outside AI services, there is no monthly AI bill, and the company is not locked in to one supplier.'],
  ]
  const bg = frame(sov, 'Block grid', { dir: 'v', gap: 24, sizeH: 'fill' })
  for (let i = 0; i < 4; i += 2) {
    const row = cols(bg, 'Block row', 2)
    for (const [n, k, h, tech, does, why] of blocks.slice(i, i + 2)) {
      const c = card(row, 'Block ' + n, { fill: 'ink-soft', stroke: 'paper' })
      const top = frame(c, 'top', { dir: 'h', main: 'spaceBetween', cross: 'center', sizeH: 'fill' })
      text(top, n + ' ' + k, 'Label/Small', { color: 'yellow' })
      tag(top, tech)
      text(c, h, 'Display/H3', { fill: true, color: 'paper' })
      text(c, 'What it does', 'Label/Small', { color: 'yellow' })
      text(c, does, 'Body/Regular', { fill: true, color: 'text-muted-on-dark' })
      text(c, 'Why it matters', 'Label/Small', { color: 'yellow' })
      text(c, why, 'Body/Regular', { fill: true, color: 'text-muted-on-dark' })
    }
  }
  const proofs = frame(sov, 'Proofs', { dir: M ? 'v' : 'h', sizeH: 'fill', stroke: 'paper', sw: 3, fill: 'ink-soft' })
  for (const [v, l] of [['0', 'data sent to outside services'], ['<2s', 'to answer a question'], ['100%', 'of actions confirmed by a person']]) {
    const p = frame(proofs, 'Proof ' + v, { dir: 'v', gap: 6, pad: 24, sizeH: 'fill' })
    text(p, v, 'Display/Stat', { color: 'yellow' })
    text(p, l, 'Body/Regular', { fill: true, color: 'paper' })
  }
  const code = frame(sov, 'Terminal', { dir: 'v', gap: 0, pad: 20, sizeH: 'fill', fill: 'surface-dark-code', stroke: 'paper', sw: 3 })
  for (const [line, c] of [['$ velo start --everything-in-house', 'yellow'], ["✓ AI assistant ......... on the company's own computer", 'paper'], ['✓ Product knowledge .... 30,000+ products (DK / NO / SE rules)', 'paper'], ['✓ Till connection ...... every sale can trigger a refill', 'paper'], ['# nothing leaves the building', 'text-muted-on-dark']]) {
    text(code, line, 'Code/Regular', { color: c, fill: true })
  }

  // timeline
  const tl = section('Timeline', 'paper')
  head(tl, '04 / Timeline', 'The road to HCMC', 'The competition has three rounds. By the final in Ho Chi Minh City, Velo will be a working product, not just slides.')
  const rounds = cols(tl, 'Rounds', 3)
  for (const [r, d, h, p] of [
    ['R1', 'Due 26 Oct 2026, 22:00', 'Explain the idea', 'Ten slides: the problem we chose, our solution and how we would roll it out across three countries.'],
    ['R2', '02–09 Nov 2026', 'Build it', 'Seven days to build a working first version: barcode scanning, simulated till sales and the question assistant.'],
    ['R3', '16–21 Nov 2026 (HCMC)', 'Show it live', 'Two minutes on stage to show the whole store working: scan, refill, ask a question, share stock.'],
  ]) {
    const c = card(rounds, 'Round ' + r, { fill: r === 'R2' ? 'yellow' : 'paper' })
    text(c, r, 'Display/Stat', { color: 'red' })
    text(c, d, 'Label/Small', { color: 'blue' })
    text(c, h, 'Display/H3', { fill: true })
    text(c, p, 'Body/Regular', { fill: true })
  }

  // team
  const team = section('Team', 'cream')
  head(team, '05 / The team', 'Team BaCayKiem', 'Ba Cây Kiếm means “three swords” in Vietnamese. We are three builders from Ho Chi Minh City, and each of us owns one part of Velo: the app staff use, the system behind it, and the AI assistant.')
  const facts = frame(team, 'Facts', { dir: 'h', gap: 12, wrap: true })
  for (const f of ['3 builders', '1 product', 'HCMC home base', 'ITCC 2026']) tag(facts, f)
  const members = cols(team, 'Members', 3)
  for (const [m, owns, name, role, bio, photo] of [
    ['M.01', 'The app', 'Vi Tuan Khoa', 'Frontend Software Developer', 'Designs and builds the staff app. The screens staff tap every day, the camera barcode scanner and the live store map.', 'khoa.jpg'],
    ['M.02', 'The system + AI', 'Huynh Khanh Tuong', 'Software Engineer & Applied AI', 'Builds the system behind the app. Stock records, instant refill alerts, and connecting the AI to the tools staff actually use.', 'tuong.jpg'],
    ['M.03', 'The AI assistant', 'Thai Trong Dang', 'AI Engineer', "Builds the AI assistant and keeps data safe. The question assistant, the planner that sends older stock out first, and running everything on the company's own computers.", 'dang.jpg'],
  ]) {
    const c = card(members, 'Member ' + m)
    const ph = image(c, name, `${ASSETS}/team/${photo}`, { w: M ? 300 : 340, h: M ? 300 : 340 })
    const top = frame(c, 'top', { dir: 'h', main: 'spaceBetween', cross: 'center', sizeH: 'fill' })
    text(top, m, 'Display/Number', { color: 'red' })
    tag(top, 'Owns: ' + owns)
    text(c, name, 'Display/H3', { fill: true })
    text(c, role, 'Label/Small', { color: 'blue' })
    text(c, bio, 'Body/Regular', { fill: true })
  }

  // faq
  const faq = section('FAQ', 'paper')
  head(faq, '06 / Questions', 'Fair questions, straight answers')
  const list = frame(faq, 'Questions', { dir: 'v', gap: 12, sizeH: 'fill' })
  const qa = [
    ['What is Velo, in one sentence?', 'A phone app that helps staff in building-supply stores check in deliveries, keep shelves full, sell older stock first and answer customer questions, all by scanning the barcodes already on the products.'],
    ['Why start with store staff instead of delivery trucks?', 'Every delivery, transfer and online order depends on knowing exactly what is on the shelf and in the back room. Staff create that information every time they move stock. Get it right inside the store first; otherwise you only automate the mess.'],
    ['Does the AI make decisions on its own?', 'No. Velo suggests and reminds, and a person confirms every action with a scan or a tap. It never changes stock numbers, throws anything away or places an order by itself.'],
    ['Is an AI running inside the company fast enough?', 'Yes. A small open-source AI on one in-house computer answers questions in under two seconds. The everyday work (scans, refill alerts, task lists) does not depend on the AI at all, so stores keep running even if the AI is switched off.'],
    ['What happens to the old scanner guns?', 'They are replaced by ordinary rugged smartphones that scan with the camera. A scanner gun costs $1,500–$2,200 plus about 20% a year in maintenance, so hardware costs drop by more than 75%.'],
    ['How does one system work in three different countries?', 'One system, set up for each country. Denmark starts with paper-free deliveries, Norway with one standard way of organising stores, and Sweden adds home delivery last.'],
  ]
  qa.forEach(([q, a], i) => {
    const item = frame(list, 'FAQ ' + (i + 1), { dir: 'v', gap: 10, pad: 20, sizeH: 'fill', fill: i === 0 ? 'yellow' : 'paper', stroke: 'ink', sw: 3 })
    const row = frame(item, 'Question', { dir: 'h', gap: 12, cross: 'center', sizeH: 'fill' })
    text(row, q, 'Body/Strong', { fill: true })
    text(row, i === 0 ? '−' : '+', 'Display/Number', { color: 'red' })
    if (i === 0) text(item, a, 'Body/Regular', { fill: true })
  })

  // footer
  const foot = frame(root, 'Footer', { dir: 'v', gap: 32, pad: [M ? 40 : 72, PAD, 32, PAD], sizeH: 'fill', fill: 'ink' })
  const fcols = cols(foot, 'Footer columns', 4, { gap: 32 })
  const fbrand = frame(fcols, 'Brand', { dir: 'v', gap: 12, sizeH: 'fill' })
  image(fbrand, 'Velo logo white', `${ASSETS}/LogoName-white.png`, { w: 96, h: 54 })
  text(fbrand, 'Velo by Team BaCayKiem: a simple store assistant for building-supply staff, built in Ho Chi Minh City for the Nordics.', 'Body/Small', { fill: true, color: 'text-muted-on-dark' })
  for (const [h, items] of [
    ['Contact', ['hello@velo.team']],
    ['Competition', ['Netcompany IT Consultant Challenge 2026', 'with Code MeLy']],
    ['Navigate', ['What Velo does', 'The plan', "How it's built", 'Timeline', 'Team', 'FAQ', 'Try the app', 'Brand assets']],
  ]) {
    const col = frame(fcols, h, { dir: 'v', gap: 8, sizeH: 'fill' })
    text(col, h, 'Label/Small', { color: 'yellow' })
    for (const it of items) text(col, it, 'Body/Small', { fill: true, color: 'paper' })
  }
  const base = frame(foot, 'Base', { dir: M ? 'v' : 'h', gap: 8, main: 'spaceBetween', sizeH: 'fill', pad: [20, 0, 0, 0], sides: [2, 0, 0, 0], stroke: 'border-dark-subtle', sw: 2 })
  text(base, '© 2026 Team BaCayKiem', 'Label/Small', { color: 'text-muted-on-dark' })
  text(base, '100% in-house AI — nothing leaves the building', 'Label/Small', { color: 'yellow' })
  text(base, 'Back to top ↑', 'Label/Small', { color: 'paper' })
  return root
}

page('Landing — Desktop')
landing(false)
page('Landing — Mobile')
landing(true)

// ---------------------------------------------------------------- brand sheet
page('Brand')
const brand = frame(null, 'Brand assets', { dir: 'v', gap: 40, pad: 72, fill: 'yellow', w: 1200, sizeV: 'hug' })
text(brand, 'Primary Workshop Identity', 'Display/H2')
const logos = frame(brand, 'Logos', { dir: 'h', gap: 24, wrap: true })
for (const [n, f, bg] of [['Wordmark: ink on yellow', 'LogoName.png', 'yellow'], ['Wordmark: white on ink', 'LogoName-white.png', 'ink'], ['Wordmark: ink on paper', 'LogoName.png', 'paper'], ['Mark', 'Logo.png', 'cream']]) {
  const tile = frame(logos, n, { dir: 'v', gap: 12, pad: 24, fill: bg, stroke: 'ink', sw: 3, cross: 'center', shadow: { x: 4, y: 4, color: '#20201D' } })
  image(tile, n, `${ASSETS}/${f}`, { w: 220, h: f === 'Logo.png' ? 220 : 124 })
  text(tile, n, 'Label/Small', { color: bg === 'ink' ? 'paper' : 'ink' })
}
const pal = frame(brand, 'Palette', { dir: 'h', gap: 16, wrap: true })
for (const [n, c, hex, onDark] of [['yellow', 'Bauhaus Yellow', '#F0C642'], ['red', 'Workshop Red', '#B92D25', true], ['blue', 'Cobalt Blue', '#315C91', true], ['paper', 'Warm Paper', '#F7F0E2'], ['cream', 'Stockroom Cream', '#F1E5CB'], ['ink', 'Dark Ink', '#20201D', true]]) {
  const s = frame(pal, c, { dir: 'v', gap: 4, pad: 16, w: 180, h: 120, fill: n, stroke: 'ink', sw: 3, main: 'max' })
  text(s, c, 'Label/Small', { color: onDark ? 'paper' : 'ink' })
  text(s, hex, 'Label/Small', { color: onDark ? 'paper' : 'ink' })
}
const type = frame(brand, 'Type', { dir: 'v', gap: 12, pad: 24, fill: 'paper', stroke: 'ink', sw: 3, sizeH: 'fill' })
text(type, 'Stock in place.', 'Display/H2')
text(type, 'Archivo Black · display, uppercase, −4.5% tracking', 'Label/Small')
text(type, 'IBM Plex Sans · body copy, 16–18 px, 1.65–1.7 line height', 'Body/Regular')
text(type, 'IBM Plex Mono · labels, buttons, kickers, uppercase', 'Label/Default')

// ---------------------------------------------------------------- finish
linkStyles()
const all = [...setupSteps(FONTS), ...styleSteps(), ...steps]
const out = resolve(here, 'velo.figcraft')
const scriptPath = resolve(here, '.build.json')
mkdirSync(here, { recursive: true })
writeFileSync(scriptPath, JSON.stringify(all))
const result = execFileSync(CLI, ['run', scriptPath, '--out', out], { encoding: 'utf8', maxBuffer: 1 << 28 })
const failed = result.split('\n').filter((l) => l.includes('"ok":false'))
if (failed.length) {
  console.error(failed.slice(0, 5).join('\n'))
  process.exit(1)
}
console.log(`built ${out} (${all.length} steps)`)

// Second pass: auto layout hugs each card to its own text, so give every desktop row ("Eq: …") the height of
// its tallest card and let the cards fill it (CSS grid stretch).
const runSteps = (list, extra = []) => {
  const p = resolve(here, '.pass.json')
  writeFileSync(p, JSON.stringify(list))
  return execFileSync(CLI, ['run', p, '--in', out, ...extra], { encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\n')
    .filter((l) => l.startsWith('{'))
    .map((l) => JSON.parse(l))
}
const DESKTOP_PAGE = 2 // 'Landing — Desktop' is the third page
const findSteps = [DESKTOP_PAGE].flatMap((i) => [
  { command: 'page.select', params: { index: i } },
  { command: 'node.find', params: { type: 'FRAME', name: 'Eq: ', limit: 200 } },
])
const rows = runSteps(findSteps).flatMap((r) => (r.command === 'node.find' ? r.result.ids : []))
const heightOf = runSteps([
  { command: 'page.select', params: { index: DESKTOP_PAGE } },
  ...rows.map((id) => ({ command: 'node.get', params: { id, fields: ['height'] } })),
]).filter((r) => r.command === 'node.get')
const fixes = [{ command: 'page.select', params: { index: DESKTOP_PAGE } }]
heightOf.forEach((r, i) => {
  const kids = r.result.children ?? []
  if (kids.length < 2) return
  const max = Math.ceil(Math.max(...kids.map((k) => k.height)))
  fixes.push({ command: 'node.set', params: { ids: [rows[i]], sizingV: 'fixed', height: max } })
  fixes.push({ command: 'node.set', params: { ids: kids.map((k) => k.id), sizingV: 'fill' } })
})
runSteps(fixes, ['--out', out])
console.log(`equalized ${rows.length} rows`)
const renders = resolve(here, 'renders')
mkdirSync(renders, { recursive: true })
for (const p of ['Design system', 'App screens', 'Landing — Desktop', 'Landing — Mobile', 'Brand']) {
  const file = resolve(renders, p.replace(/[^\w]+/g, '-').toLowerCase() + '.png')
  try {
    execFileSync(CLI, ['render', out, '-o', file, '--page', p], { encoding: 'utf8' })
    console.log('rendered', file)
  } catch (e) {
    console.error('render failed', p, String(e.stderr || e.message).slice(0, 300))
  }
}
