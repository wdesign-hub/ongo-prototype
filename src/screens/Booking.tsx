import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, Calendar, ChevronRight, Circle, MapPin, Search, Timer, Warehouse, X } from 'lucide-react'
import { useStore, uid } from '../lib/store'
import { ADDONS, CANCEL_REASONS, LOCATIONS, PIN_AREAS, SERVICES, SERVICE_LIST_ORDER, serviceById, type ServiceId } from '../lib/data'
import { Badge, BackButton, Button, FeatureLine, Footer, Header, Screen, Scroll, Sheet, StatusBar, SheetHandle, ThemedImg, cx, useTimeout } from '../components/ui'
import { ConfirmSheet } from '../components/Sheets'

import mapImg from '../assets/img/map.png'
import logo from '../assets/icons/ongo-logo.svg'
import logoWhite from '../assets/icons/ongo-logo-white.svg'
import applePay from '../assets/icons/applepay-lg.svg'
import mastercard from '../assets/icons/mastercard.svg'
import visaSm from '../assets/icons/visa.svg'
import illPin from '../assets/img/ill-pin.png'
import illCard from '../assets/img/ill-card.png'

type Step = 'locate' | 'search' | 'service' | 'addons' | 'schedule'

/* ---------- Map background: draggable, pin stays centred ---------- */
function MapCanvas({ dim, onMoved }: { dim?: boolean; onMoved?: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bg-2">
      <motion.img
        src={mapImg}
        alt=""
        draggable={false}
        drag
        dragMomentum
        dragConstraints={{ left: -260, right: 260, top: -360, bottom: 360 }}
        dragElastic={0.12}
        onDragEnd={(_, i) => { if (Math.hypot(i.offset.x, i.offset.y) > 24) onMoved?.() }}
        className="absolute left-1/2 top-1/2 h-[1688px] w-[780px] max-w-none -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none active:cursor-grabbing dark:hue-rotate-180 dark:invert dark:brightness-[0.9] dark:contrast-[0.9]"
      />
      <AnimatePresence>
        {dim && <motion.div className="pointer-events-none absolute inset-0 bg-bg/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
      </AnimatePresence>
    </div>
  )
}

function Pin() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[38%] z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
    >
      <span className="flex size-[34px] items-center justify-center rounded-full bg-ink"><span className="size-[18px] rounded-full bg-brand" /></span>
      <span className="h-[26px] w-1 rounded-b-full bg-ink" />
    </motion.div>
  )
}

/* Sheet container that stays docked over the map (no scrim, height animates between steps) */
function DockSheet({ children, stepKey, tall }: { children: ReactNode; stepKey: string; tall?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      layout
      className={cx('absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-lg bg-bg shadow-[0_-8px_32px_rgba(11,13,14,0.10)]', tall && 'top-[44px]')}
      initial={reduce ? false : { y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
    >
      <SheetHandle />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={stepKey}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function SheetTitle({ icon, onIcon, children }: { icon?: 'back' | 'close'; onIcon?: () => void; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[20px_1fr_20px] items-center gap-4">
      {icon ? (
        <button onClick={onIcon} aria-label={icon === 'close' ? 'Close' : 'Back'} className="-m-2 p-2">
          {icon === 'close' ? <X size={20} strokeWidth={2} /> : <ArrowLeft size={20} strokeWidth={2} />}
        </button>
      ) : <span />}
      <h2 className="text-center text-xl font-semibold leading-none">{children}</h2>
      <span />
    </div>
  )
}

function Chip({ children, onClick, icon }: { children: ReactNode; onClick?: () => void; icon?: ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-[31px] items-center gap-1 self-start rounded-full border border-[#536922]/30 bg-line dark:border-transparent px-3 text-xs transition-transform active:scale-95">
      {icon}{children}
    </button>
  )
}

/* payment method row + pay button (Reservation confirmation) */
function PayBlock({ onPay, label = 'Pay and continue', disabled }: { onPay: () => void; label?: string; disabled?: boolean }) {
  const { state } = useStore()
  const navigate = useNavigate()
  const card = state.payments.find((p) => p.id === state.primaryPaymentId) ?? state.payments[0]
  return (
    <div className="flex flex-col gap-3.5" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
      <button onClick={() => navigate('/payments?from=booking')} className="flex h-8 items-center justify-between text-xs">
        {card ? (
          <span className="flex items-center gap-2">
            <img src={card.brand === 'visa' ? visaSm : card.brand === 'applepay' ? applePay : mastercard} alt="" width={34} height={24} className="h-6 w-[34px] object-contain" />
            {card.label} {card.last4 && <span className="tracking-wider">•••• {card.last4}</span>} {card.bank && `(${card.bank})`}
          </span>
        ) : 'Set up a payment method'}
        <ChevronRight size={16} strokeWidth={2} />
      </button>
      <Button size="lg" className="!h-[49px] font-medium" disabled={disabled || !card} onClick={onPay}>{label}</Button>
    </div>
  )
}

/* ---------- Step contents ---------- */
function LocateStep({ go, onBack, area, onConfirm }: { go: (s: Step) => void; onBack: () => void; area: string | null; onConfirm: () => void }) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 px-6 py-4 text-center">
        <h2 className="text-2xl font-bold leading-none">Set your location</h2>
        <p className="text-sm text-muted opacity-70">Drag map to move pin</p>
      </div>
      <div className="h-px bg-line" />
      <div className="flex flex-col gap-3 px-6 py-4" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <button onClick={() => go('search')} className="flex h-[45px] items-center justify-between rounded-[7px] bg-bg-2 px-3 text-left">
          <span className="flex min-w-0 items-center gap-4 text-muted">
            <MapPin size={16} strokeWidth={2} className="shrink-0 text-ink" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={area ?? 'empty'} className="truncate" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {area ?? 'Car location'}
              </motion.span>
            </AnimatePresence>
          </span>
          <Search size={16} strokeWidth={2} className="shrink-0" />
        </button>
        {area
          ? <Button className="!h-[49px] !rounded-[7px] font-semibold" onClick={onConfirm}>Confirm location</Button>
          : <Button className="!h-[49px] !rounded-[7px] font-semibold" onClick={() => go('service')}>Search for a location</Button>}
        <button onClick={onBack} className="sr-only">Back</button>
      </div>
    </>
  )
}

function SearchStep({ go, onPick, onBack }: { go: (s: Step) => void; onPick: (id: string) => void; onBack: () => void }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => LOCATIONS.filter((l) => (l.name + l.address).toLowerCase().includes(q.trim().toLowerCase())), [q])
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6">
      <div className="flex flex-col gap-4 pb-4">
        <SheetTitle icon="back" onIcon={onBack}>Plan your car wash</SheetTitle>
        <Chip icon={<Calendar size={12} strokeWidth={2} />} onClick={() => go('schedule')}>Wash later</Chip>
        <div className="h-px bg-line" />
      </div>
      <label className="flex h-[45px] shrink-0 items-center gap-4 rounded-[7px] bg-bg-2 px-3 focus-within:ring-2 focus-within:ring-brand">
        <MapPin size={16} strokeWidth={2} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Car location" aria-label="Search car location" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
        <Search size={16} strokeWidth={2} />
      </label>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-6">
        {list.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 pt-6 text-center">
            <img src={illPin} alt="" width={124} height={124} />
            <p className="font-bold">No places match "{q}"</p>
            <p className="max-w-[300px] text-xs text-muted">Check the spelling, or close search and drag the map pin to your car.</p>
          </motion.div>
        ) : (
          list.map((l) => (
            <button key={l.id} onClick={() => onPick(l.id)} className="flex w-full items-center gap-2 text-left transition-colors active:bg-bg-2">
              {l.recent ? <Warehouse size={18} strokeWidth={1.75} className="shrink-0" /> : <MapPin size={18} strokeWidth={1.75} className="shrink-0" />}
              <span className="flex flex-1 flex-col gap-3 border-b border-line py-6">
                <span className="flex items-center gap-2.5 text-sm">
                  <span className={l.recent ? 'font-bold' : ''}>{l.name}</span>
                  {l.recent && <Badge>RECENT</Badge>}
                </span>
                <span className="text-sm opacity-60">{l.address}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function ServiceRow({ id, selected, onClick }: { id: ServiceId; selected: boolean; onClick: () => void }) {
  const s = serviceById(id)
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cx('flex min-h-20 w-full items-center gap-2 rounded-lg bg-bg py-3 pl-2 pr-4 text-left transition-[box-shadow,transform] duration-150 active:scale-[0.985]', selected ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]')}
    >
      <img src={s.icon} alt="" width={56} height={56} className="size-14 object-contain" />
      <span className="flex flex-1 flex-col items-start gap-2">
        <span className="text-base font-bold leading-none">{s.listName}</span>
        <span className="text-sm leading-none text-muted">{id === 'custom' ? 'Custom bundles from vendors' : s.duration}</span>
        {s.recommended && <Badge tone="dark">Recommended</Badge>}
      </span>
      {s.price !== null ? (
        <span className="text-sm"><b>{s.price}</b> QAR</span>
      ) : (
        <ChevronRight size={22} strokeWidth={2} />
      )}
    </button>
  )
}

function ServiceStep({ go, onClose, onPay }: { go: (s: Step) => void; onClose: () => void; onPay: () => void }) {
  const { state, set } = useStore()
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-6 px-6">
      <SheetTitle icon="close" onIcon={onClose}>Choose a service</SheetTitle>
      <div className="flex flex-col gap-3">
        <Chip onClick={() => navigate('/book/details')}>Service details</Chip>
        {SERVICE_LIST_ORDER.map((id) => (
          <ServiceRow
            key={id}
            id={id}
            selected={state.draft.service === id}
            onClick={() => {
              set((s) => ({ draft: { ...s.draft, service: id } }))
              if (id === 'custom') go('addons')
            }}
          />
        ))}
      </div>
      <PayBlock onPay={onPay} />
    </div>
  )
}

export function AddonGrid({ compact }: { compact?: boolean }) {
  const { state, set } = useStore()
  const toggle = (id: string) => set((s) => ({ draft: { ...s.draft, addons: s.draft.addons.includes(id) ? s.draft.addons.filter((a) => a !== id) : [...s.draft.addons, id] } }))
  return (
    <div className="grid grid-cols-3 gap-0">
      {ADDONS.map((a) => {
        const on = state.draft.addons.includes(a.id)
        return (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            aria-pressed={on}
            className={cx(
              'm-[1.5px] flex h-[88px] flex-col items-center justify-center gap-2 rounded-sm px-3 text-center text-xs leading-[1.25] text-muted transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.96]',
              on ? 'bg-brand-subtle text-ink/70 shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'bg-bg shadow-[inset_0_0_0_1px_var(--color-line-strong)]',
              compact && 'h-[88px]',
            )}
          >
            <img src={a.icon} alt="" width={24} height={24} className="dark:invert" />
            {a.label}
          </button>
        )
      })}
    </div>
  )
}

function AddonsStep({ go, onPay }: { go: (s: Step) => void; onPay: () => void }) {
  const { state } = useStore()
  return (
    <div className="flex flex-col gap-6 px-6">
      <div className="pb-4"><SheetTitle icon="back" onIcon={() => go('service')}>Build your package</SheetTitle></div>
      <AddonGrid />
      <PayBlock onPay={onPay} disabled={state.draft.addons.length === 0} />
    </div>
  )
}

/* iOS-style wheel picker column */
function Wheel({ items, value, onChange, width, align = 'center' }: { items: string[]; value: number; onChange: (i: number) => void; width: string; align?: 'left' | 'center' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const ROW = 32
  const [pos, setPos] = useState(value)
  useEffect(() => { ref.current?.scrollTo({ top: value * ROW }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const el = ref.current!
    const p = el.scrollTop / ROW
    setPos(p)
    const i = Math.round(p)
    if (i !== value && i >= 0 && i < items.length) onChange(i)
  }
  return (
    <div ref={ref} onScroll={onScroll} className="no-scrollbar relative h-[184px] snap-y snap-mandatory overflow-y-scroll overscroll-contain" style={{ width, maskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)' }}>
      <div style={{ height: 76 }} />
      {items.map((it, i) => {
        const d = Math.abs(i - pos)
        return (
          <button
            key={it + i}
            onClick={() => ref.current?.scrollTo({ top: i * ROW, behavior: 'smooth' })}
            className={cx('flex h-8 w-full snap-center items-center', align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center')}
            style={{ opacity: Math.max(0.12, 1 - d * 0.28), fontSize: d < 0.5 ? 22 : 16, fontWeight: d < 0.5 ? 500 : 400, transition: 'font-size 120ms' }}
          >
            {it}
          </button>
        )
      })}
      <div style={{ height: 76 }} />
    </div>
  )
}

const DAYS = (() => {
  const out: string[] = []
  const d = new Date()
  for (let i = 0; i < 14; i++) {
    const x = new Date(d.getTime() + i * 864e5)
    out.push(i === 0 ? 'Today' : x.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', ''))
  }
  return out
})()
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1))
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function ScheduleStep({ go, onDone }: { go: (s: Step) => void; onDone: (when: string) => void }) {
  const [day, setDay] = useState(0)
  const [h, setH] = useState(7)
  const [m, setM] = useState(9)
  const [p, setP] = useState(1)
  return (
    <div className="flex flex-col px-6">
      <SheetTitle icon="back" onIcon={() => go('search')}>Choose a day and time</SheetTitle>
      <div className="relative my-6 flex items-center justify-center gap-0 px-2 pt-2">
        <span className="pointer-events-none absolute inset-x-2 top-[calc(50%+4px)] h-8 -translate-y-1/2 rounded-sm bg-bg-2" />
        <div className="relative flex w-full justify-between px-6">
          <Wheel items={DAYS} value={day} onChange={setDay} width="128px" align="right" />
          <Wheel items={HOURS} value={h} onChange={setH} width="40px" />
          <Wheel items={MINS} value={m} onChange={setM} width="40px" />
          <Wheel items={['AM', 'PM']} value={p} onChange={setP} width="48px" />
        </div>
      </div>
      <div className="px-4" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        <Button className="!h-[49px] font-semibold" onClick={() => onDone(`${DAYS[day]}, ${HOURS[h]}:${MINS[m]} ${p ? 'PM' : 'AM'}`)}>Continue</Button>
      </div>
    </div>
  )
}

/* ---------- Booking map screen (Booking 1.0 – 1.5, Location no results, Payment failed) ---------- */
export function BookingMap() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const step = (params.get('step') as Step) ?? 'locate'
  const go = (s: Step) => setParams({ step: s })
  const { state, set } = useStore()
  const [failed, setFailed] = useState(false)
  const [area, setArea] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [geoDismissed, setGeoDismissed] = useState(false)
  const geoOpen = state.locationOff && !geoDismissed && step === 'locate'

  const pay = () => {
    if (state.failPayment) { setFailed(true); return }
    const d = state.draft
    set({ booking: { id: uid(), service: d.service, addons: d.service === 'custom' ? d.addons : [], location: d.location ?? 'seaside', when: d.when, stage: 0, status: 'searching', createdAt: Date.now() } })
    navigate('/book/confirm', { replace: true })
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MapCanvas dim={step === 'search'} onMoved={() => { setArea(PIN_AREAS[moves % PIN_AREAS.length].name); setMoves((m) => m + 1) }} />
      <div className="relative z-10"><StatusBar /></div>
      {step === 'locate' && (
        <>
          <Pin />
          <div className="absolute left-6 top-[60px] z-10"><BackButton onClick={() => navigate(-1)} /></div>
        </>
      )}
      <DockSheet stepKey={step} tall={step === 'search'}>
        {step === 'locate' && (
          <LocateStep
            go={go}
            area={area}
            onBack={() => navigate(-1)}
            onConfirm={() => { const a = PIN_AREAS.find((x) => x.name === area); set((s) => ({ draft: { ...s.draft, location: a?.id ?? null } })); go('service') }}
          />
        )}
        {step === 'search' && <SearchStep go={go} onBack={() => (params.get('step') ? navigate(-1) : go('locate'))} onPick={(id) => { set((s) => ({ draft: { ...s.draft, location: id } })); go('service') }} />}
        {step === 'service' && <ServiceStep go={go} onClose={() => navigate('/home', { replace: true })} onPay={pay} />}
        {step === 'addons' && <AddonsStep go={go} onPay={pay} />}
        {step === 'schedule' && <ScheduleStep go={go} onDone={(when) => { set((s) => ({ draft: { ...s.draft, when } })); go('search') }} />}
      </DockSheet>
      {/* Bottom sheet / Geolocation settings — demo toggle "Location services off" */}
      <Sheet open={geoOpen} onClose={() => setGeoDismissed(true)}>
        <div className="flex flex-col gap-3 px-6 py-4 text-center">
          <h2 className="text-2xl font-bold leading-[1.3]">Turn on location services</h2>
          <p className="text-left text-sm leading-[1.5] opacity-70 text-pretty">Go to Settings &gt; Privacy &amp; Security &gt; Location Services and turn it on. This lets us find your car and show car wash services near you.</p>
        </div>
        <div className="h-px bg-line" />
        <div className="px-6 pt-4" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
          <Button variant="secondary" onClick={() => { set({ locationOff: false }); setGeoDismissed(true) }}>Go to Settings</Button>
        </div>
      </Sheet>
      <ConfirmSheet open={failed} onClose={() => setFailed(false)} image={illCard} title="Payment didn't go through" body="Your bank declined the charge. Try again, or use a different card.">
        <Button onClick={() => { set({ failPayment: false }); setFailed(false); setTimeout(pay, 250) }}>Try again</Button>
        <Button variant="tertiary" onClick={() => navigate('/payments?from=booking')}>Change payment method</Button>
      </ConfirmSheet>
    </div>
  )
}

/* ---------- Booking 1.6 — Car wash details ---------- */
export function BookingDetails() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  return (
    <Screen bg="bg-bg-2">
      <div className="bg-bg-2"><StatusBar /><Header title="Car wash details" /></div>
      <Scroll className="px-6 pt-7">
        <div className="flex flex-col gap-6 pb-6">
          {SERVICES.map((s) => {
            const sel = state.draft.service === s.id
            return (
              <button
                key={s.id}
                onClick={() => set((st) => ({ draft: { ...st.draft, service: s.id } }))}
                className={cx('flex flex-col gap-4 rounded-lg bg-bg p-4 text-left transition-shadow duration-150', sel ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]')}
              >
                <div className="flex items-center gap-1">
                  <img src={s.icon} alt="" width={34} height={34} className="size-[34px] object-contain" />
                  <span className="flex-1 text-lg font-bold">{s.detailName}</span>
                  {s.price !== null && <span className="flex items-end gap-1 leading-none"><span className="pb-0.5 text-sm">QAR</span><span className="tabular text-4xl font-bold tracking-[-0.03em]" style={{ lineHeight: 0.8 }}>{s.price}</span></span>}
                </div>
                <p className="flex items-center gap-2 text-sm leading-none"><Timer size={16} strokeWidth={2} />{s.duration}</p>
                <div className="flex flex-col gap-1">{s.detailFeatures.map((f) => <FeatureLine key={f} muted>{f}</FeatureLine>)}</div>
                {s.id === 'custom' && (
                  <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                    <p className="border-b border-line pb-4 text-sm">Choose add-ons</p>
                    <AddonGrid compact />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="sticky bottom-0 -mx-6 bg-bg-2 px-6 pt-2">
          <PayBlock onPay={() => navigate('/book?step=service', { replace: true })} />
        </div>
      </Scroll>
    </Screen>
  )
}

/* ---------- Booking 2.0 — Payment on hold, finding washer ---------- */
function PulsingLogo() {
  const reduce = useReducedMotion()
  return (
    <motion.div animate={reduce ? undefined : { scale: [1, 1.04, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
      <ThemedImg light={logo} dark={logoWhite} alt="ONGO" width={134} height={132} />
    </motion.div>
  )
}

export function BookingConfirm() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const b = state.booking
  const until = new Date((b?.createdAt ?? Date.now()) + 5 * 60e3).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  useTimeout(() => {
    if (!state.booking) return
    if (state.noWasher) { navigate('/book/no-washer', { replace: true }); return }
    set((s) => ({ booking: s.booking ? { ...s.booking, status: 'active', stage: 1 } : null }))
    navigate('/bookings', { replace: true })
  }, 5000, [])

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6">
        <PulsingLogo />
        <h1 className="text-center text-[22px] font-bold leading-[1.3] text-balance">Payment on hold. Finding the best available washer for you.</h1>
        <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-line p-4">
          <p className="text-[13px] text-muted-2">Free cancellation until {until}</p>
          <Button variant="danger" size="md" onClick={() => navigate('/book/cancel')}>Cancel booking</Button>
        </div>
      </div>
    </Screen>
  )
}

/* ---------- No washer available ---------- */
export function NoWasher() {
  const navigate = useNavigate()
  const { set } = useStore()
  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6">
        <ThemedImg light={logo} dark={logoWhite} alt="ONGO" width={134} height={132} />
        <h1 className="text-center text-[22px] font-bold leading-[1.3] text-balance">No washers are available nearby right now.</h1>
        <div className="flex w-full flex-col gap-3 rounded-lg border border-line p-4">
          <p className="text-sm text-muted-2">Your payment hold was released. You were not charged.</p>
          <Button size="md" onClick={() => { set((s) => ({ noWasher: false, booking: s.booking ?? { id: uid(), service: s.draft.service, addons: [], location: 'seaside', when: null, stage: 0, status: 'searching', createdAt: Date.now() } })); navigate('/book/confirm', { replace: true }) }}>Try again</Button>
          <Button variant="tertiary" size="md" onClick={() => { set({ booking: null, noWasher: false }); navigate('/book?step=schedule', { replace: true }) }}>Choose another time</Button>
        </div>
      </div>
    </Screen>
  )
}

/* ---------- Booking 2.1 — Cancel reason ---------- */
export function CancelReason() {
  const navigate = useNavigate()
  const [sel, setSel] = useState(0)
  return (
    <Screen>
      <StatusBar />
      <div className="px-6 pt-12 pb-3"><h1 className="max-w-[280px] text-[28px] font-bold leading-[1.3]">Why would you like to cancel?</h1></div>
      <Scroll className="flex flex-col gap-3 p-4">
        {CANCEL_REASONS.map((r, i) => (
          <button
            key={r}
            onClick={() => setSel(i)}
            aria-pressed={sel === i}
            className={cx('flex h-[60px] w-full items-center justify-between gap-3 rounded-sm bg-bg px-4 text-left text-lg transition-shadow duration-150', sel === i ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-line)]')}
          >
            {r}
            <span className="relative flex size-6 items-center justify-center">
              <Circle size={24} strokeWidth={1.75} />
              {sel === i && <motion.span layoutId="reason-dot" className="absolute size-[15px] rounded-full bg-brand ring-[3px] ring-ink" transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }} />}
            </span>
          </button>
        ))}
      </Scroll>
      <Footer className="flex flex-col items-center gap-4 pt-7">
        <Button variant="danger" size="md" onClick={() => navigate('/book/cancelling', { replace: true })}>Submit and cancel booking</Button>
        <button onClick={() => navigate(-1)} className="py-1 text-sm font-semibold">Keep my booking</button>
      </Footer>
    </Screen>
  )
}

/* ---------- Cancel — Cancelling… ---------- */
export function Cancelling() {
  const navigate = useNavigate()
  const { set } = useStore()
  useTimeout(() => { set({ booking: null }); navigate('/home', { replace: true }) }, 1600)
  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-7">
        <PulsingLogo />
        <p className="text-[22px] font-medium">Cancelling…</p>
      </div>
    </Screen>
  )
}
