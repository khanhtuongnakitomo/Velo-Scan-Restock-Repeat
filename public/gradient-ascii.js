/* React Bits GradientASCII — WebGL2 ASCII field renderer shared by .velo-loader & <GradientASCII />. */
(function () {
  var MAX_COLORS = 8
  var MAX_CLICKS = 4
  var MAX_TRAIL = 24
  var CLICK_LIFE = 1.2
  var TRAIL_LIFE = 0.7
  var TRAIL_STEP = 0.015
  var DEFAULT_INTRO_SECONDS = 2.4
  var ATLAS_CELL_W = 60
  var ATLAS_CELL_H = 100
  var ATLAS_COLUMNS = 16
  var FONT_SCALE = 0.78
  var DEFAULT_CHARACTERS = ' =+xX0S8#@'
  var DEFAULT_FONT = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  var SHAPES = { horizon: 0, pinch: 1, rise: 2, eclipse: 3 }
  var CLICK_EFFECTS = { none: 0, wave: 1, burst: 2 }

  var VERTEX = '#version 300 es\n' +
    'out vec2 vUv;\n' +
    'void main() {\n' +
    '  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n' +
    '  vUv = p;\n' +
    '  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\n' +
    '}'

  var COMMON = '\nfloat hash12(vec2 p) {\n' +
    '  vec3 q = fract(vec3(p.xyx) * 0.1031);\n' +
    '  q += dot(q, q.yzx + 33.33);\n' +
    '  return fract((q.x + q.y) * q.z);\n' +
    '}\n'

  var FIELD = '#version 300 es\n' +
    'precision highp float;\n' +
    'precision highp int;\n' +
    'uniform float uAspect;\n' +
    'uniform float uTime;\n' +
    'uniform int uShape;\n' +
    'uniform vec3 uRamp[8];\n' +
    'uniform int uCount;\n' +
    'uniform float uScale;\n' +
    'uniform float uSoftness;\n' +
    'uniform float uFlow;\n' +
    'uniform vec2 uSeed;\n' +
    'uniform vec4 uTrail[24];\n' +
    'uniform float uRadius;\n' +
    'uniform vec4 uClicks[4];\n' +
    'uniform int uClickEffect;\n' +
    'uniform float uIntro;\n' +
    'uniform float uFrame;\n' +
    'in vec2 vUv;\n' +
    'layout(location = 0) out vec4 outColor;\n' +
    'layout(location = 1) out vec4 outAux;\n' +
    COMMON +
    'vec2 hash22(vec2 p) {\n' +
    '  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));\n' +
    '  q += dot(q, q.yzx + 33.33);\n' +
    '  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;\n' +
    '}\n' +
    'float noise(vec2 p) {\n' +
    '  vec2 i = floor(p);\n' +
    '  vec2 f = fract(p);\n' +
    '  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\n' +
    '  float a = dot(hash22(i), f);\n' +
    '  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));\n' +
    '  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));\n' +
    '  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));\n' +
    '  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n' +
    '}\n' +
    'vec3 labToRgb(vec3 lab) {\n' +
    '  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;\n' +
    '  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;\n' +
    '  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;\n' +
    '  l = l * l * l;\n' +
    '  m = m * m * m;\n' +
    '  s = s * s * s;\n' +
    '  return vec3(\n' +
    '    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\n' +
    '    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\n' +
    '    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s\n' +
    '  );\n' +
    '}\n' +
    'vec3 encode(vec3 c) {\n' +
    '  c = clamp(c, 0.0, 1.0);\n' +
    '  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\n' +
    '}\n' +
    'vec3 horizon(vec2 p, float time, out float order) {\n' +
    '  float span = 0.5 * max(uAspect, 1.0);\n' +
    '  float x = p.x / span;\n' +
    '  float arch = -0.17 - 0.2 * x * x + 0.02 * sin(time * 0.6);\n' +
    '  float soft = mix(0.05, 0.22, uSoftness);\n' +
    '  float edge = p.y - arch;\n' +
    '  float rim = 0.38 * smoothstep(-soft, 0.42, edge);\n' +
    '  vec2 sun = vec2(0.08 * sin(time * 0.31) * span, 0.58);\n' +
    '  float spread = length((p - sun) / vec2(0.95 * span, 0.75));\n' +
    '  float sky = mix(0.55, 1.0, smoothstep(0.2, 0.95, spread));\n' +
    '  order = clamp(edge * 1.3, 0.0, 1.0);\n' +
    '  return vec3(rim, sky, smoothstep(0.18, 0.62, edge));\n' +
    '}\n' +
    'vec3 pinch(vec2 p, float time, out float order) {\n' +
    '  float span = 0.5 * max(uAspect, 0.75);\n' +
    '  float x = p.x / span;\n' +
    '  float sway = 0.02 * sin(x * 1.7 + time * 0.55);\n' +
    '  float breathe = 1.0 + 0.06 * sin(time * 0.8);\n' +
    '  float width = (0.13 + 0.22 * x * x) * breathe * mix(0.85, 1.2, uSoftness);\n' +
    '  float y = abs(p.y - sway) / width;\n' +
    '  float t = exp(-pow(y, 2.2)) * (0.42 + 0.58 * exp(-x * x * 1.8));\n' +
    '  order = clamp(abs(p.y - sway) * 2.4 + abs(x) * 0.3, 0.0, 1.0);\n' +
    '  return vec3(t, t, 0.0);\n' +
    '}\n' +
    'vec3 rise(vec2 p, float time, out float order) {\n' +
    '  float wide = max(uAspect, 0.9);\n' +
    '  vec2 center = vec2(0.05 * sin(time * 0.45) * wide, -0.7);\n' +
    '  vec2 radius = vec2(0.82 * wide, 0.64 * (1.0 + 0.04 * sin(time * 0.8)));\n' +
    '  float d = length((p - center) / radius);\n' +
    '  float soft = mix(0.6, 1.15, uSoftness);\n' +
    '  float t = clamp(pow(clamp(1.0 - d, 0.0, 1.0), soft) * 1.35, 0.0, 1.0);\n' +
    '  order = clamp((d - 0.2) * 1.3, 0.0, 1.0);\n' +
    '  return vec3(t, t, 0.0);\n' +
    '}\n' +
    'vec3 eclipse(vec2 p, float time, out float order) {\n' +
    '  float fit = min(1.0, uAspect * 1.25);\n' +
    '  float r = 0.23 * fit * (1.0 + 0.015 * sin(time * 0.9));\n' +
    '  float angle = atan(p.y, p.x);\n' +
    '  float rays = noise(vec2(cos(angle), sin(angle)) * 2.2 + time * 0.08) * 0.8 + 0.6;\n' +
    '  float d = length(p) - r;\n' +
    '  float reach = mix(0.07, 0.15, uSoftness) * rays * fit;\n' +
    '  float t = smoothstep(-0.006, 0.006 + 0.02 * uSoftness, d) * exp(-max(d, 0.0) / reach);\n' +
    '  order = clamp(d * 2.0, 0.0, 1.0);\n' +
    '  return vec3(t, t, 0.0);\n' +
    '}\n' +
    'vec4 tone(float t) {\n' +
    '  float x = smoothstep(0.3, 1.0, t) * float(uCount - 1);\n' +
    '  int index = int(floor(x));\n' +
    '  return vec4(mix(uRamp[index], uRamp[min(index + 1, uCount - 1)], fract(x)), smoothstep(0.0, 0.38, t));\n' +
    '}\n' +
    'void main() {\n' +
    '  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);\n' +
    '  float time = uTime;\n' +
    '  vec2 q = p / uScale;\n' +
    '  vec2 warp = vec2(\n' +
    '    noise(q * 1.6 + uSeed + vec2(0.0, time * 0.3)),\n' +
    '    noise(q * 1.6 + uSeed.yx + vec2(4.3, -time * 0.24))\n' +
    '  ) - 0.5;\n' +
    '  q += warp * uFlow * (uShape == 3 ? 0.04 : 0.18);\n' +
    '  float order = 0.0;\n' +
    '  vec3 shape;\n' +
    '  if (uShape == 0) shape = horizon(q, time, order);\n' +
    '  else if (uShape == 1) shape = pinch(q, time, order);\n' +
    '  else if (uShape == 2) shape = rise(q, time, order);\n' +
    '  else shape = eclipse(q, time, order);\n' +
    '  float reveal = clamp((uIntro * 1.45 - order) / 0.45, 0.0, 1.0);\n' +
    '  reveal = reveal * reveal * (3.0 - 2.0 * reveal);\n' +
    '  float scramble = 0.0;\n' +
    '  for (int i = 0; i < 24; i++) {\n' +
    '    vec4 point = uTrail[i];\n' +
    '    if (point.z <= 0.0) continue;\n' +
    '    vec2 d = p - point.xy;\n' +
    '    scramble = max(scramble, point.z * exp(-dot(d, d) / (uRadius * uRadius)));\n' +
    '  }\n' +
    '  for (int i = 0; i < 4; i++) {\n' +
    '    vec4 c = uClicks[i];\n' +
    '    if (c.w <= 0.0) continue;\n' +
    '    float d = length(p - c.xy);\n' +
    '    if (uClickEffect == 1) {\n' +
    '      scramble = max(scramble, exp(-pow((d - c.z * 0.75) / 0.06, 2.0)) * c.w);\n' +
    '    } else if (uClickEffect == 2) {\n' +
    '      float size = 0.08 + 0.22 * (1.0 - exp(-c.z * 5.0));\n' +
    '      scramble = max(scramble, (1.0 - smoothstep(size * 0.6, size, d)) * c.w);\n' +
    '    }\n' +
    '  }\n' +
    '  vec2 t = clamp(shape.xy * mix(0.7, 1.0, reveal), 0.0, 1.0);\n' +
    '  vec4 mixed = mix(tone(t.x), tone(t.y), shape.z);\n' +
    '  vec3 color = encode(labToRgb(mixed.rgb));\n' +
    '  float alpha = mixed.a * reveal;\n' +
    '  float dither = (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) / 255.0;\n' +
    '  outColor = clamp(vec4(color * alpha + dither, alpha + dither), 0.0, 1.0);\n' +
    '  outAux = vec4(reveal, scramble, 0.0, 1.0);\n' +
    '}'

  var GLYPHS = '\nuniform sampler2D uField;\n' +
    'uniform sampler2D uAux;\n' +
    'uniform sampler2D uAtlas;\n' +
    'uniform vec2 uResolution;\n' +
    'uniform vec2 uCell;\n' +
    'uniform vec2 uOffset;\n' +
    'uniform vec2 uAtlasGrid;\n' +
    'uniform float uCount;\n' +
    'uniform float uDensity;\n' +
    'uniform float uOpacity;\n' +
    'uniform float uFlicker;\n' +
    'uniform float uDepth;\n' +
    'uniform float uGlyphTime;\n' +
    'uniform float uSeedValue;\n' +
    'uniform float uLight;\n' +
    COMMON +
    'float sampleGlyph(float index, vec2 local, vec2 coord, float soft) {\n' +
    '  float column = mod(index, uAtlasGrid.x);\n' +
    '  float row = floor(index / uAtlasGrid.x);\n' +
    '  vec2 atlasUv = vec2((column + local.x) / uAtlasGrid.x, (row + 1.0 - local.y) / uAtlasGrid.y);\n' +
    '  vec2 continuous = coord / uAtlasGrid;\n' +
    '  float scale = exp2(soft);\n' +
    '  return textureGrad(uAtlas, atlasUv, dFdx(continuous) * scale, dFdy(continuous) * scale).a;\n' +
    '}\n' +
    'vec4 glyphAt(vec2 px) {\n' +
    '  vec2 coord = (px - uOffset) / uCell;\n' +
    '  vec2 cell = floor(coord);\n' +
    '  vec2 local = coord - cell;\n' +
    '  vec2 uv = clamp(((cell + 0.5) * uCell + uOffset) / uResolution, vec2(0.0), vec2(1.0));\n' +
    '  vec4 field = texture(uField, uv);\n' +
    '  vec4 aux = texture(uAux, uv);\n' +
    '  vec3 visible = uLight > 0.5 ? field.rgb + (1.0 - field.a) : field.rgb;\n' +
    '  float luma = dot(visible, vec3(0.2126, 0.7152, 0.0722));\n' +
    '  float value = uLight > 0.5 ? clamp((1.0 - luma) * 1.5, 0.0, 1.0) : luma;\n' +
    '  float pick = hash12(cell + uSeedValue * 7.31);\n' +
    '  float level = hash12(cell * 1.73 + 4.1 + uSeedValue);\n' +
    '  float tick = floor(uGlyphTime * 9.0 + level * 9.0);\n' +
    '  float wobble = (hash12(cell * 2.31 + tick * 17.7) - 0.5) * uFlicker * 0.4 + (level - 0.5) * 0.1;\n' +
    '  float tone = clamp(pow(value, 0.75) + wobble, 0.0, 1.0);\n' +
    '  float index = floor(tone * (uCount - 1.0) + 0.5);\n' +
    '  float decode = max(aux.g, 1.0 - aux.r);\n' +
    '  if (decode > 0.02) {\n' +
    '    float frame = floor(uGlyphTime * 20.0);\n' +
    '    if (hash12(cell * 3.7 + frame * 5.3) < decode * 1.25) index = 1.0 + floor(hash12(cell + frame * 1.37) * (uCount - 1.0));\n' +
    '  }\n' +
    '  float present = step(pick, uDensity * mix(1.0, 0.3 + tone * 1.1, 0.55));\n' +
    '  float cutoff = smoothstep(0.03, 0.1, value);\n' +
    '  float focus = step(hash12(cell * 0.71 + 9.2 + uSeedValue), uDepth);\n' +
    '  float coverage = sampleGlyph(index, local, coord, focus * 1.2);\n' +
    '  float alpha = uOpacity * present * cutoff * coverage * mix(1.0, 0.35 + 0.65 * level, 0.55) * (1.0 - focus * 0.5);\n' +
    '  if (uLight < 0.5) {\n' +
    '    vec3 light = field.rgb * 0.55 + vec3(0.03) * field.a;\n' +
    '    return vec4(light * alpha, 0.6 * field.a * alpha);\n' +
    '  }\n' +
    '  vec3 ink = visible * 0.8;\n' +
    '  return vec4(ink * alpha, alpha);\n' +
    '}\n'

  var HALO = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform float uDownscale;\n' +
    'in vec2 vUv;\n' +
    'out vec4 outColor;\n' +
    GLYPHS +
    'void main() {\n' +
    '  outColor = glyphAt(gl_FragCoord.xy * uDownscale);\n' +
    '}'

  var BLUR = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform sampler2D uSource;\n' +
    'uniform vec2 uStep;\n' +
    'in vec2 vUv;\n' +
    'out vec4 outColor;\n' +
    'void main() {\n' +
    '  vec4 sum = texture(uSource, vUv) * 0.2270270270;\n' +
    '  sum += texture(uSource, vUv + uStep * 1.3846153846) * 0.3162162162;\n' +
    '  sum += texture(uSource, vUv - uStep * 1.3846153846) * 0.3162162162;\n' +
    '  sum += texture(uSource, vUv + uStep * 3.2307692308) * 0.0702702703;\n' +
    '  sum += texture(uSource, vUv - uStep * 3.2307692308) * 0.0702702703;\n' +
    '  outColor = sum;\n' +
    '}'

  var COMPOSITE = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform sampler2D uHalo;\n' +
    'uniform float uGlow;\n' +
    'uniform float uGradient;\n' +
    'uniform float uGrain;\n' +
    'uniform float uFrame;\n' +
    'in vec2 vUv;\n' +
    'out vec4 outColor;\n' +
    GLYPHS +
    'void main() {\n' +
    '  vec4 base = texture(uField, vUv) * uGradient;\n' +
    '  vec4 glyph = glyphAt(gl_FragCoord.xy);\n' +
    '  vec4 halo = texture(uHalo, vUv) * uGlow;\n' +
    '  vec4 color;\n' +
    '  if (uLight < 0.5) {\n' +
    '    color = base + glyph + halo;\n' +
    '  } else {\n' +
    '    color = glyph + base * (1.0 - glyph.a);\n' +
    '    color += halo * 0.6 * (1.0 - color.a);\n' +
    '  }\n' +
    '  float grain = (hash12(gl_FragCoord.xy + uFrame * vec2(17.0, 59.0)) + hash12(gl_FragCoord.xy * 1.31 + uFrame * 7.0) - 1.0) * uGrain;\n' +
    '  float body = clamp(color.a, 0.0, 1.0);\n' +
    '  color.rgb += grain * (0.25 + body) * 0.5;\n' +
    '  color.a = clamp(color.a, 0.0, 1.0);\n' +
    '  color.rgb = clamp(color.rgb, 0.0, color.a);\n' +
    '  outColor = color;\n' +
    '}'

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function toLinear(value) {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  function toLab(rgb) {
    var lr = toLinear(rgb[0])
    var lg = toLinear(rgb[1])
    var lb = toLinear(rgb[2])
    var l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
    var m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
    var s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ]
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }

  function link(gl, fragmentSource) {
    var vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    var fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
    var program = gl.createProgram()
    if (!vertex || !fragment || !program) return null
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    return { program: program, uniforms: {} }
  }

  function resolve(gl, item) {
    if (!gl.getProgramParameter(item.program, gl.LINK_STATUS)) return false
    var count = gl.getProgramParameter(item.program, gl.ACTIVE_UNIFORMS)
    for (var i = 0; i < count; i++) {
      var info = gl.getActiveUniform(item.program, i)
      if (!info) continue
      var name = info.name.replace(/\[0\]$/, '')
      item.uniforms[name] = gl.getUniformLocation(item.program, name)
    }
    return true
  }

  function createTarget(gl, count) {
    var textures = []
    for (var i = 0; i < count; i++) {
      var texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textures.push(texture)
    }
    return { textures: textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 }
  }

  function sizeTarget(gl, target, width, height) {
    if (target.width === width && target.height === height) return
    target.width = width
    target.height = height
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
    for (var i = 0; i < target.textures.length; i++) {
      gl.bindTexture(gl.TEXTURE_2D, target.textures[i])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, target.textures[i], 0)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  function buildAtlas(gl, characters, fontFamily) {
    var seen = Object.create(null)
    var list = []
    var chars = Array.from(characters || DEFAULT_CHARACTERS)
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i]
      if (ch === '\n' || ch === '\r' || seen[ch]) continue
      seen[ch] = true
      list.push(ch)
    }
    if (!list.length) list.push(' ')
    var font = '300 ' + Math.round(ATLAS_CELL_H * FONT_SCALE) + 'px ' + fontFamily
    var columns = Math.min(ATLAS_COLUMNS, list.length)
    var rows = Math.ceil(list.length / columns)
    var canvas = document.createElement('canvas')
    canvas.width = ATLAS_CELL_W * columns
    canvas.height = ATLAS_CELL_H * rows
    var context = canvas.getContext('2d')
    if (context) {
      context.font = font
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = '#ffffff'
      for (var j = 0; j < list.length; j++) {
        var column = j % columns
        var row = Math.floor(j / columns)
        context.fillText(list[j], column * ATLAS_CELL_W + ATLAS_CELL_W / 2, row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3)
      }
    }
    var texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return { texture: texture, count: list.length, grid: [columns, rows] }
  }

  function resolveCssColor(expr) {
    if (!expr || (expr.indexOf('var(') < 0 && expr.indexOf('color-mix(') < 0)) return expr
    var host = document.body || document.documentElement
    if (!host) return expr
    var span = document.createElement('span')
    span.style.color = expr
    span.style.display = 'none'
    host.appendChild(span)
    var computed = getComputedStyle(span).color
    host.removeChild(span)
    return computed || expr
  }

  function defaultVeloColors(lightMode) {
    if (lightMode) {
      return [
        resolveCssColor('var(--tint)'),
        resolveCssColor('color-mix(in srgb, var(--violet) 68%, var(--tint))'),
        resolveCssColor('var(--violet)'),
        resolveCssColor('color-mix(in srgb, var(--violet) 65%, var(--mint))')
      ]
    }
    return [
      resolveCssColor('color-mix(in srgb, var(--violet) 46%, var(--ink))'),
      resolveCssColor('var(--violet)'),
      resolveCssColor('var(--tint)'),
      resolveCssColor('color-mix(in srgb, var(--mint) 62%, var(--tint))')
    ]
  }

  function normalizeSettings(opts) {
    var o = opts || {}
    var isLight = !!o.lightMode
    var rawColors = Array.isArray(o.colors) && o.colors.length ? o.colors.slice(0, MAX_COLORS) : defaultVeloColors(isLight)
    var colors = rawColors.length > 1 ? rawColors : [rawColors[0], rawColors[0]]
    return {
      colors: colors,
      shape: SHAPES[o.shape] != null ? SHAPES[o.shape] : 0,
      characters: o.characters || DEFAULT_CHARACTERS,
      cellSize: clamp(o.cellSize != null ? o.cellSize : 18, 6, 64),
      density: clamp(o.density != null ? o.density : 0.8, 0, 1),
      glyphOpacity: clamp(o.glyphOpacity != null ? o.glyphOpacity : 0.85, 0, 1),
      glow: clamp(o.glow != null ? o.glow : 0.2, 0, 2),
      depthOfField: clamp(o.depthOfField != null ? o.depthOfField : 0, 0, 1),
      flicker: clamp(o.flicker != null ? o.flicker : 0.2, 0, 1),
      softness: clamp(o.softness != null ? o.softness : 0.5, 0, 1),
      scale: clamp(o.scale != null ? o.scale : 1, 0.4, 2.5),
      flow: clamp(o.flow != null ? o.flow : 0.5, 0, 2),
      speed: Math.max(0, o.speed != null ? o.speed : 1),
      gradientOpacity: clamp(o.gradientOpacity != null ? o.gradientOpacity : 0.9, 0, 1),
      grain: clamp(o.grain != null ? o.grain : 0.08, 0, 0.4),
      variation: Math.max(0, o.variation != null ? o.variation : 0),
      mouseInteraction: o.mouseInteraction !== false,
      scrambleRadius: clamp(o.scrambleRadius != null ? o.scrambleRadius : 0.1, 0.02, 0.4),
      clickEffect: CLICK_EFFECTS[o.clickEffect] != null ? CLICK_EFFECTS[o.clickEffect] : 1,
      intro: o.intro !== false,
      introDuration: Math.max(0.1, o.introDuration != null ? o.introDuration : DEFAULT_INTRO_SECONDS),
      lightMode: !!o.lightMode,
      fontFamily: o.fontFamily || DEFAULT_FONT,
      dpr: o.dpr
    }
  }

  function mount(container, initialOptions) {
    if (!container) return null
    var canvas = container.querySelector('.gradient-ascii-canvas')
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.className = 'gradient-ascii-canvas'
      canvas.setAttribute('aria-hidden', 'true')
      container.appendChild(canvas)
    }

    var gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    })
    if (!gl) return null

    var parallel = gl.getExtension('KHR_parallel_shader_compile')
    var field = link(gl, FIELD)
    var halo = link(gl, HALO)
    var blur = link(gl, BLUR)
    var composite = link(gl, COMPOSITE)
    if (!field || !halo || !blur || !composite) return null
    var programs = [field, halo, blur, composite]
    if (!parallel && !programs.every(function (item) { return resolve(gl, item) })) {
      programs.forEach(function (item) { gl.deleteProgram(item.program) })
      return null
    }

    var vao = gl.createVertexArray()
    var fieldTarget = createTarget(gl, 2)
    var haloA = createTarget(gl, 1)
    var haloB = createTarget(gl, 1)

    var probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    var colorCache = new Map()
    function parse(value) {
      var key = resolveCssColor(String(value))
      var cached = colorCache.get(key)
      if (cached) return cached
      var rgb = [0, 0, 0]
      if (probe) {
        probe.clearRect(0, 0, 1, 1)
        probe.fillStyle = '#000000'
        probe.fillStyle = key
        probe.fillRect(0, 0, 1, 1)
        var data = probe.getImageData(0, 0, 1, 1).data
        rgb = [data[0] / 255, data[1] / 255, data[2] / 255]
      }
      colorCache.set(key, rgb)
      return rgb
    }

    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    var settings = normalizeSettings(initialOptions)
    var view = { width: 1, height: 1, ratio: 1 }
    var ramp = new Float32Array(MAX_COLORS * 3)
    var clickData = new Float32Array(MAX_CLICKS * 4)
    var clicks = []
    var trailData = new Float32Array(MAX_TRAIL * 4)
    var trail = []
    var pointer = { x: 0, y: 0, inside: false }
    var atlas = null
    var atlasKey = ''
    var paletteKey = ''
    var time = 0
    var glyphTime = 0
    var introClock = settings.intro && !reduce ? 0 : 1
    var frameSeed = 0
    var grainClock = 0
    var raf = 0
    var last = 0
    var visible = true
    var disposed = false
    var ready = !parallel

    function linked() {
      return !parallel || programs.every(function (item) {
        return gl.getProgramParameter(item.program, parallel.COMPLETION_STATUS_KHR)
      })
    }

    function release() {
      if (gl.isContextLost()) return
      if (!ready && !linked()) {
        requestAnimationFrame(release)
        return
      }
      programs.forEach(function (item) { gl.deleteProgram(item.program) })
    }

    function syncAtlas() {
      var s = settings
      var key = s.fontFamily + '|' + s.characters
      if (key === atlasKey && atlas) return
      atlasKey = key
      if (atlas) gl.deleteTexture(atlas.texture)
      atlas = buildAtlas(gl, s.characters, s.fontFamily)
      if (document.fonts && document.fonts.load) {
        document.fonts.load('300 64px ' + s.fontFamily, s.characters).then(function () {
          if (disposed || atlasKey !== key) return
          if (atlas) gl.deleteTexture(atlas.texture)
          atlas = buildAtlas(gl, s.characters, s.fontFamily)
          draw()
        }, function () {})
      }
    }

    function syncPalette() {
      var s = settings
      var key = s.colors.join(',')
      if (key === paletteKey) return
      paletteKey = key
      for (var i = 0; i < s.colors.length; i++) {
        ramp.set(toLab(parse(s.colors[i])), i * 3)
      }
    }

    function bindGlyphs(program, width, height) {
      if (!atlas) return
      var s = settings
      var u = program.uniforms
      var cellH = s.cellSize * view.ratio
      var cellW = cellH * (ATLAS_CELL_W / ATLAS_CELL_H)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[0])
      gl.uniform1i(u.uField, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, fieldTarget.textures[1])
      gl.uniform1i(u.uAux, 1)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture)
      gl.uniform1i(u.uAtlas, 2)
      gl.uniform2f(u.uResolution, width, height)
      gl.uniform2f(u.uCell, cellW, cellH)
      gl.uniform2f(
        u.uOffset,
        (width - Math.ceil(width / cellW) * cellW) / 2,
        (height - Math.ceil(height / cellH) * cellH) / 2
      )
      gl.uniform2f(u.uAtlasGrid, atlas.grid[0], atlas.grid[1])
      gl.uniform1f(u.uCount, atlas.count)
      gl.uniform1f(u.uDensity, s.density)
      gl.uniform1f(u.uOpacity, s.glyphOpacity)
      gl.uniform1f(u.uFlicker, reduce ? 0 : s.flicker)
      gl.uniform1f(u.uDepth, s.depthOfField)
      gl.uniform1f(u.uGlyphTime, glyphTime)
      gl.uniform1f(u.uSeedValue, s.variation)
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0)
    }

    function draw() {
      if (!ready) return
      var s = settings
      var aspect = view.width / view.height
      syncAtlas()
      syncPalette()
      gl.bindVertexArray(vao)
      gl.disable(gl.BLEND)

      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldTarget.framebuffer)
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
      gl.viewport(0, 0, fieldTarget.width, fieldTarget.height)
      gl.useProgram(field.program)
      var fu = field.uniforms
      gl.uniform1f(fu.uAspect, aspect)
      gl.uniform1f(fu.uTime, time)
      gl.uniform1i(fu.uShape, s.shape)
      gl.uniform3fv(fu.uRamp, ramp)
      gl.uniform1i(fu.uCount, s.colors.length)
      gl.uniform1f(fu.uScale, s.scale)
      gl.uniform1f(fu.uSoftness, s.softness)
      gl.uniform1f(fu.uFlow, s.flow)
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91)
      gl.uniform4fv(fu.uTrail, trailData)
      gl.uniform1f(fu.uRadius, s.scrambleRadius)
      gl.uniform4fv(fu.uClicks, clickData)
      gl.uniform1i(fu.uClickEffect, s.clickEffect)
      gl.uniform1f(fu.uIntro, introClock)
      gl.uniform1f(fu.uFrame, frameSeed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      var glowing = s.glow > 0.001
      if (glowing) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer)
        gl.drawBuffers([gl.COLOR_ATTACHMENT0])
        gl.viewport(0, 0, haloA.width, haloA.height)
        gl.useProgram(halo.program)
        bindGlyphs(halo, canvas.width, canvas.height)
        gl.uniform1f(halo.uniforms.uDownscale, canvas.width / haloA.width)
        gl.drawArrays(gl.TRIANGLES, 0, 3)

        gl.useProgram(blur.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(blur.uniforms.uSource, 0)
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloB.framebuffer)
        gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0])
        gl.uniform2f(blur.uniforms.uStep, 1 / haloA.width, 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.bindFramebuffer(gl.FRAMEBUFFER, haloA.framebuffer)
        gl.bindTexture(gl.TEXTURE_2D, haloB.textures[0])
        gl.uniform2f(blur.uniforms.uStep, 0, 1 / haloA.height)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(composite.program)
      bindGlyphs(composite, canvas.width, canvas.height)
      var cu = composite.uniforms
      gl.activeTexture(gl.TEXTURE3)
      gl.bindTexture(gl.TEXTURE_2D, haloA.textures[0])
      gl.uniform1i(cu.uHalo, 3)
      gl.uniform1f(cu.uGlow, glowing ? s.glow : 0)
      gl.uniform1f(cu.uGradient, s.gradientOpacity)
      gl.uniform1f(cu.uGrain, s.grain)
      gl.uniform1f(cu.uFrame, frameSeed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function resize() {
      var s = settings
      view.width = Math.max(1, container.clientWidth)
      view.height = Math.max(1, container.clientHeight)
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(view.width * view.ratio))
      canvas.height = Math.max(1, Math.round(view.height * view.ratio))
      sizeTarget(
        gl,
        fieldTarget,
        Math.max(1, Math.round(canvas.width / 2)),
        Math.max(1, Math.round(canvas.height / 2))
      )
      var haloWidth = Math.max(1, Math.round(canvas.width / 4))
      var haloHeight = Math.max(1, Math.round(canvas.height / 4))
      sizeTarget(gl, haloA, haloWidth, haloHeight)
      sizeTarget(gl, haloB, haloWidth, haloHeight)
      draw()
      wake()
    }

    function updateInput(dt) {
      for (var i = 0; i < trail.length; i++) trail[i].age += dt
      while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop()
      for (var t = 0; t < MAX_TRAIL; t++) {
        var point = trail[t]
        if (!point) {
          trailData[t * 4 + 2] = 0
          continue
        }
        var k = 1 - point.age / TRAIL_LIFE
        trailData.set([point.x, point.y, k * k, 0], t * 4)
      }
      for (var j = 0; j < clicks.length; j++) clicks[j].age += dt
      while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop()
      for (var c = 0; c < MAX_CLICKS; c++) {
        var click = clicks[c]
        if (!click) {
          clickData[c * 4 + 3] = 0
          continue
        }
        var ck = click.age / CLICK_LIFE
        var envelope = Math.min(1, click.age / 0.08) * (1 - ck) * (1 - ck)
        clickData.set([click.x, click.y, click.age, envelope], c * 4)
      }
    }

    function frame(now) {
      raf = 0
      if (disposed || !visible || document.hidden) return
      if (!ready) {
        if (!gl.isContextLost() && !linked()) {
          raf = requestAnimationFrame(frame)
          return
        }
        if (!programs.every(function (item) { return resolve(gl, item) })) {
          dispose()
          return
        }
        ready = true
      }
      var s = settings
      var dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60
      last = now
      if (!reduce) {
        time += dt * s.speed * 0.5
        glyphTime += dt * Math.max(s.speed, 0.15)
      }
      if (introClock < 1) introClock = Math.min(1, introClock + dt / s.introDuration)
      grainClock += dt
      if (!reduce && grainClock > 1 / 24) {
        grainClock = 0
        frameSeed = (frameSeed + 1) % 97
      }
      updateInput(dt)
      draw()
      var busy = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0
      if (busy) raf = requestAnimationFrame(frame)
      else last = 0
    }

    function wake() {
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    function locate(event) {
      var rect = container.getBoundingClientRect()
      var x = (event.clientX - rect.left) / Math.max(1, rect.width)
      var y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height)
      var aspect = rect.width / Math.max(1, rect.height)
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
      pointer.x = (x - 0.5) * aspect
      pointer.y = y - 0.5
    }

    function onPointerMove(event) {
      locate(event)
      if (!pointer.inside || !settings.mouseInteraction || reduce) return
      var head = trail[0]
      var gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity
      if (gap < TRAIL_STEP) return
      if (head && head.age < 0.1) {
        var steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)))
        for (var i = 1; i <= steps; i++) {
          var k = i / (steps + 1)
          trail.unshift({
            x: head.x + (pointer.x - head.x) * k,
            y: head.y + (pointer.y - head.y) * k,
            age: 0
          })
        }
      }
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 })
      trail.length = Math.min(trail.length, MAX_TRAIL)
      wake()
    }

    function onPointerDown(event) {
      locate(event)
      if (!pointer.inside || !settings.clickEffect || reduce) return
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0 })
      if (clicks.length > MAX_CLICKS) clicks.pop()
      wake()
    }

    function onVisibility() {
      last = 0
      wake()
    }

    var resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    var intersection = new IntersectionObserver(function (entries) {
      visible = entries.some(function (entry) { return entry.isIntersecting })
      if (visible) {
        last = 0
        wake()
      }
    })
    intersection.observe(container)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    resize()

    function update(nextOptions) {
      var prevIntro = settings.intro
      var prevDpr = settings.dpr
      settings = normalizeSettings(nextOptions)
      if (!settings.intro || reduce) introClock = 1
      else if (!prevIntro && settings.intro) introClock = 0
      if (settings.dpr !== prevDpr) resize()
      else wake()
    }

    function dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('visibilitychange', onVisibility)
      var targets = [fieldTarget, haloA, haloB]
      for (var t = 0; t < targets.length; t++) {
        for (var tx = 0; tx < targets[t].textures.length; tx++) gl.deleteTexture(targets[t].textures[tx])
        gl.deleteFramebuffer(targets[t].framebuffer)
      }
      if (atlas) gl.deleteTexture(atlas.texture)
      gl.deleteVertexArray(vao)
      if (canvas.isConnected) {
        release()
      } else {
        programs.forEach(function (item) { gl.deleteProgram(item.program) })
        var loseExt = gl.getExtension('WEBGL_lose_context')
        if (loseExt) loseExt.loseContext()
      }
    }

    return {
      update: update,
      wake: wake,
      dispose: dispose
    }
  }

  window.VeloGradientASCII = {
    mount: mount,
    defaultVeloColors: defaultVeloColors,
    DEFAULT_CHARACTERS: DEFAULT_CHARACTERS,
    DEFAULT_FONT: DEFAULT_FONT
  }
})()
