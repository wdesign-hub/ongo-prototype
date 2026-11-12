import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { CalendarClock, CarFront, ChevronRight, CircleCheck, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { useStore, uid } from '../lib/store'
import { clock, placeById, quote, serviceById, type QuoteLine } from '../lib/data'
import { Badge, Button, EmptyState, Footer, Header, InfoCard, Screen, Scroll, StatusBar, cx, inputBox } from '../components/ui'
import { CarTypeSheet, ConfirmSheet, carSummary } from '../components/Sheets'

import mastercard from '../assets/icons/mastercard.svg'
import visaSm from '../assets/icons/visa.svg'
import applePay from '../assets/icons/applepay-lg.svg'
import illCard from '../assets/img/ill-card.png'
import illCalendar from '../assets/img/ill-calendar.png'
import illThumbs from '../assets/img/ill-thumbs.png'

const brandSm = { visa: visaSm, mastercard, applepay: applePay }

/* Grouped card section, same pattern as Profile / App settings */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-bold leading-none">{title}</h2>
      <div className="flex flex-col overflow-hidden rounded-lg bg-bg">{children}</div>
    </section>
  )
}

function DetailRow({ icon, title, sub, action, onClick }: { icon: ReactNode; title: ReactNode; sub?: ReactNode; action?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={cx('flex min-h-14 w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0', onClick && 'transition-colors active:bg-ink/[0.03]')}>
      <span className="flex shrink-0 text-ink">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold">{title}</span>
        {sub && <span className="truncate text-sm text-muted">{sub}</span>}
      </span>
      {action && <span className="shrink-0 text-sm font-semibold underline underline-offset-2">{action}</span>}
    </Tag>
  )
}

function PriceLines({ lines, total, label = 'Total' }: { lines: QuoteLine[]; total: number; label?: string }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {lines.map((l) => (
        <div key={l.label} className="flex items-start justify-between gap-3 text-sm">
          <span className="flex flex-col gap-0.5"><span>{l.label}</span>{l.sub && <span className="text-xs text-muted">{l.sub}</span>}</span>
          <span className="tabular">{l.amount} QAR</span>
        </div>
      ))}
      <div className="h-px bg-line" />
      <div className="flex items-baseline justify-between">
        <span className="font-bold">{label}</span>
        <span className="tabular text-xl font-bold">{total} QAR</span>
      </div>
    </div>
  )
}

/* ---------- Review and pay (checkout) ---------- */
export function Review() {
  const navigate = useNavigate()
  const { state, set, primaryCar } = useStore()
  const d = state.draft
  const place = placeById(d.location)
  const q = quote(d.service, d.addons, primaryCar?.type)
  const card = state.payments.find((p) => p.id === state.primaryPaymentId) ?? state.payments[0]
  const [notes, setNotes] = useState(d.notes ?? '')
  const [carOpen, setCarOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const [paying, setPaying] = useState(false)
  const [until] = useState(() => clock(Date.now() + 5 * 60e3))

  const pay = (allowFail: boolean) => {
    if (allowFail && state.failPayment) { setFailed(true); return }
    setPaying(true)
    setTimeout(() => {
      set({
        draft: { ...d, notes },
        booking: { id: uid(), service: d.service, addons: d.service === 'custom' ? d.addons : [], location: d.location ?? 'seaside', when: d.when, stage: 0, status: d.when ? 'scheduled' : 'searching', createdAt: Date.now(), total: q.total, carId: primaryCar?.id ?? null, paymentId: card?.id ?? null, notes },
      })
      navigate(d.when ? '/book/scheduled' : '/book/confirm', { replace: true })
    }, 700)
  }

  return (
    <Screen bg="bg-bg-2">
      <div className="bg-bg"><StatusBar /><Header title="Review and pay" /></div>
      <Scroll>
        <div className="flex flex-col gap-6 px-5 pb-8 pt-7">
          <Section title="Your wash">
            <DetailRow icon={<CarFront size={18} strokeWidth={2} />} title={primaryCar?.name ?? 'Add a vehicle'} sub={primaryCar ? `${carSummary(primaryCar)} · Q ${primaryCar.plate}` : undefined} action={state.cars.length > 1 ? 'Change' : undefined} onClick={() => (state.cars.length ? state.cars.length > 1 && setCarOpen(true) : navigate('/garage/new'))} />
            <DetailRow icon={<MapPin size={18} strokeWidth={2} />} title={place?.name ?? 'Add your car’s location'} sub={place?.address} action={place ? 'Change' : 'Add'} onClick={() => navigate('/book?step=search')} />
            <DetailRow icon={d.when ? <CalendarClock size={18} strokeWidth={2} /> : <Clock size={18} strokeWidth={2} />} title={d.when ?? 'Now'} sub={d.when ? 'Washer assigned 30 min before' : 'Washer arrives in 15–30 min'} action="Change" onClick={() => navigate('/book?step=schedule')} />
            <label className="flex flex-col gap-2 px-4 py-3">
              <span className="text-sm text-muted">Parking notes (optional)</span>
              <span className={inputBox}><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Basement B2, spot 14" className="w-full bg-transparent outline-none placeholder:text-muted" /></span>
            </label>
          </Section>

          <Section title="Price">
            <PriceLines lines={q.lines} total={q.total} />
          </Section>

          <Section title="Payment">
            {card ? (
              <DetailRow icon={<img src={brandSm[card.brand]} alt="" width={34} height={24} className="h-6 w-[34px] object-contain" />} title={`${card.label}${card.last4 ? ` •••• ${card.last4}` : ''}`} sub={state.primaryPaymentId === card.id ? 'Primary' : undefined} action="Change" onClick={() => navigate('/payments?from=booking')} />
            ) : (
              <DetailRow icon={<ChevronRight size={18} strokeWidth={2} />} title="Add a payment method" sub="Card or Apple Pay" action="Add" onClick={() => navigate('/payments/add?from=booking')} />
            )}
          </Section>

          <InfoCard tone="info" icon={<ShieldCheck size={16} strokeWidth={2} className="text-success" />} title="You’re charged after the wash">
            We hold {q.total} QAR on your card now and only charge it once the wash is done. Free cancellation until {d.when ? '1 hour before your wash' : until}.
          </InfoCard>
        </div>
      </Scroll>
      <Footer className="bg-bg">
        <Button className="font-bold" disabled={!place || !primaryCar || paying} onClick={() => (card ? pay(true) : navigate('/payments/add?from=booking'))}>
          {paying ? 'Processing…' : card ? `Pay ${q.total} QAR` : 'Add payment method'}
        </Button>
      </Footer>

      <CarTypeSheet open={carOpen} cars={state.cars} value={primaryCar?.id ?? null} onClose={() => setCarOpen(false)} onSave={(id) => { setCarOpen(false); set({ primaryCarId: id }) }} />
      <ConfirmSheet open={failed} onClose={() => setFailed(false)} image={illCard} title="Payment didn’t go through" body="Your bank declined the charge. Try again, or use a different card.">
        <Button onClick={() => { set({ failPayment: false }); setFailed(false); pay(false) }}>Try again</Button>
        <Button variant="tertiary" onClick={() => { setFailed(false); navigate('/payments?from=booking') }}>Change payment method</Button>
      </ConfirmSheet>
    </Screen>
  )
}

/* ---------- Scheduled booking confirmation ---------- */
export function Scheduled() {
  const navigate = useNavigate()
  const { state } = useStore()
  const b = state.booking
  const place = placeById(b?.location)
  return (
    <Screen>
      <StatusBar />
      <EmptyState image={illCalendar} title="Your wash is booked" body={b ? `${b.when}${place ? ` at ${place.name}` : ''}. We’ll assign your washer 30 minutes before and send you an update.` : 'Your booking is confirmed.'}>
        {b?.total != null && <p className="text-sm text-muted">{b.total} QAR is on hold. You’re only charged after the wash.</p>}
        <Button onClick={() => navigate('/bookings', { replace: true })}>View booking</Button>
        <Button variant="tertiary" onClick={() => navigate('/home', { replace: true })}>Back to home</Button>
      </EmptyState>
    </Screen>
  )
}

/* ---------- Cancellation result ---------- */
export function Cancelled() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { total?: number } | null }
  const total = state?.total
  return (
    <Screen>
      <StatusBar />
      <EmptyState image={illCard} title="Booking cancelled" body={total != null ? `Your ${total} QAR hold was released. You weren’t charged. Your bank may take up to 5 working days to remove it from your statement.` : "You weren’t charged."}>
        <Button onClick={() => navigate('/book?step=search', { replace: true })}>Book again</Button>
        <Button variant="tertiary" onClick={() => navigate('/home', { replace: true })}>Back to home</Button>
      </EmptyState>
    </Screen>
  )
}

/* ---------- Receipt (Recent bookings → booking detail) ---------- */
export function Receipt() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, set } = useStore()
  const r = state.recent.find((x) => x.id === id)
  if (!r) return <Screen><StatusBar /><Header title="Receipt" /><EmptyState image={illThumbs} title="Receipt not found" body="This booking is no longer available." /></Screen>
  const q = quote(r.service, r.addons ?? [], r.carType)
  const total = r.total ?? q.total
  return (
    <Screen bg="bg-bg-2">
      <div className="bg-bg"><StatusBar /><Header title="Receipt" /></div>
      <Scroll>
        <div className="flex flex-col gap-6 px-5 pb-8 pt-7">
          <motion.div className="flex flex-col items-center gap-2 rounded-lg bg-bg px-4 py-6 text-center" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Badge>Paid</Badge>
            <p className="tabular text-4xl font-bold tracking-[-0.03em]">{total} QAR</p>
            <p className="text-sm text-muted">{serviceById(r.service).listName} wash{r.when ? ` · ${r.when}` : ''}</p>
          </motion.div>
          <Section title="Details">
            <DetailRow icon={<CarFront size={18} strokeWidth={2} />} title={r.car ?? 'Your car'} sub={r.carType} />
            <DetailRow icon={<MapPin size={18} strokeWidth={2} />} title={r.location ?? 'Seaside Promenade'} />
            <DetailRow icon={<CircleCheck size={18} strokeWidth={2} />} title="Mike M. · Oryx Car Wash" sub="Washer" />
          </Section>
          <Section title="Price">
            <PriceLines lines={q.lines} total={total} label="Total paid" />
          </Section>
          <Section title="Payment">
            <DetailRow icon={<img src={mastercard} alt="" width={34} height={24} />} title={r.payment ?? 'Mastercard •••• 2210'} sub={r.when ? `Paid ${r.when}` : 'Paid'} />
          </Section>
        </div>
      </Scroll>
      <Footer className="bg-bg">
        <Button className="font-bold" onClick={() => { set((s) => ({ draft: { ...s.draft, service: r.service, addons: r.addons ?? [], when: null } })); navigate('/book?step=search') }}>Book again</Button>
      </Footer>
    </Screen>
  )
}
