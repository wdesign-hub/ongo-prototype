import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { CAR_COLORS, CAR_TYPES, type CarType } from '../lib/data'
import { Button, OptionCard, Sheet, cx } from './ui'

/* Bottom sheet / Choose Color */
export function ColorSheet({ open, value, onClose, onSave }: { open: boolean; value: string; onClose: () => void; onSave: (c: string) => void }) {
  const [sel, setSel] = useState(value)
  useEffect(() => { if (open) setSel(value) }, [open, value])
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6 pb-8" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-[60px_1fr_60px] items-center pt-2">
          <span />
          <h2 className="text-center text-xl font-semibold">Choose color</h2>
          <button onClick={() => setSel('')} className="text-right text-sm text-muted">Reset</button>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-4">
          {CAR_COLORS.map((c) => {
            const on = sel === c.name
            const light = ['White', 'Silver', 'Yellow', 'Other'].includes(c.name)
            return (
              <button key={c.name} onClick={() => setSel(c.name)} aria-pressed={on} className="flex flex-col items-center gap-1.5 text-xs">
                <span className={cx('flex size-[72px] items-center justify-center rounded-full transition-transform duration-150 active:scale-95', c.name === 'White' && 'border border-line')} style={{ background: c.hex }}>
                  {on && (
                    <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.3 }}>
                      <Check size={28} strokeWidth={2.25} className={light ? 'text-ink' : 'text-white'} />
                    </motion.span>
                  )}
                </span>
                {c.name}
              </button>
            )
          })}
        </div>
        <Button size="md" disabled={!sel} onClick={() => onSave(sel)} className="font-bold">Save</Button>
      </div>
    </Sheet>
  )
}

/* Bottom sheet / Car type (from Home header chip) */
export function CarTypeSheet({ open, value, onClose, onSave }: { open: boolean; value: CarType; onClose: () => void; onSave: (t: CarType) => void }) {
  const [sel, setSel] = useState(value)
  useEffect(() => { if (open) setSel(value) }, [open, value])
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 px-6" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-[24px_1fr_24px] items-center">
          <button onClick={onClose} aria-label="Close"><X size={20} strokeWidth={2} /></button>
          <h2 className="text-center text-xl font-semibold">Choose car type</h2>
        </div>
        <div className="flex flex-col gap-3">
          {CAR_TYPES.map((t) => <OptionCard key={t.type} selected={sel === t.type} onClick={() => setSel(t.type)} title={t.type} sub={t.examples} />)}
        </div>
        <Button size="md" className="font-bold" onClick={() => onSave(sel)}>Continue</Button>
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
