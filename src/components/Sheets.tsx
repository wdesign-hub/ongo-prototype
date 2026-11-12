import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { CAR_COLORS, MAX_CAR_COLORS, parseColors } from '../lib/data'
import type { Car } from '../lib/store'
import { Button, OptionCard, Sheet, cx } from './ui'

/* Bottom sheet / Choose Color — multi-select, up to 3 (Figma annotation) */
export function ColorSheet({ open, value, onClose, onSave }: { open: boolean; value: string; onClose: () => void; onSave: (c: string) => void }) {
  const [sel, setSel] = useState<string[]>(() => parseColors(value))
  const [nudge, setNudge] = useState(0)
  useEffect(() => { if (open) setSel(parseColors(value)) }, [open, value])
  const toggle = (name: string) => {
    if (sel.includes(name)) setSel(sel.filter((c) => c !== name))
    else if (sel.length < MAX_CAR_COLORS) setSel([...sel, name])
    else setNudge((n) => n + 1) // at the limit: shake the hint instead of silently ignoring the tap
  }
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6 pb-8" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-[60px_1fr_60px] items-center">
            <span />
            <h2 className="text-center text-xl font-semibold">Choose colour</h2>
            <button onClick={() => setSel([])} className="-my-3 py-3 text-right text-sm text-muted">Reset</button>
          </div>
          <motion.p
            key={nudge}
            className={cx('text-center text-xs tabular', sel.length >= MAX_CAR_COLORS ? 'text-ink' : 'text-muted')}
            animate={nudge ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
            transition={{ duration: 0.35 }}
          >
            Pick up to {MAX_CAR_COLORS} colours · {sel.length}/{MAX_CAR_COLORS}
          </motion.p>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-4">
          {CAR_COLORS.map((c) => {
            const on = sel.includes(c.name)
            const light = ['White', 'Silver', 'Yellow', 'Other'].includes(c.name)
            const full = !on && sel.length >= MAX_CAR_COLORS
            return (
              <button key={c.name} onClick={() => toggle(c.name)} aria-pressed={on} className={cx('flex flex-col items-center gap-1.5 text-xs transition-opacity duration-150', full && 'opacity-40')}>
                <span className={cx('flex size-[72px] items-center justify-center rounded-full transition-transform duration-150 active:scale-95', c.name === 'White' && 'border border-line', c.name === 'Black' && 'dark:border dark:border-line')} style={{ background: c.hex }}>
                  {on && (
                    <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.3 }}>
                      <Check size={28} strokeWidth={2.25} className={light ? 'text-[#0b0d0e]' : 'text-white'} />
                    </motion.span>
                  )}
                </span>
                {c.name}
              </button>
            )
          })}
        </div>
        <Button size="md" disabled={!sel.length} onClick={() => onSave(sel.join(', '))} className="font-bold">Save</Button>
      </div>
    </Sheet>
  )
}

/* Bottom sheet / Car type — picks which garage car the Home prices are for */
export const carSummary = (c: Car) => `${c.type.startsWith('SUV') ? 'SUV' : c.type} · ${c.type.includes('7') ? 7 : 5} seats · ${c.color}`

export function CarTypeSheet({ open, cars, value, onClose, onSave }: { open: boolean; cars: Car[]; value: string | null; onClose: () => void; onSave: (id: string) => void }) {
  const [sel, setSel] = useState(value)
  useEffect(() => { if (open) setSel(value) }, [open, value])
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col px-6" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-[24px_1fr_24px] items-center pb-4">
          <button onClick={onClose} aria-label="Close" className="-m-3 p-3"><X size={20} strokeWidth={2} /></button>
          <h2 className="text-center text-xl font-semibold">Choose your car</h2>
        </div>
        <div className="flex flex-col gap-3">
          {cars.map((c) => (
            <OptionCard
              key={c.id}
              selected={sel === c.id}
              onClick={() => setSel(c.id)}
              title={<span className="block truncate text-lg">{c.name}</span>}
              sub={<span className="block truncate">{carSummary(c)}</span>}
            />
          ))}
        </div>
        <div className="pt-7"><Button size="md" className="!h-[49px] !rounded-[7px] font-semibold" disabled={!sel} onClick={() => sel && onSave(sel)}>Continue</Button></div>
      </div>
    </Sheet>
  )
}

/* Confirmation sheet (Log out / Delete account / Payment failed) */
export function ConfirmSheet({ open, onClose, title, body, image, children }: { open: boolean; onClose: () => void; title: string; body: string; image?: string; children: ReactNode }) {
  return (
    <Sheet open={open} onClose={onClose}>
      {image && <img src={image} alt="" width={124} height={124} className="mx-auto mt-2 size-[124px] object-contain" />}
      <div className="flex flex-col items-center gap-2 px-6 py-4 text-center">
        <h2 className="text-[22px] font-bold leading-[1.2]">{title}</h2>
        <p className="text-sm leading-[1.5] text-muted text-pretty">{body}</p>
      </div>
      <div className="h-px bg-line" />
      <div className="flex flex-col gap-3 px-6 pt-4" style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>{children}</div>
    </Sheet>
  )
}
