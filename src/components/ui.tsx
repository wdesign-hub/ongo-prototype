import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { ArrowLeft, X, ChevronRight, Check, CircleX } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { useFrame } from './PhoneFrame'

import statusLevels from '../assets/icons/status-levels.svg'
import navHouse from '../assets/icons/nav-house.svg'
import navCalendar from '../assets/icons/nav-calendar.svg'
import navCar from '../assets/icons/nav-car.svg'
import navUser from '../assets/icons/nav-user.svg'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- Status bar (only drawn inside the desktop device frame) ---------- */
export function StatusBar({ dark = false, tall = false }: { dark?: boolean; tall?: boolean }) {
  const { framed } = useFrame()
  if (!framed) return <div style={{ height: 'env(safe-area-inset-top)' }} className="shrink-0" />
  return (
    <div className={cx('relative flex shrink-0 items-start justify-between', tall ? 'h-[59px] pt-[21px]' : 'h-[54px] pt-[18px]')} aria-hidden>
      <span className={cx('w-[133px] pl-4 text-center text-[17px] font-semibold leading-[22px]', dark ? 'text-white' : 'text-ink')}>9:41</span>
      <img src={statusLevels} alt="" width={133} height={13} className={cx('mt-[5px]', dark ? 'invert' : 'dark:invert')} />
    </div>
  )
}

/* ---------- Buttons (button_default) ---------- */
type BtnVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?: 'lg' | 'md' | 'sm' | 'xs'
  lead?: ReactNode
  full?: boolean
}
const btnBase =
  'relative inline-flex select-none items-center justify-center gap-1 rounded-sm border px-3 text-center leading-[1.5] transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] touch-manipulation disabled:active:scale-100'
const btnVariant: Record<BtnVariant, string> = {
  primary: 'bg-brand border-brand-border text-on-brand [@media(hover:hover)]:hover:bg-brand-hover [@media(hover:hover)]:hover:text-brand-hover-ink',
  secondary: 'bg-transparent border-line-strong text-ink [@media(hover:hover)]:hover:bg-ink [@media(hover:hover)]:hover:border-ink [@media(hover:hover)]:hover:text-bg',
  tertiary: 'bg-bg-2 border-transparent text-ink [@media(hover:hover)]:hover:bg-line',
  danger: 'bg-danger-subtle border-danger text-danger [@media(hover:hover)]:hover:bg-danger [@media(hover:hover)]:hover:text-white',
  ghost: 'bg-transparent border-transparent text-ink',
}
const btnSize = { lg: 'h-[51px] text-base', md: 'h-[43px] text-base', sm: 'h-[38px] text-base', xs: 'h-8 text-base' }

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'lg', lead, full = true, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cx(
        btnBase,
        btnSize[size],
        disabled ? 'bg-bg-2 border-transparent text-ink/25' : btnVariant[variant],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {lead && <span className="absolute left-3 flex">{lead}</span>}
      {children}
    </button>
  )
})

/* ---------- Header with back button (header / button_arrow_small) ---------- */
export function BackButton({ icon = 'back', onClick, label }: { icon?: 'back' | 'close'; onClick?: () => void; label?: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={onClick ?? (() => navigate(-1))}
      aria-label={label ?? (icon === 'close' ? 'Close' : 'Go back')}
      className="flex size-[51px] shrink-0 items-center justify-center rounded-lg bg-bg-2 transition-[background-color,transform] duration-150 active:scale-[0.94] [@media(hover:hover)]:hover:bg-line"
    >
      {icon === 'close' ? <X size={20} strokeWidth={2} /> : <ArrowLeft size={20} strokeWidth={2} />}
    </button>
  )
}

export function Header({ title, back = true, icon, onBack, right }: { title?: string; back?: boolean; icon?: 'back' | 'close'; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="shrink-0 px-6 py-1">
      <div className="grid h-14 grid-cols-[51px_1fr_51px] items-center gap-3">
        {back ? <BackButton icon={icon} onClick={onBack} /> : <span />}
        {title ? <h1 className="truncate text-center text-lg font-bold">{title}</h1> : <span />}
        <span className="flex justify-end">{right}</span>
      </div>
    </div>
  )
}

/* ---------- Screen shell ---------- */
export function Screen({ children, className, bg = 'bg-bg' }: { children: ReactNode; className?: string; bg?: string }) {
  return <div className={cx('absolute inset-0 flex flex-col overflow-hidden', bg, className)}>{children}</div>
}

export function Scroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain', className)}>{children}</div>
}

export function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('shrink-0 px-6 pt-6', className)} style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
      {children}
    </div>
  )
}

/* ---------- Segmented tabs (tab / tab_slot) ---------- */
export function Tabs<T extends string>({ items, value, onChange, id }: { items: { value: T; label: string }[]; value: T; onChange: (v: T) => void; id: string }) {
  return (
    <div role="tablist" className="flex h-[47px] w-full rounded-md bg-bg-2 p-1">
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cx('relative flex-1 rounded-sm px-3 text-sm transition-colors duration-150', active ? 'font-bold' : 'text-ink [@media(hover:hover)]:hover:bg-ink/[0.04]')}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${id}`}
                className="absolute inset-0 rounded-sm bg-bg shadow-[0_1px_2px_rgba(11,13,14,0.06)]"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
              />
            )}
            <span className={cx('relative', active && 'text-base')}>{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- card_info ---------- */
const infoTone = { success: 'bg-success-subtle', warning: 'bg-warning-subtle', info: 'bg-info-subtle', danger: 'bg-danger-subtle' }
export function InfoCard({ tone = 'info', icon, title, children, onClose }: { tone?: keyof typeof infoTone; icon: ReactNode; title: string; children: ReactNode; onClose?: () => void }) {
  return (
    <div className={cx('flex w-full flex-col gap-3 rounded-md p-4 text-left', infoTone[tone])}>
      <div className="flex items-center gap-2">
        <span className="flex size-4 shrink-0">{icon}</span>
        <p className="flex-1 text-sm font-bold leading-[1.15]">{title}</p>
        {onClose && (
          <button onClick={onClose} aria-label="Dismiss" className="-m-2 p-2">
            <CircleX size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      <p className="text-sm leading-[1.5] text-muted text-pretty">{children}</p>
    </div>
  )
}

/* ---------- Badge ---------- */
export function Badge({ tone = 'green', children }: { tone?: 'green' | 'dark' | 'brand'; children: ReactNode }) {
  const t = { green: 'bg-badge-green text-badge-green-ink', dark: 'bg-badge-dark text-white', brand: 'bg-brand text-on-brand' }[tone]
  return <span className={cx('inline-flex h-[17px] w-fit items-center rounded-xs px-1 text-xs leading-none', t)}>{children}</span>
}

/* ---------- Field (Card entry field) ---------- */
export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <label className="flex w-full flex-col gap-2">
      {label && <span className="text-sm leading-none text-muted">{label}</span>}
      {children}
    </label>
  )
}
export const inputBox =
  'flex h-[52px] w-full items-center gap-2 rounded-sm border border-line bg-bg px-3 text-base transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(160,232,112,0.35)]'

/* ---------- Selectable option card (Detailed option / Cancellation reason) ---------- */
export function OptionCard({ selected, onClick, title, sub, className, right }: { selected?: boolean; onClick?: () => void; title: ReactNode; sub?: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        'flex min-h-20 w-full items-center gap-3 rounded-lg bg-bg px-4 py-3 text-left transition-[box-shadow,transform] duration-150 active:scale-[0.985]',
        selected ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]',
        className,
      )}
    >
      <span className="flex flex-1 flex-col gap-2">
        <span className="text-base font-bold leading-none">{title}</span>
        {sub && <span className="text-sm leading-[1.2] text-muted">{sub}</span>}
      </span>
      {right}
    </button>
  )
}

/* ---------- List row with chevron (Profile buttons) ---------- */
export function RowButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex h-12 w-full items-center gap-2 bg-bg px-4 text-left text-sm text-muted transition-colors duration-150 active:bg-bg-2 [@media(hover:hover)]:hover:bg-ink/[0.02]">
      <span className="flex text-ink">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={16} strokeWidth={2.25} className="text-ink" />
    </button>
  )
}

/* ---------- Feature line (checked chip inside service cards) ---------- */
export function FeatureLine({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center gap-1 rounded-sm border border-line bg-bg p-2">
      <Check size={16} strokeWidth={2} className="shrink-0 text-success" />
      <span className={cx('truncate text-xs leading-[1.25]', muted ? 'text-muted' : 'text-ink/70')}>{children}</span>
    </div>
  )
}

/* ---------- Bottom navbar ---------- */
const NAV = [
  { to: '/home', label: 'Home', icon: navHouse, match: ['/home', '/offline'] },
  { to: '/bookings', label: 'Bookings', icon: navCalendar, match: ['/bookings', '/rate'] },
  { to: '/garage', label: 'My Vehicle', icon: navCar, match: ['/garage'] },
  { to: '/profile', label: 'Profile', icon: navUser, match: ['/profile'] },
]
export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <nav
      className="relative z-10 flex shrink-0 justify-around border-t border-line bg-bg px-1 pt-2"
      style={{ paddingBottom: 'max(37px, calc(env(safe-area-inset-bottom) + 8px))' }}
    >
      {NAV.map((it) => {
        const active = it.match.some((m) => pathname.startsWith(m))
        return (
          <button
            key={it.to}
            onClick={() => !active && navigate(it.to, { replace: true })}
            aria-current={active ? 'page' : undefined}
            className="flex w-[92px] flex-col items-center gap-1"
          >
            <span className="relative flex h-8 w-[92px] items-center justify-center">
              {active && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }} />
              )}
              <img src={it.icon} alt="" width={24} height={24} className={cx('relative transition-[filter] duration-200', !active && 'dark:invert')} />
            </span>
            <span className="text-xs leading-none">{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* ---------- Bottom sheet (drag handle, spring in, drag-to-dismiss) ---------- */
export function Sheet({ open, onClose, children, scrim = true, className }: { open: boolean; onClose?: () => void; children: ReactNode; scrim?: boolean; className?: string }) {
  const reduce = useReducedMotion()
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (onClose && (info.offset.y > 120 || info.velocity.y > 600)) onClose()
  }
  return (
    <AnimatePresence>
      {open && (
        <>
          {scrim && (
            <motion.div
              key="scrim"
              className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
          )}
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            className={cx('absolute inset-x-0 bottom-0 z-40 flex max-h-[94%] flex-col rounded-t-lg bg-bg shadow-[0_-8px_32px_rgba(11,13,14,0.12)]', className)}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.12 }}
            drag={onClose ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            <SheetHandle />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
export function SheetHandle() {
  return (
    <div className="flex h-6 shrink-0 cursor-grab justify-center pt-2 active:cursor-grabbing">
      <span className="h-1.5 w-[50px] rounded-full bg-bg-2" />
    </div>
  )
}

/* ---------- Empty state (empty-state-card) ---------- */
export function EmptyState({ image, title, body, note, children }: { image: string; title: string; body: string; note?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-9">
      <motion.div
        className="flex w-full flex-col items-center gap-6 rounded-lg p-7 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      >
        <img src={image} alt="" width={124} height={124} className="size-[124px] object-contain" />
        <div className="flex flex-col gap-4">
          <h2 className="text-[22px] font-bold leading-[1.2]">{title}</h2>
          <p className="text-sm leading-[1.5] text-muted text-pretty">{body}</p>
        </div>
        {(note || children) && (
          <div className="flex w-full flex-col gap-4">
            {note && <p className="text-sm text-muted">{note}</p>}
            {children}
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ---------- Toast ---------- */
export function Toast({ show, children, icon }: { show: boolean; children: ReactNode; icon?: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          className="absolute inset-x-6 bottom-[120px] z-50 flex items-center gap-2.5 rounded-md border border-brand-border bg-success-subtle p-3 text-sm"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        >
          {icon}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Small helpers ---------- */
export function useTimeout(fn: () => void, ms: number, deps: unknown[] = []) {
  useEffect(() => {
    const t = setTimeout(fn, ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  return [left, () => setLeft(seconds)] as const
}

/* ---------- Compact segmented control (App Settings: Appearance / Language) ---------- */
export function Segmented<T extends string>({ items, value, onChange, id, label }: { items: { value: T; label: string; dir?: 'rtl' }[]; value: T; onChange: (v: T) => void; id: string; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-9 w-[167px] shrink-0 rounded-md bg-bg-2 p-1">
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            role="radio"
            aria-checked={active}
            dir={it.dir}
            onClick={() => onChange(it.value)}
            className={cx('relative flex-1 rounded-sm px-3 leading-none transition-colors duration-150', active ? 'text-base font-bold text-ink' : 'text-sm text-muted [@media(hover:hover)]:hover:text-ink')}
          >
            {active && (
              <motion.span
                layoutId={`seg-pill-${id}`}
                className="absolute inset-0 rounded-sm bg-bg shadow-[0_1px_2px_rgba(11,13,14,0.06)]"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
              />
            )}
            <span className="relative">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ONGO marks: black artwork in light, white artwork in dark (no JS needed) */
export function ThemedImg({ light, dark, className, ...rest }: { light: string; dark: string; alt: string; width: number; height: number; className?: string }) {
  return (
    <>
      <img src={light} className={cx('dark:hidden', className)} {...rest} />
      <img src={dark} className={cx('hidden dark:block', className)} {...rest} />
    </>
  )
}

export const SectionLabel = ({ children }: { children: ReactNode }) => <h3 className="text-xs font-bold leading-none">{children}</h3>
