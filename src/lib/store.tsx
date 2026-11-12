import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CarType, ServiceId } from './data'

export type Car = { id: string; name: string; plate: string; color: string; type: CarType }
export type PaymentMethod = { id: string; brand: 'mastercard' | 'visa' | 'applepay'; label: string; last4?: string; bank?: string }
export type BookingStage = 0 | 1 | 2 | 3 | 4 | 5 // index into TIMELINE; 5 = done
export type Booking = {
  id: string
  service: ServiceId
  addons: string[]
  location: string
  when: string | null // null = now
  stage: BookingStage
  status: 'searching' | 'active'
  createdAt: number
}
export type PastBooking = { id: string; service: ServiceId; when?: string; car?: string }
export type ThemePref = 'system' | 'light' | 'dark'

export type AppState = {
  onboarded: boolean
  user: { name: string; email: string; phone: string; country: string }
  cars: Car[]
  primaryCarId: string | null
  payments: PaymentMethod[]
  primaryPaymentId: string | null
  booking: Booking | null
  recent: PastBooking[]
  notifications: boolean
  showNotifications: boolean
  dismissedNotifications: string[]
  settings: { push: boolean; biometric: boolean; language: 'en' | 'ar' }
  theme: ThemePref
  savedCarBanner: boolean
  draft: { service: ServiceId; addons: string[]; location: string | null; when: string | null }
  offline: boolean
  failPayment: boolean
  noWasher: boolean
  wrongOtp: boolean
  locationOff: boolean
}

const SEED: AppState = {
  onboarded: false,
  user: { name: 'Alex Mercer', email: 'a.mercer@email.com', phone: '0000 0000', country: '+974' },
  cars: [
    { id: 'c1', name: 'Lamborghini Jr.', plate: '000000', color: 'White', type: 'Sedan' },
    { id: 'c2', name: 'Land Cruiser House', plate: '271104', color: 'Black', type: 'SUV · 7 seats' },
    { id: 'c3', name: 'Custom name', plate: '118230', color: 'Red', type: 'Sedan' },
  ],
  primaryCarId: 'c1',
  payments: [],
  primaryPaymentId: null,
  booking: null,
  recent: [{ id: 'r1', service: 'express', when: 'Today, 12:04', car: 'Lamborghini Jr.' }, { id: 'r2', service: 'shine', when: '28 Oct', car: 'Land Cruiser House' }, { id: 'r3', service: 'express', when: '21 Oct', car: 'Lamborghini Jr.' }],
  notifications: true,
  showNotifications: true,
  dismissedNotifications: [],
  settings: { push: true, biometric: false, language: 'en' },
  theme: 'system',
  savedCarBanner: true,
  draft: { service: 'express', addons: ['wax', 'engine'], location: null, when: null },
  offline: false,
  failPayment: false,
  noWasher: false,
  wrongOtp: false,
  locationOff: false,
}

const KEY = 'ongo-prototype-v1'

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...SEED, ...saved, settings: { ...SEED.settings, ...saved.settings } }
    }
  } catch { /* storage blocked — run from seed */ }
  return SEED
}

type Ctx = {
  state: AppState
  set: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
  reset: () => void
  primaryCar: Car | null
  resolvedTheme: 'light' | 'dark'
}

function useSystemDark() {
  const q = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const set = useCallback<Ctx['set']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const reset = useCallback(() => setState(SEED), [])

  // Resolve the Appearance preference and publish it on <html data-theme> so CSS tokens swap.
  const systemDark = useSystemDark()
  const resolvedTheme: 'light' | 'dark' = state.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.theme
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0b0d0e' : '#ffffff')
  }, [resolvedTheme])

  const primaryCar = state.cars.find((c) => c.id === state.primaryCarId) ?? state.cars[0] ?? null

  const value = useMemo(() => ({ state, set, reset, primaryCar, resolvedTheme }), [state, set, reset, primaryCar, resolvedTheme])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

export const uid = () => Math.random().toString(36).slice(2, 9)
