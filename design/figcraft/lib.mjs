// Tiny DSL that turns frame/text calls into FigCraft `node.create` steps for `figcraft-cli run`.
// Colours are token names from the VELO variable collection (bound as variables) or '#hex' literals.
export const steps = []
let counter = 0

export const ref = (as) => ({ $ref: as })
export const push = (command, params, as) => {
  const step = { command, params }
  if (as) step.as = as
  steps.push(step)
  return as
}
const uid = () => 'n' + ++counter

const paint = (c) => (c === 'none' || c === null ? 'none' : c.startsWith('#') ? c : { $var: 'VELO/' + c })

export const TOKENS = {
  ink: '#20201D',
  'ink-soft': '#282722',
  paper: '#F7F0E2',
  cream: '#F1E5CB',
  yellow: '#F0C642',
  red: '#B92D25',
  blue: '#315C91',
  white: '#FFFFFF',
  'text-muted': '#555247',
  'text-on-dark': '#F7F0E2',
  'text-muted-on-dark': '#DED3BF',
  'border-dark-subtle': '#65645F',
  'surface-dark-code': '#161614',
  track: '#D8CCB4',
}

const ARCHIVO = { fontFamily: 'Archivo Black', fontStyle: 'Regular' }
const SANS = (fontStyle) => ({ fontFamily: 'IBM Plex Sans', fontStyle })
const MONO = (fontStyle) => ({ fontFamily: 'IBM Plex Mono', fontStyle })

// name -> text style. Mirrors public/tokens.css type roles and design/design.md.
export const STYLES = {
  'Display/H1': { ...ARCHIVO, fontSize: 104, lineHeight: '92%', letterSpacing: '-4.5%', textCase: 'upper' },
  'Display/H1 mobile': { ...ARCHIVO, fontSize: 56, lineHeight: '95%', letterSpacing: '-4%', textCase: 'upper' },
  'Display/H2': { ...ARCHIVO, fontSize: 48, lineHeight: '110%', letterSpacing: '-3%', textCase: 'upper' },
  'Display/H2 mobile': { ...ARCHIVO, fontSize: 32, lineHeight: '110%', letterSpacing: '-3%', textCase: 'upper' },
  'Display/H3': { ...ARCHIVO, fontSize: 22, lineHeight: '120%', letterSpacing: '-2%', textCase: 'upper' },
  'Display/Stat': { ...ARCHIVO, fontSize: 64, lineHeight: '100%', letterSpacing: '-4%' },
  'Display/Number': { ...ARCHIVO, fontSize: 28, lineHeight: '100%', letterSpacing: '-2%' },
  'Display/Brand': { ...ARCHIVO, fontSize: 18, lineHeight: '100%', letterSpacing: '-2%', textCase: 'upper' },
  'Body/Large': { ...SANS('Regular'), fontSize: 18, lineHeight: '170%' },
  'Body/Regular': { ...SANS('Regular'), fontSize: 16, lineHeight: '165%' },
  'Body/Strong': { ...SANS('SemiBold'), fontSize: 16, lineHeight: '165%' },
  'Body/Small': { ...SANS('Regular'), fontSize: 14, lineHeight: '160%' },
  'Label/Default': { ...MONO('SemiBold'), fontSize: 12, lineHeight: '140%', letterSpacing: '4%', textCase: 'upper' },
  'Label/Small': { ...MONO('SemiBold'), fontSize: 11, lineHeight: '140%', letterSpacing: '6%', textCase: 'upper' },
  'Label/Button': { ...MONO('Bold'), fontSize: 13, lineHeight: '100%', letterSpacing: '4%', textCase: 'upper' },
  'Code/Regular': { ...MONO('Regular'), fontSize: 13, lineHeight: '170%' },
}
const styleUsers = {}

export function frame(parent, name, o = {}) {
  const as = uid()
  const props = {
    fill: paint(o.fill ?? 'none'),
    ...(o.dir ? { layout: o.dir === 'h' ? 'horizontal' : 'vertical' } : {}),
    ...(o.gap != null ? { gap: o.gap } : {}),
    ...(o.pad != null ? { padding: o.pad } : {}),
    ...(o.main ? { mainAlign: o.main } : {}),
    ...(o.cross ? { crossAlign: o.cross } : {}),
    ...(o.wrap ? { wrap: true, crossGap: o.crossGap ?? o.gap ?? 0 } : {}),
    ...(o.sizeH || o.wrap || (o.dir && o.w == null) ? { sizingH: o.sizeH ?? (o.wrap ? 'fill' : 'hug') } : {}),
    ...(o.sizeV || (o.dir && o.h == null) ? { sizingV: o.sizeV ?? 'hug' } : {}),
    ...(o.stroke ? { stroke: paint(o.stroke), strokeWeight: o.sw ?? 3, strokeAlign: 'inside' } : {}),
    ...(o.sides ? { strokeSides: o.sides } : {}),
    ...(o.r != null ? { cornerRadius: o.r } : {}),
    ...(o.clip ? { clip: true } : {}),
    ...(o.shadow
      ? { effects: [{ type: 'dropShadow', color: o.shadow.color, offset: [o.shadow.x, o.shadow.y], radius: 0 }] }
      : {}),
    ...(o.abs ? { absolute: true } : {}),
    ...(o.rot ? { rotation: o.rot } : {}),
    ...(o.opacity != null ? { opacity: o.opacity } : {}),
  }
  push(
    'node.create',
    {
      type: o.type ?? 'frame',
      parent: parent ? ref(parent) : undefined,
      name,
      x: o.x,
      y: o.y,
      width: o.w,
      height: o.h,
      select: false,
      props,
    },
    as,
  )
  return as
}

export const rect = (parent, name, o) => frame(parent, name, { ...o, type: 'rectangle' })
export const ellipse = (parent, name, o) => frame(parent, name, { ...o, type: 'ellipse' })

export function text(parent, content, style, o = {}) {
  const as = uid()
  const s = STYLES[style]
  if (!s) throw new Error('unknown text style ' + style)
  const props = {
    ...s,
    fill: paint(o.color ?? 'ink'),
    ...(o.align ? { textAlign: o.align } : {}),
    ...(o.fill ? { sizingH: 'fill', textAutoResize: 'height' } : {}),
    ...(o.w ? { textAutoResize: 'height' } : {}),
    ...(o.abs ? { absolute: true } : {}),
  }
  push(
    'node.create',
    { type: 'text', parent: ref(parent), name: o.name ?? content.slice(0, 32), text: content, x: o.x, y: o.y, width: o.w, select: false, props },
    as,
  )
  ;(styleUsers[style] ??= []).push(as)
  return as
}

export function image(parent, name, path, o = {}) {
  const as = uid()
  push('image.place', { path, name, parent: ref(parent), width: o.w, height: o.h, x: o.x, y: o.y }, as)
  return as
}

export function instance(parent, component, o = {}) {
  const as = uid()
  push('instance.create', { component: ref(component), parent: ref(parent) }, as)
  if (o.props) push('instance.setProperties', { ids: [ref(as)], properties: o.props })
  if (o.set && Object.keys(o.set).length) push('node.set', { ids: [ref(as)], ...o.set })
  return as
}

// Linked text styles and variables, emitted before any layers.
export function setupSteps(fontDir) {
  const out = []
  for (const f of ['ArchivoBlack-Regular.ttf', 'IBMPlexSans-Variable.ttf', 'IBMPlexMono-Regular.ttf', 'IBMPlexMono-Medium.ttf', 'IBMPlexMono-SemiBold.ttf', 'IBMPlexMono-Bold.ttf']) {
    out.push({ command: 'text.loadFont', params: { path: `${fontDir}/${f}` } })
  }
  out.push({ command: 'variable.createCollection', params: { name: 'VELO' } })
  for (const [name, value] of Object.entries(TOKENS)) {
    out.push({ command: 'variable.create', params: { collection: 'VELO', name, type: 'color', value } })
  }
  return out
}

export function styleSteps() {
  const out = []
  for (const [name, value] of Object.entries(STYLES)) {
    const { textCase, ...rest } = value
    out.push({ command: 'style.create', params: { type: 'text', name, value: { ...rest, ...(textCase ? { case: textCase } : {}) } } })
  }
  return out
}

export function linkStyles() {
  for (const [style, ids] of Object.entries(styleUsers)) {
    for (let i = 0; i < ids.length; i += 200) {
      push('style.apply', { ids: ids.slice(i, i + 200).map(ref), style })
    }
  }
}
