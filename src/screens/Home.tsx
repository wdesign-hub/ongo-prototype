import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { Bell, CarFront, ChevronDown, CircleCheck, ListTodo, MapPin, Search, Warehouse } from 'lucide-react'
import { useStore } from '../lib/store'
import { Badge, BottomNav, Button, EmptyState, InfoCard, Screen, Scroll, StatusBar, ThemedImg } from '../components/ui'
import { ServicePreview } from '../components/ServicePreview'
import { CarTypeSheet } from '../components/Sheets'
import symbol from '../assets/icons/ongo-symbol.svg'
import symbolWhite from '../assets/icons/ongo-symbol-white.svg'
import illCalendar from '../assets/img/ill-calendar.png'

export function HomeHeader() {
  const { primaryCar, state, set } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const type = primaryCar?.type ?? 'Sedan'
  return (
    <>
      <div className="shrink-0 bg-bg px-6 py-1">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <ThemedImg light={symbol} dark={symbolWhite} alt="ONGO" width={33} height={32} />
            <button onClick={() => (state.cars.length ? setOpen(true) : navigate('/garage/new'))} className="flex h-8 items-center gap-2 rounded-sm bg-bg-2 px-3 font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] [@media(hover:hover)]:hover:bg-line">
              <CarFront size={16} strokeWidth={2} />
              {type.startsWith('SUV') ? 'SUV' : type}
              <ChevronDown size={16} strokeWidth={2} />
            </button>
          </div>
          <button onClick={() => navigate('/notifications')} aria-label="Notifications" className="relative -m-2 p-2">
            <Bell size={24} strokeWidth={1.75} />
            {state.showNotifications && state.dismissedNotifications.length < 3 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-bg" />}
          </button>
        </div>
      </div>
      <CarTypeSheet
        open={open}
        cars={state.cars}
        value={primaryCar?.id ?? null}
        onClose={() => setOpen(false)}
        onSave={(id) => { setOpen(false); set({ primaryCarId: id }) }}
      />
    </>
  )
}

function LocationField({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-[45px] w-full items-center justify-between rounded-[7px] bg-bg-2 pl-3 pr-3.5 text-left transition-colors active:bg-line">
      <span className="flex items-center gap-4 text-muted"><MapPin size={16} strokeWidth={2} className="text-ink" />Car location</span>
      <Search size={16} strokeWidth={2} />
    </button>
  )
}

/* Card / Progress — shown when a booking is active (Home 1.1) */
function ProgressCard() {
  const { state } = useStore()
  const navigate = useNavigate()
  const b = state.booking!
  const searching = b.status === 'searching'
  const steps = [ListTodo, Warehouse, CarFront, CircleCheck]
  const fill = searching ? 0.6 : Math.min(3, b.stage <= 1 ? 1 : b.stage <= 3 ? 2 : 3)
  const label = searching ? 'Finding your washer' : b.stage >= 5 ? 'Your car is ready' : 'Arriving in 15–30 min'
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-bg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{label}</p>
        <Badge>{searching ? 'Pending' : b.stage >= 5 ? 'Done' : 'Accepted'}</Badge>
      </div>
      <div className="flex h-[42px] items-center gap-2">
        {steps.map((Icon, i) => (
          <div key={i} className="contents">
            <Icon size={22} strokeWidth={1.75} className="shrink-0" />
            {i < 3 && (
              <span className="relative h-0.5 flex-1 overflow-hidden bg-line">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(1, fill - i)) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 text-sm leading-[1.5]">
        <p>Car wash confirmed</p>
        <p className="text-muted">We’ve received your request and will keep you updated.</p>
      </div>
      <Button variant="tertiary" size="sm" onClick={() => navigate(searching ? '/book/confirm' : '/bookings')}>Track your service</Button>
    </div>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { state, set, primaryCar } = useStore()
  const active = !!state.booking
  return (
    <Screen>
      <StatusBar tall />
      <HomeHeader />
      <Scroll>
        <div className="flex flex-col gap-6 px-6 py-7">
          {!active && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold leading-none">Start by setting your car's location.</p>
              <LocationField onClick={() => navigate('/book?step=search')} />
            </div>
          )}
          <AnimatePresence initial={false}>
            {active ? (
              <motion.div key="progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><ProgressCard /></motion.div>
            ) : state.savedCarBanner && primaryCar ? (
              <motion.div key="banner" exit={{ opacity: 0, height: 0, marginBottom: -24 }} transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}>
                <InfoCard tone="success" icon={<Bell size={16} strokeWidth={2} />} title="Your car is saved. Book its first wash." onClose={() => set({ savedCarBanner: false })}>
                  {primaryCar.name} · {primaryCar.type}. Prices below include your vehicle size.
                </InfoCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <ServicePreview />
        </div>
      </Scroll>
      <BottomNav />
    </Screen>
  )
}

/* Offline (error state) */
export function Offline() {
  const navigate = useNavigate()
  return (
    <Screen>
      <StatusBar tall />
      <HomeHeader />
      <EmptyState image={illCalendar} title="You're offline" body="Check your connection. We'll refresh your bookings as soon as you're back online.">
        <Button onClick={() => navigate('/home', { replace: true })}>Retry</Button>
      </EmptyState>
      <BottomNav />
    </Screen>
  )
}
