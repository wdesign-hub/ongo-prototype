import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useStore } from '../lib/store'

const FrameCtx = createContext({ framed: false })
export const useFrame = () => useContext(FrameCtx)

function useIsDesktop() {
  const q = '(min-width: 600px) and (min-height: 700px)'
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

/** Every Figma frame, grouped like the canvas, so reviewers can jump straight to a state. */
const INDEX: { group: string; items: [string, string][] }[] = [
  { group: 'Onboarding', items: [['Loader', '/'], ['Sign in / Sign up', '/auth'], ['Browse before account', '/browse'], ['Phone number', '/signup/phone'], ['Select country', '/signup/country'], ['OTP code', '/signup/otp'], ['Car info', '/signup/car'], ['Welcome', '/welcome']] },
  { group: 'Home & booking', items: [['Home', '/home'], ['Set location (map)', '/book'], ['Car wash details', '/book/details'], ['Finding washer', '/book/confirm'], ['Cancel reason', '/book/cancel'], ['No washer available', '/book/no-washer']] },
  { group: 'Bookings', items: [['Current booking', '/bookings'], ['Recent bookings', '/bookings/recent'], ['Rate your wash', '/rate'], ['Thanks for feedback', '/rate/thanks']] },
  { group: 'Garage & profile', items: [['Garage', '/garage'], ['Add vehicle', '/garage/new'], ['Profile', '/profile'], ['Edit profile', '/profile/edit'], ['App settings', '/settings'], ['Notifications', '/notifications']] },
  { group: 'Payments', items: [['Payment methods', '/payments'], ['Add card', '/payments/add']] },
  { group: 'Errors', items: [['Offline', '/offline']] },
]

export function PhoneFrame({ children }: { children: ReactNode }) {
  const desktop = useIsDesktop()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { state, set, reset } = useStore()

  if (!desktop) {
    return (
      <FrameCtx.Provider value={{ framed: false }}>
        <div className="fixed inset-0 overflow-hidden bg-white">{children}</div>
      </FrameCtx.Provider>
    )
  }

  const toggle = (label: string, on: boolean, fn: () => void) => (
    <button onClick={fn} className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-[13px] text-ink/80 hover:bg-black/[0.04]">
      {label}
      <span className={`relative h-[18px] w-[30px] rounded-full transition-colors ${on ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-[left] ${on ? 'left-[14px]' : 'left-[2px]'}`} />
      </span>
    </button>
  )

  return (
    <FrameCtx.Provider value={{ framed: true }}>
      <div className="flex min-h-full items-center justify-center gap-12 p-8">
        <aside className="hidden max-h-[844px] w-[232px] shrink-0 flex-col gap-5 overflow-y-auto pr-2 lg:flex no-scrollbar">
          <div>
            <p className="text-[15px] font-bold">ONGO prototype</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">Built from the Figma consumer file. Click through the phone, or jump to any screen.</p>
          </div>
          {INDEX.map((g) => (
            <div key={g.group} className="flex flex-col gap-0.5">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.group}</p>
              {g.items.map(([label, to]) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={`rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors ${pathname === to ? 'bg-white font-semibold shadow-sm' : 'text-ink/80 hover:bg-black/[0.04]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-0.5">
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Demo data</p>
            {toggle('Has vehicles', state.cars.length > 0, () => set((s) => ({ cars: s.cars.length ? [] : [{ id: 'c1', name: 'Lamborghini Jr.', plate: '000000', color: 'White', type: 'Sedan' }], primaryCarId: s.cars.length ? null : 'c1' })))}
            {toggle('Has payment card', state.payments.length > 0, () => set((s) => ({ payments: s.payments.length ? [] : [{ id: 'p1', brand: 'mastercard', label: 'Mastercard', last4: '2210', bank: 'CBQ' }], primaryPaymentId: s.payments.length ? null : 'p1' })))}
            {toggle('Has recent bookings', state.recent.length > 0, () => set((s) => ({ recent: s.recent.length ? [] : [{ id: 'r1', service: 'express' }, { id: 'r2', service: 'shine' }, { id: 'r3', service: 'express' }] })))}
            {toggle('Has notifications', state.showNotifications, () => set((s) => ({ showNotifications: !s.showNotifications })))}
            {toggle('Next payment fails', state.failPayment, () => set((s) => ({ failPayment: !s.failPayment })))}
            {toggle('No washer available', state.noWasher, () => set((s) => ({ noWasher: !s.noWasher })))}
            <button onClick={() => { reset(); navigate('/') }} className="mt-2 rounded-sm px-2 py-1.5 text-left text-[13px] text-danger hover:bg-danger-subtle">
              Reset demo
            </button>
          </div>
        </aside>

        <div className="relative shrink-0 rounded-[56px] bg-[#0b0d0e] p-[10px] shadow-[0_40px_80px_-20px_rgba(11,13,14,0.35),0_0_0_1px_rgba(255,255,255,0.08)_inset]">
          <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[46px] bg-white [transform:translateZ(0)]">
            {children}
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-[60] h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
            {/* Home indicator */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-[60] h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-white mix-blend-difference" />
          </div>
        </div>
      </div>
    </FrameCtx.Provider>
  )
}
