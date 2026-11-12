import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { RefreshCcw } from 'lucide-react'
import { useStore, uid } from '../lib/store'
import { FEEDBACK_TAGS, TIMELINE, serviceById } from '../lib/data'
import { BottomNav, Button, EmptyState, Field, Screen, Scroll, StatusBar, Tabs, cx, inputBox } from '../components/ui'

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
function Timeline({ stage }: { stage: number }) {
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
                {e.time && <span className="tabular text-xs text-muted">{e.time}</span>}
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

  const until = new Date((b?.createdAt ?? Date.now()) + 5 * 60e3).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Bookings" />
      <BookingTabs value="current" />
      {!b || b.status === 'searching' ? (
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
                {finished ? 'Car wash finished' : stageTitle(b.stage)}
              </motion.h2>
            </AnimatePresence>
            <div className="flex flex-col gap-3 rounded-lg border border-line p-3">
              <WasherHead />
              <Button size="md" onClick={() => window.open('tel:+97400000000')}>Contact</Button>
              {finished ? (
                <>
                  <Button size="md" onClick={() => navigate('/rate')}>Wash complete</Button>
                  <p className="text-center text-[13px] text-muted-2">Check your car to confirm it's clean</p>
                </>
              ) : (
                <>
                  <Button variant="danger" size="md" disabled={b.stage >= 4} onClick={() => navigate('/book/cancel')}>Cancel booking</Button>
                  <p className="text-center text-[13px] text-muted-2">{b.stage >= 4 ? 'Cancellation is closed once the wash starts' : `Free cancellation until ${until}`}</p>
                </>
              )}
            </div>
            <Timeline stage={b.stage} />
          </div>
        </Scroll>
      )}
      <BottomNav />
    </Screen>
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
        <EmptyState image={illCar} title="No recent bookings" body="Once you book a car wash, it will appear here. You can track its status and view past washes anytime.">
          <Button onClick={() => navigate('/book')}>Book a wash</Button>
        </EmptyState>
      ) : (
        <Scroll>
          <div className="flex flex-col gap-3 px-6 py-7">
            {state.recent.map((r, i) => {
              const s = serviceById(r.service)
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => { set((st) => ({ draft: { ...st.draft, service: r.service } })); navigate('/book?step=service') }}
                  className="flex min-h-20 w-full items-center gap-2 rounded-lg bg-bg py-3 pl-2 pr-4 text-left shadow-[inset_0_0_0_1px_var(--color-line)] transition-transform active:scale-[0.985]"
                >
                  <img src={s.icon} alt="" width={56} height={56} className="size-14 object-contain" />
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-bold leading-none">{s.listName}</span>
                    <span className="text-sm leading-snug text-muted">{r.when && r.car ? `${r.when} · ${r.car}` : s.duration}</span>
                  </span>
                  <span className="text-sm">{s.price} QAR</span>
                  <RefreshCcw size={22} strokeWidth={1.75} aria-label="Book again" className="ml-2" />
                </motion.button>
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
  const [stars, setStars] = useState(4)
  const [tags, setTags] = useState<string[]>(['Spotless', 'On time'])
  const finish = () => {
    set((s) => ({ recent: s.booking ? [{ id: uid(), service: s.booking.service }, ...s.recent] : s.recent, booking: null }))
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
            <p className="text-sm text-muted">What went well?</p>
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
            <Button size="md" onClick={() => { finish(); navigate('/rate/thanks', { replace: true }) }}>Submit rating</Button>
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
  return (
    <Screen>
      <StatusBar tall />
      <TitleHeader title="Feedback" />
      <EmptyState image={illThumbs} title="Thanks for rating Mike!" body="Your feedback was shared. We use every rating to keep washes spotless and on time.">
        <Button onClick={() => navigate('/book?step=search', { replace: true })}>Book again</Button>
        <Button variant="tertiary" onClick={() => navigate('/home', { replace: true })}>Back to home</Button>
      </EmptyState>
      <BottomNav />
    </Screen>
  )
}
