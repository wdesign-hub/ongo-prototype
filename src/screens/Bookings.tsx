import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { CalendarClock, MapPin, MessageSquare, Phone, RefreshCcw } from 'lucide-react'
import { useStore, uid } from '../lib/store'
import { FEEDBACK_TAGS, TIMELINE, clock, placeById, quote, serviceById } from '../lib/data'
import { Badge, BottomNav, Button, EmptyState, Field, Screen, Scroll, Sheet, StatusBar, Tabs, cx, inputBox } from '../components/ui'
import { carSummary } from '../components/Sheets'

import avatar from '../assets/img/avatar-washer.jpg'
import star from '../assets/icons/star.svg'
import illCar from '../assets/img/ill-car.png'
import illCalendar from '../assets/img/ill-calendar.png'
import illThumbs from '../assets/img/ill-thumbs.png'

function TitleHeader({ title }: { title: string }) {
  return (
    <div className="shrink-0 px-6 py-1"><div className="flex h-14 items-center justify-center"><h1 className="text-lg font-bold">{title}</h1></div></div>
  )
}

function BookingTabs({ value }: { value: 'current' | 'recent' }) {
  const navigate = useNavigate()
  return (
    <div className="shrink-0 px-6">
      <Tabs id="bookings" value={value} onChange={(v) => navigate(v === 'current' ? '/bookings' : '/bookings/recent', { replace: true })} items={[{ value: 'current', label: 'Current' }, { value: 'recent', label: 'Recent bookings' }]} />
    </div>
  )
}

function WasherHead() {
  return (
    <div className="flex items-center gap-3">
      <img src={avatar} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
      <div className="flex flex-col gap-2">
        <p className="font-bold leading-none">Meet Mike M.</p>
        <p className="text-sm leading-none text-muted">Oryx Car Wash Specialist</p>
      </div>
    </div>
  )
}

/* Vertical tracking timeline */
function Timeline({ stage, createdAt }: { stage: number; createdAt: number }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-4 py-3">
      {TIMELINE.map((e, i) => {
        const done = i < stage || stage >= 5
        const current = i === stage && stage < 5
        const last = i === TIMELINE.length - 1
        const isFinal = stage >= 5 && last
        return (
          <div key={e.title} className="relative flex min-h-[58px] gap-3 py-2">
            <div className="relative flex w-[22px] shrink-0 justify-center pt-0.5">
              {!last && (
                <span className="absolute left-1/2 top-[11px] h-[calc(100%+16px)] w-0.5 -translate-x-1/2 bg-bg-2">
                  <motion.span className="absolute inset-x-0 top-0 bg-ink" initial={false} animate={{ height: i < stage ? '100%' : '0%' }} transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }} />
                </span>
              )}
              <span className={cx('relative flex size-[18px] items-center justify-center rounded-full transition-colors duration-300', done || current ? 'bg-ink' : 'bg-bg-2')}>
                <AnimatePresence>
                  {(current || isFinal) && <motion.span className="size-2.5 rounded-full bg-brand" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', duration: 0.35, bounce: 0.4 }} />}
                </AnimatePresence>
                {current && <span className="absolute inset-0 animate-ping rounded-full bg-brand/50 motion-reduce:hidden" />}
              </span>
            </div>
            <div className={cx('flex flex-1 flex-col gap-1 transition-opacity duration-300', !done && !current && 'opacity-40')}>
              <div className="flex items-center justify-between gap-2">
                <p className={cx('text-[15px] leading-[1.4]', (current || isFinal) ? 'font-semibold' : '', !done && !current ? 'text-muted' : '')}>{e.title}</p>
                {(i < TIMELINE.length - 1 || stage >= 5) && <span className="tabular text-xs text-muted">{done ? '' : '~'}{clock(createdAt + e.at * 60e3)}</span>}
              </div>
              {e.sub && (done || current) && <p className="text-[13px] text-muted">{e.sub}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function BookingsCurrent() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const b = state.booking
  const finished = !!b && b.stage >= 5

  // Simulate live progress: advance one step every 3.5s while the screen is open.
  useEffect(() => {
    if (!b || b.status !== 'active' || b.stage >= 5) return
    const t = setTimeout(() => set((s) => ({ booking: s.booking ? { ...s.booking, stage: (s.booking.stage + 1) as typeof b.stage } : null })), 3500)
    return () => clearTimeout(t)
  }, [b, set])

  const until = clock((b?.createdAt ?? Date.now()) + 5 * 60e3)
  const [contact, setContact] = useState(false)

  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Bookings" />
      <BookingTabs value="current" />
      {b?.status === 'scheduled' ? (
        <Scroll><div className="px-6 pt-7"><UpcomingCard /></div></Scroll>
      ) : !b || b.status === 'searching' ? (
        b ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-[22px] font-bold">Finding your washer…</p>
            <Button variant="tertiary" size="md" onClick={() => navigate('/book/confirm')}>View booking</Button>
          </div>
        ) : (
          <EmptyState image={illCalendar} title="No active bookings" body="When you book a wash, you can follow your washer here in real time." note="Ready to get started?">
            <Button onClick={() => navigate('/book?step=search')}>Book a wash</Button>
          </EmptyState>
        )
      ) : (
        <Scroll>
          <div className="flex flex-col gap-4 px-6 pt-7 pb-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2 key={finished ? 'done' : 'way'} className="text-[28px] font-bold leading-none" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {finished ? 'Wash complete' : stageTitle(b.stage)}
              </motion.h2>
            </AnimatePresence>
            <div className="flex flex-col gap-3 rounded-lg border border-line p-3">
              <WasherHead />
              <Button size="md" onClick={() => setContact(true)}>Contact</Button>
              {finished ? (
                <>
                  <Button size="md" onClick={() => navigate('/rate')}>Confirm and rate</Button>
                  <p className="text-center text-[13px] text-muted-2">Check your car first. Mike will wait nearby for 10 minutes.</p>
                </>
              ) : (
                <>
                  <Button variant="danger" size="md" disabled={b.stage >= 4} onClick={() => navigate('/book/cancel')}>Cancel booking</Button>
                  <p className="text-center text-[13px] text-muted-2">{b.stage >= 4 ? 'Cancellation is closed once the wash starts' : `Free cancellation until ${until}`}</p>
                </>
              )}
            </div>
            <Timeline stage={b.stage} createdAt={b.createdAt} />
          </div>
        </Scroll>
      )}
      <BottomNav />
      {/* Contact washer */}
      <Sheet open={contact} onClose={() => setContact(false)}>
        <div className="flex flex-col gap-4 px-6 pb-2 pt-2">
          <WasherHead />
          <p className="text-sm text-muted">Calls and messages go through ONGO, so your number stays private. Mike can already see your parking notes.</p>
        </div>
        <div className="flex flex-col gap-3 px-6 pt-4" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
          <Button lead={<Phone size={18} strokeWidth={2} />} onClick={() => { window.open('tel:+97400000000'); setContact(false) }}>Call Mike</Button>
          <Button variant="secondary" lead={<MessageSquare size={18} strokeWidth={2} />} onClick={() => { window.open('sms:+97400000000'); setContact(false) }}>Message Mike</Button>
        </div>
      </Sheet>
    </Screen>
  )
}

/* Scheduled ("Wash later") booking, before a washer is assigned */
function UpcomingCard() {
  const navigate = useNavigate()
  const { state, primaryCar } = useStore()
  const b = state.booking!
  const place = placeById(b.location)
  const total = b.total ?? quote(b.service, b.addons, primaryCar?.type).total
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[28px] font-bold leading-none">Upcoming wash</h2>
      <div className="flex flex-col gap-4 rounded-lg border border-line p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold"><CalendarClock size={18} strokeWidth={2} />{b.when}</p>
          <Badge>Booked</Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="flex items-center gap-2"><MapPin size={16} strokeWidth={2} className="shrink-0" />{place?.name ?? 'Your location'}</p>
          <p className="text-muted">{serviceById(b.service).listName} wash · {primaryCar ? carSummary(primaryCar) : ''}</p>
          <p className="text-muted">{total} QAR on hold · charged after the wash</p>
        </div>
        <p className="rounded-md bg-bg-2 px-3 py-2 text-sm">We’ll assign your washer 30 minutes before. Free cancellation until 1 hour before your wash.</p>
        <Button variant="danger" size="md" onClick={() => navigate('/book/cancel')}>Cancel booking</Button>
      </div>
    </div>
  )
}

const stageTitle = (s: number) => (s <= 1 ? 'Washer assigned' : s === 2 ? 'Washer on the way' : s === 3 ? 'Washer has arrived' : 'Wash in progress')

export function BookingsRecent() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Bookings" />
      <BookingTabs value="recent" />
      {state.recent.length === 0 ? (
        <EmptyState image={illCar} title="No recent bookings" body="Finished washes and their receipts will show up here.">
          <Button onClick={() => navigate('/book')}>Book a wash</Button>
        </EmptyState>
      ) : (
        <Scroll>
          <div className="flex flex-col gap-3 px-6 py-7">
            {state.recent.map((r, i) => {
              const s = serviceById(r.service)
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="relative flex min-h-20 w-full items-center rounded-lg bg-bg shadow-[inset_0_0_0_1px_var(--color-line)]"
                >
                  <button onClick={() => navigate(`/receipt/${r.id}`)} className="flex min-w-0 flex-1 items-center gap-2 py-3 pl-2 pr-1 text-left transition-transform active:scale-[0.985]">
                    <img src={s.icon} alt="" width={56} height={56} className="size-14 object-contain" />
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="font-bold leading-none">{s.listName}</span>
                      <span className="text-sm leading-snug text-muted">{r.when && r.car ? `${r.when} · ${r.car}` : s.duration}</span>
                    </span>
                    <span className="tabular text-sm">{r.total ?? s.price} QAR</span>
                  </button>
                  <button aria-label={`Book ${s.listName} again`} onClick={() => { set((st) => ({ draft: { ...st.draft, service: r.service, addons: r.addons ?? [], when: null } })); navigate('/book?step=search') }} className="flex size-11 shrink-0 items-center justify-center mr-2">
                    <RefreshCcw size={22} strokeWidth={1.75} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </Scroll>
      )}
      <BottomNav />
    </Screen>
  )
}

/* Rate your wash */
export function Rate() {
  const navigate = useNavigate()
  const { set } = useStore()
  const [stars, setStars] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const { primaryCar } = useStore()
  // Move the finished booking into history with everything the receipt needs
  const finish = () => {
    const id = uid()
    set((s) => {
      const b = s.booking
      if (!b) return {}
      const car = s.cars.find((c) => c.id === b.carId) ?? primaryCar
      const pay = s.payments.find((p) => p.id === b.paymentId) ?? s.payments[0]
      return {
        booking: null,
        recent: [{
          id, service: b.service, addons: b.addons, total: b.total ?? quote(b.service, b.addons, car?.type).total,
          when: `Today, ${clock(Date.now())}`, car: car?.name, carType: car ? carSummary(car) : undefined,
          location: placeById(b.location)?.name, payment: pay ? `${pay.label}${pay.last4 ? ` •••• ${pay.last4}` : ''}` : undefined,
        }, ...s.recent],
      }
    })
    return id
  }
  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Rate your wash" />
      <Scroll>
        <div className="flex flex-col gap-4 px-6 pt-7 pb-6">
          <h2 className="text-[28px] font-bold leading-none">How was your wash?</h2>
          <div className="flex flex-col gap-3 rounded-lg border border-line p-3">
            <WasherHead />
            <div className="flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setStars(n)} whileTap={{ scale: 0.85 }} className="size-9">
                  <img src={star} alt="" width={36} height={36} className={cx('transition-[filter,opacity] duration-200', n > stars && 'opacity-60 grayscale brightness-[1.9]')} />
                </motion.button>
              ))}
            </div>
            <p className="text-sm text-muted">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((t) => {
                const on = tags.includes(t)
                return (
                  <button key={t} onClick={() => setTags((x) => (on ? x.filter((y) => y !== t) : [...x, t]))} aria-pressed={on} className={cx('h-[27px] rounded-full border px-3.5 text-xs transition-colors duration-150', on ? 'border-brand-border bg-success-subtle' : 'border-line bg-bg')}>
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="pt-6 pb-3">
              <Field label="Add a comment (optional)">
                <span className={inputBox}><input placeholder="Tell us more about your wash…" className="w-full bg-transparent outline-none placeholder:text-muted" /></span>
              </Field>
            </div>
            <Button size="md" disabled={!stars} onClick={() => { const id = finish(); navigate('/rate/thanks', { replace: true, state: { receipt: id } }) }}>{stars ? 'Submit rating' : 'Tap a star to rate'}</Button>
            <Button size="md" variant="tertiary" onClick={() => { finish(); navigate('/home', { replace: true }) }}>Skip</Button>
            <p className="text-center text-[13px] leading-[1.5] text-muted-2">Your feedback is shared with Mike and helps us keep every wash spotless.</p>
          </div>
        </div>
      </Scroll>
    </Screen>
  )
}

export function Thanks() {
  const navigate = useNavigate()
  const receipt = (useLocation().state as { receipt?: string } | null)?.receipt
  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Feedback" />
      <EmptyState image={illThumbs} title="Thanks for rating Mike!" body="Your feedback was shared. We use every rating to keep washes spotless and on time.">
        <Button onClick={() => navigate('/book?step=search', { replace: true })}>Book again</Button>
        {receipt && <Button variant="secondary" onClick={() => navigate(`/receipt/${receipt}`)}>View receipt</Button>}
        <Button variant="tertiary" onClick={() => navigate('/home', { replace: true })}>Back to home</Button>
      </EmptyState>
      <BottomNav />
    </Screen>
  )
}
