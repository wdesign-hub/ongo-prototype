import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Bell, ChevronRight, CircleCheck, Cog, CreditCard, LogOut, MailOpen, MapPin, Phone, Plus, ShieldCheck, ShieldQuestion, UserX } from 'lucide-react'
import { useStore, uid } from '../lib/store'
import { NOTIFICATIONS } from '../lib/data'
import { Badge, BottomNav, Button, EmptyState, Field, Footer, Header, InfoCard, OptionCard, RowButton, Screen, Scroll, SectionLabel, StatusBar, Toast, cx, inputBox } from '../components/ui'
import { ConfirmSheet } from '../components/Sheets'
import { CarForm } from './Onboarding'

import avatarUser from '../assets/img/avatar-user.jpg'
import symbol from '../assets/icons/ongo-symbol.svg'
import mcLg from '../assets/icons/mastercard-lg.svg'
import visaLg from '../assets/icons/visa-lg.svg'
import appleLg from '../assets/icons/applepay-lg.svg'
import visaSm from '../assets/icons/visa.svg'
import mcSm from '../assets/icons/mastercard.svg'
import illCar from '../assets/img/ill-car.png'
import illBell from '../assets/img/ill-bell.png'
import illCard from '../assets/img/ill-card.png'

const TitleBar = ({ title }: { title: string }) => (
  <div className="shrink-0 bg-white px-6 py-1"><div className="flex h-14 items-center justify-center"><h1 className="text-lg font-bold">{title}</h1></div></div>
)

/* ---------- Garage ---------- */
export function Garage() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  return (
    <Screen bg="bg-bg-2">
      <div className="bg-white"><StatusBar tall /><TitleBar title="Garage" /></div>
      {state.cars.length === 0 ? (
        <EmptyState image={illCar} title="No vehicles yet" body="Add your car once and we'll price every wash for its size." note="Takes less than a minute.">
          <Button onClick={() => navigate('/garage/new')}>Add a vehicle</Button>
        </EmptyState>
      ) : (
        <Scroll>
          <div className="flex flex-col gap-3 px-5 pt-7">
            {state.cars.map((c) => (
              <OptionCard
                key={c.id}
                selected={c.id === state.primaryCarId}
                onClick={() => { set({ primaryCarId: c.id }); navigate(`/garage/${c.id}`) }}
                title={c.name}
                sub={`${c.type.startsWith('SUV') ? 'SUV' : c.type} · ${c.type.includes('7') ? 7 : 5} seats · ${c.color}`}
              />
            ))}
          </div>
          <div className="px-6 py-6">
            <Button variant="secondary" lead={<Plus size={20} strokeWidth={2} />} className="font-semibold" onClick={() => navigate('/garage/new')}>Add a vehicle</Button>
          </div>
        </Scroll>
      )}
      <BottomNav />
    </Screen>
  )
}

export function GarageEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, set } = useStore()
  const car = state.cars.find((c) => c.id === id)
  return (
    <CarForm
      title={car ? 'Car information' : 'Add your car details'}
      cta="Save"
      initial={car}
      onSubmit={(v) => {
        if (car) set((s) => ({ cars: s.cars.map((c) => (c.id === car.id ? { ...c, ...v } : c)) }))
        else { const nid = uid(); set((s) => ({ cars: [...s.cars, { id: nid, ...v }], primaryCarId: s.primaryCarId ?? nid })) }
        navigate(-1)
      }}
    />
  )
}

/* ---------- Profile ---------- */
export function Profile() {
  const navigate = useNavigate()
  const { state, set, primaryCar } = useStore()
  const [sheet, setSheet] = useState<null | 'logout' | 'delete'>(null)
  return (
    <Screen bg="bg-bg-2">
      <StatusBar />
      <Scroll>
        <div className="flex flex-col gap-6 px-5 pb-12">
          <button onClick={() => navigate('/profile/edit')} className="flex h-24 items-center gap-2 overflow-hidden rounded-lg bg-white p-4 text-left transition-colors active:bg-[#fafafa]">
            <img src={avatarUser} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
            <span className="flex-1 pl-1 font-bold text-muted">{state.user.name}</span>
            <ChevronRight size={16} strokeWidth={2.25} />
          </button>

          <section className="flex flex-col gap-3">
            <SectionLabel>Payment and settings</SectionLabel>
            <div className="overflow-hidden rounded-lg">
              <RowButton icon={<Cog size={16} strokeWidth={2} />} label="App Settings" onClick={() => navigate('/settings')} />
              <RowButton icon={<Bell size={16} strokeWidth={2} />} label="Notifications" onClick={() => navigate('/notifications')} />
              <RowButton icon={<CreditCard size={16} strokeWidth={2} />} label="Payment Methods" onClick={() => navigate('/payments')} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>My garage</SectionLabel>
            <button onClick={() => navigate('/garage')} className="flex items-center gap-2 rounded-md bg-white p-3 pl-3 text-left">
              {primaryCar ? (
                <span className="flex flex-1 flex-col gap-3">
                  <span className="flex items-center gap-2 text-xs text-muted">{primaryCar.type.startsWith('SUV') ? 'SUV' : primaryCar.type}<Badge tone="brand">Primary</Badge></span>
                  <span className="text-sm">{primaryCar.color} · QA{primaryCar.plate}</span>
                </span>
              ) : <span className="flex-1 py-2 text-sm text-muted">No vehicles yet</span>}
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>Locations</SectionLabel>
            <div className="flex flex-col gap-3 rounded-md bg-white p-3">
              <span className="text-xs text-muted">Home</span>
              <span className="text-sm leading-[1.5]">Building 12, Al Waab Street<br />Doha, Qatar 000000</span>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>Account actions</SectionLabel>
            <div className="overflow-hidden rounded-lg">
              <RowButton icon={<LogOut size={16} strokeWidth={2} />} label="Log out" onClick={() => setSheet('logout')} />
              <RowButton icon={<UserX size={16} strokeWidth={2} />} label="Delete account" onClick={() => setSheet('delete')} />
            </div>
          </section>
        </div>
      </Scroll>
      <BottomNav />

      <ConfirmSheet open={sheet === 'logout'} onClose={() => setSheet(null)} title="Log out of ONGO?" body="You'll need your phone number and a code to sign back in.">
        <Button onClick={() => { set({ onboarded: false, booking: null }); navigate('/auth', { replace: true }) }}>Log out</Button>
        <Button variant="tertiary" onClick={() => setSheet(null)}>Cancel</Button>
      </ConfirmSheet>
      <ConfirmSheet open={sheet === 'delete'} onClose={() => setSheet(null)} title="Delete your account?" body="This permanently removes your profile, saved cars, payment methods and booking history. This cannot be undone.">
        <Button variant="danger" onClick={() => { set({ onboarded: false, booking: null, cars: [], payments: [], recent: [] }); navigate('/auth', { replace: true }) }}>Delete account</Button>
        <Button variant="tertiary" onClick={() => setSheet(null)}>Keep my account</Button>
      </ConfirmSheet>
    </Screen>
  )
}

export function ProfileEdit() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const [name, setName] = useState(state.user.name)
  const [email, setEmail] = useState(state.user.email)
  const [saved, setSaved] = useState(false)
  return (
    <Screen>
      <StatusBar />
      <Header title="Edit information" />
      <Scroll>
        <div className="flex flex-col gap-6 px-6 pt-7">
          <Field label="Name">
            <span className={inputBox}><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none" /></span>
          </Field>
          <div className="flex flex-col gap-3">
            <SectionLabel>Profile and account</SectionLabel>
            <label className={cx(inputBox, 'justify-between')}>
              <span className="flex items-center gap-2 text-sm text-muted"><MailOpen size={16} strokeWidth={2} className="text-ink" />Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent text-right outline-none" />
            </label>
            <div className={cx(inputBox, 'justify-between')}>
              <span className="flex items-center gap-2 text-sm text-muted"><Phone size={16} strokeWidth={2} className="text-ink" />Mobile number</span>
              <span>{state.user.country} {state.user.phone}</span>
            </div>
          </div>
        </div>
      </Scroll>
      <Footer>
        <Button className="font-bold" onClick={() => { set((s) => ({ user: { ...s.user, name, email } })); setSaved(true); setTimeout(() => navigate('/profile', { replace: true }), 1600) }}>Save changes</Button>
      </Footer>
      <Toast show={saved} icon={<CircleCheck size={16} strokeWidth={2} className="text-success" />}>Profile updated</Toast>
    </Screen>
  )
}

/* ---------- App settings ---------- */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx('relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200', on ? 'bg-brand' : 'bg-line')}>
      <motion.span className="absolute top-[3px] size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]" animate={{ left: on ? 19 : 3 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }} />
    </button>
  )
}

export function Settings() {
  const { state, set } = useStore()
  const s = state.settings
  return (
    <Screen>
      <StatusBar />
      <Header title="App Settings" />
      <div className="flex flex-col gap-4 px-5 pt-7">
        <div className="flex flex-col gap-4 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between text-sm">Push notifications<Toggle label="Push notifications" on={s.push} onChange={(v) => set({ settings: { ...s, push: v } })} /></div>
          <div className="h-px bg-line/60" />
          <div className="flex items-center justify-between text-sm">Biometric lock<Toggle label="Biometric lock" on={s.biometric} onChange={(v) => set({ settings: { ...s, biometric: v } })} /></div>
        </div>
        <div className="flex flex-col gap-2.5 rounded-lg border border-line px-3 py-4 text-sm">
          <button className="text-left">Terms &amp; privacy</button>
          <div className="h-px bg-line/60" />
          <p className="flex items-center gap-2.5">App version <span className="text-[13px] text-muted-2">1.4.2</span></p>
        </div>
      </div>
    </Screen>
  )
}

/* ---------- Notifications ---------- */
export function Notifications() {
  const { state } = useStore()
  return (
    <Screen>
      <StatusBar />
      <Header title="Notifications" />
      {!state.showNotifications ? (
        <EmptyState image={illBell} title="No notifications yet" body="Booking updates, washer arrivals and offers will show up here." />
      ) : (
        <Scroll className="px-6">
          {NOTIFICATIONS.map((n, i) => (
            <motion.div key={n.id} className="flex gap-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
              <span className="flex w-6 shrink-0 items-center">{n.icon === 'logo' ? <img src={symbol} alt="" width={24} height={24} /> : <MapPin size={24} strokeWidth={1.75} />}</span>
              <div className="flex flex-1 flex-col gap-3 border-b border-line py-6">
                <p className="flex items-center gap-2.5 text-sm font-bold">{n.title}{n.isNew && <Badge>New</Badge>}</p>
                <p className="text-sm leading-[1.5] opacity-60">{n.body}</p>
              </div>
            </motion.div>
          ))}
        </Scroll>
      )}
    </Screen>
  )
}

/* ---------- Payments ---------- */
const brandIcon = { mastercard: mcLg, visa: visaLg, applepay: appleLg }

export function Payments() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromBooking = params.get('from') === 'booking'
  const { state, set } = useStore()
  const list = state.payments
  return (
    <Screen>
      <StatusBar />
      <Header title="Payment Methods" icon={fromBooking ? 'close' : 'back'} />
      {list.length === 0 && !fromBooking ? (
        <EmptyState image={illCard} title="No payment methods yet" body="Add a card or Apple Pay to book and pay for washes in one tap." note="Card details are encrypted and stored securely.">
          <Button onClick={() => navigate('/payments/add')}>Add payment method</Button>
        </EmptyState>
      ) : (
        <Scroll>
          <div className="flex flex-col gap-4 px-6 pt-7">
            {fromBooking && list.length === 0 && <p className="text-sm text-muted">Payment Methods</p>}
            {list.map((p) => {
              const primary = p.id === state.primaryPaymentId
              return (
                <button
                  key={p.id}
                  onClick={() => { set({ primaryPaymentId: p.id }); if (fromBooking) navigate(-1) }}
                  className={cx('flex items-center gap-2.5 rounded-sm bg-white p-3 text-left transition-[box-shadow,transform] active:scale-[0.985]', fromBooking && primary ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]')}
                >
                  <img src={brandIcon[p.brand]} alt="" width={58} height={40} />
                  <span className="flex flex-1 flex-col gap-2">
                    <span className="text-[13px] font-semibold">{p.label}{p.last4 && ` •••• ${p.last4}`}</span>
                    {primary ? <Badge tone="brand">Primary</Badge> : <span className="text-xs text-muted">Also accepted</span>}
                  </span>
                  {!fromBooking && <ChevronRight size={22} strokeWidth={2} />}
                </button>
              )
            })}
            <Button variant="secondary" lead={<Plus size={20} strokeWidth={2} />} className="font-semibold" onClick={() => navigate(`/payments/add${fromBooking ? '?from=booking' : ''}`)}>Add payment method</Button>
          </div>
        </Scroll>
      )}
    </Screen>
  )
}

export function AddCard() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { set } = useStore()
  const [name, setName] = useState('Alex Mercer')
  const [num, setNum] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [primary, setPrimary] = useState(true)
  const digits = num.replace(/\D/g, '')
  const valid = name && digits.length >= 15 && /^\d{2} \/ \d{2}$/.test(exp) && cvc.length >= 3
  const brand: 'visa' | 'mastercard' = digits.startsWith('5') || digits.startsWith('2') ? 'mastercard' : 'visa'

  return (
    <Screen>
      <StatusBar />
      <Header title="Card details" icon={params.get('from') === 'booking' ? 'close' : 'back'} />
      <Scroll>
        <div className="flex flex-col gap-6 px-4 py-7">
          <div className="flex flex-col gap-4">
            <Field label="Cardholder name"><span className={inputBox}><input autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none" /></span></Field>
            <Field label="Card number">
              <span className={inputBox}>
                <input autoComplete="cc-number" inputMode="numeric" placeholder="4242 4242 4242 4242" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} className="tabular w-full bg-transparent outline-none placeholder:text-muted" />
                <img src={brand === 'visa' ? visaSm : mcSm} alt={brand} width={34} height={24} className="h-6 w-[34px]" />
              </span>
            </Field>
            <div className="flex gap-4">
              <Field label="Expiry date"><span className={inputBox}><input autoComplete="cc-exp" inputMode="numeric" placeholder="12 / 28" value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setExp(d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d) }} className="tabular w-full bg-transparent outline-none placeholder:text-muted" /></span></Field>
              <Field label="Security code"><span className={inputBox}><input autoComplete="cc-csc" inputMode="numeric" type="password" placeholder="•••" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full bg-transparent outline-none placeholder:text-muted" /><ShieldQuestion size={16} strokeWidth={2} /></span></Field>
            </div>
          </div>
          <button onClick={() => setPrimary(!primary)} aria-pressed={primary} className="flex items-center gap-3 rounded-md border border-line p-4 text-left">
            <span className="flex flex-1 flex-col gap-1 text-[13px]">
              <b className="font-semibold">Set as primary payment method</b>
              <span className="text-muted">Use this card by default for bookings.</span>
            </span>
            <CircleCheck size={16} strokeWidth={2} className={cx('transition-opacity', primary ? 'opacity-100' : 'opacity-25')} />
          </button>
          <InfoCard tone="info" icon={<ShieldCheck size={16} strokeWidth={2} className="text-success" />} title="Secured transactions">
            Your card details are encrypted and stored securely.
          </InfoCard>
          <Button
            disabled={!valid}
            className="font-bold"
            onClick={() => {
              const id = uid()
              set((s) => ({ payments: [...s.payments, { id, brand, label: brand === 'visa' ? 'Visa' : 'Mastercard', last4: digits.slice(-4), bank: brand === 'mastercard' ? 'CBQ' : undefined }], primaryPaymentId: primary || !s.primaryPaymentId ? id : s.primaryPaymentId }))
              navigate(-1)
            }}
          >
            Save payment method
          </Button>
        </div>
      </Scroll>
    </Screen>
  )
}
