import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  /** Nom de la zone pour les lecteurs d'écran (ex. « Nos pizzas »). */
  label: string
  children: ReactNode
}

/**
 * Liste défilante horizontale : glisser au doigt (mobile), cliquer-glisser à la souris,
 * flèches ← → ou clavier (la zone est focalisable).
 */
export function HorizontalScroller({ label, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = () => {
    const el = ref.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(updateEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scroll = (direction: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  // Cliquer-glisser à la souris (au doigt, le défilement natif suffit).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    drag.current = { x: e.clientX, scrollLeft: ref.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return
    const dx = e.clientX - drag.current.x
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true
      setDragging(true)
      ref.current.setPointerCapture(e.pointerId)
    }
    if (drag.current.moved) ref.current.scrollLeft = drag.current.scrollLeft - dx
  }
  const endDrag = () => {
    drag.current = null
    setDragging(false)
  }

  const arrow = 'grid size-11 place-items-center rounded-full bg-surface shadow-card ring-1 ring-border transition-opacity hover:text-primary disabled:pointer-events-none disabled:opacity-0'

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => dragging && e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`-mx-4 scroll-px-4 overflow-x-auto px-4 pb-4 pt-1 md:scroll-px-8 [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto'
        }`}
      >
        <ul className="flex w-max gap-5">{children}</ul>
      </div>
      <div className="pointer-events-none absolute inset-y-0 -left-2 hidden items-center md:flex">
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} className={`${arrow} pointer-events-auto`} aria-label="Pizzas précédentes">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 -right-2 hidden items-center md:flex">
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} className={`${arrow} pointer-events-auto`} aria-label="Pizzas suivantes">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
