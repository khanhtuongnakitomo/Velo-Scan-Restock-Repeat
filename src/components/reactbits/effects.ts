/**
 * ReactBits-inspired SpotlightCard micro-interaction
 * wired to CSS custom properties so transitions remain GPU-composited.
 */
export function setupReactBitsEffects(root: HTMLElement, reduce: boolean): () => void {
  if (reduce || !matchMedia('(hover: hover)').matches) return () => {}

  const cleanups: Array<() => void> = []

  // SpotlightCard: cursor-tracking radial glow + subtle border focus
  const spotTargets = root.querySelectorAll<HTMLElement>('.card, .panel, .member, .road')
  spotTargets.forEach((el) => {
    el.setAttribute('data-spotlight', 'true')
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      el.style.setProperty('--my', `${e.clientY - rect.top}px`)
      el.classList.add('is-spot')
    }
    const onLeave = () => {
      el.classList.remove('is-spot')
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    })
  })

  return () => {
    cleanups.forEach((fn) => fn())
  }
}
