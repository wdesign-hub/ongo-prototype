import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { ArrowRight, Coins, ShieldCheck, MessageCircle, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { CAR_COLORS, CAR_TYPES, COUNTRIES, parseColors, type CarType } from '../lib/data'
import { Button, Field, Footer, Header, InfoCard, OptionCard, Screen, Scroll, StatusBar, ThemedImg, cx, inputBox, useCountdown, useTimeout } from '../components/ui'
import { ServicePreview } from '../components/ServicePreview'
import { ColorSheet } from '../components/Sheets'

import logo from '../assets/icons/ongo-logo.svg'
import logoWhite from '../assets/icons/ongo-logo-white.svg'
import apple from '../assets/icons/brand-apple.svg'
import google from '../assets/icons/brand-google.svg'

/* Loader — dark splash with elastic logo, auto-advances after 1.5s (Figma: AFTER_TIMEOUT 1.5) */
export function Loader() {
  const navigate = useNavigate()
  const { state } = useStore()
  const next = () => navigate(state.onboarded ? '/home' : '/auth', { replace: true })
  useTimeout(next, 1800)
  return (
    <Screen bg="bg-[#0b0d0e]">
      <button onClick={next} className="flex flex-1 items-center justify-center" aria-label="Continue">
        <motion.img
          src={logoWhite}
          alt="ONGO"
          width={134}
          height={132}
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.9, bounce: 0.45 }}
        />
      </button>
    </Screen>
  )
}

/* Signin / Signup */
export function Auth() {
  const navigate = useNavigate()
  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center gap-2.5 px-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}><ThemedImg light={logo} dark={logoWhite} alt="ONGO" width={134} height={132} /></motion.div>
          <motion.div className="flex flex-col items-center gap-6 pt-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-balance">Car wash is just one tap away</h1>
            <p className="text-sm opacity-70">Zero friction. Total clarity. Always On Go.</p>
          </motion.div>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/browse')}>Continue with phone</Button>
            <p className="text-center text-sm text-muted">Takes about a minute. No password.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="opacity-70">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button variant="secondary" lead={<img src={apple} alt="" width={20} height={20} className="dark:invert [button:hover_&]:invert dark:[button:hover_&]:invert-0" />} onClick={() => navigate('/browse')}>Continue with Apple</Button>
          <Button variant="secondary" lead={<img src={google} alt="" width={20} height={20} className="[button:hover_&]:invert dark:[button:hover_&]:invert-0" />} onClick={() => navigate('/browse')}>Continue with Google</Button>
          <p className="py-6 text-center text-sm leading-[1.5] opacity-70 text-pretty" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            By continuing, you agree to our <u>Terms of Service</u> and <u>Privacy Policy.</u>
          </p>
        </div>
      </div>
    </Screen>
  )
}

/* Browse before the account */
export function Browse() {
  const navigate = useNavigate()
  return (
    <Screen>
      <StatusBar />
      <Header />
      <Scroll className="px-6 pt-12">
        <div className="flex flex-col gap-7">
          <h1 className="text-[32px] font-bold leading-[1.3] text-pretty">See what a wash costs before you sign up.</h1>
          <ServicePreview titleSize={20} priceSize={48} />
          <InfoCard tone="info" icon={<ShieldCheck size={16} strokeWidth={2} className="text-success" />} title="Every vendor is licence-verified">
            Trade licence, CR and Qatar ID checked before a vendor can take a booking.
          </InfoCard>
        </div>
      </Scroll>
      <Footer><Button onClick={() => navigate('/signup/phone')}>Next</Button></Footer>
    </Screen>
  )
}

/* Signup 1.0 / 1.3 — phone number */
export function Phone() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const [num, setNum] = useState(state.user.phone === '0000 0000' ? '' : state.user.phone)
  const digits = num.replace(/\D/g, '')
  const valid = digits.length === 8
  const format = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 8); return d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d }
  return (
    <Screen>
      <StatusBar />
      <Header />
      <Scroll>
        <div className="flex flex-col gap-10 px-6 pt-12">
          <div className="flex flex-col gap-7">
            <h1 className="text-[28px] font-bold leading-[1.3]">What’s your<br />phone number?</h1>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate('/signup/country')} className="flex h-11 items-center rounded-sm bg-bg-2 px-2 text-[28px] font-medium transition-transform active:scale-95" aria-label="Change country code">
                {state.user.country}
              </button>
              <input
                autoFocus
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label="Phone number"
                placeholder="Phone number"
                value={num}
                onChange={(e) => setNum(format(e.target.value))}
                className="min-w-0 flex-1 bg-transparent pl-1 !text-[28px] font-medium caret-brand-border outline-none placeholder:text-muted"
              />
            </div>
          </div>
          {!valid && <p className="text-sm opacity-60">Your number stays private and is only used for booking updates.</p>}
          {valid && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <InfoCard tone="success" icon={<MessageCircle size={16} strokeWidth={2} />} title="We’ll send your code on WhatsApp">
                Most people in Qatar get it faster there. Prefer SMS? You can switch on the next screen.
              </InfoCard>
            </motion.div>
          )}
        </div>
      </Scroll>
      <Footer>
        <Button disabled={!valid} onClick={() => { set((s) => ({ user: { ...s.user, phone: num } })); navigate('/signup/otp') }}>Next</Button>
      </Footer>
    </Screen>
  )
}

/* Signup 1.1 / 1.2 — select country */
export function Country() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const [sel, setSel] = useState(state.user.country)
  return (
    <Screen>
      <StatusBar />
      <Header />
      <div className="px-6 pt-12 pb-3"><h1 className="text-[28px] font-bold leading-none">Select your country</h1></div>
      <Scroll className="flex flex-col gap-3 p-4">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setSel(c.code)}
            aria-pressed={sel === c.code}
            className={cx('flex h-[70px] w-full items-center gap-3 rounded-lg bg-bg px-4 text-lg transition-shadow duration-150', sel === c.code ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]')}
          >
            <img src={c.flag} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
            <span className="opacity-70">{c.code}</span>
            <span className="opacity-25">{c.name}</span>
          </button>
        ))}
      </Scroll>
      <Footer>
        <Button onClick={() => { set((s) => ({ user: { ...s.user, country: sel } })); navigate(-1) }}>Next</Button>
      </Footer>
    </Screen>
  )
}

/* Signup 2.0 / 2.1 / 2.3 — OTP */
export function Otp() {
  const navigate = useNavigate()
  const { state, set } = useStore()
  const [code, setCode] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const [left, restart] = useCountdown(24)
  const done = code.every((c) => c)

  const put = (i: number, v: string) => {
    setError(false)
    const d = v.replace(/\D/g, '')
    if (d.length > 1) { // paste / autofill
      const arr = d.slice(0, 4).split('')
      setCode([0, 1, 2, 3].map((k) => arr[k] ?? ''))
      refs.current[Math.min(arr.length, 3)]?.focus()
      return
    }
    setCode((c) => c.map((x, k) => (k === i ? d : x)))
    if (d && i < 3) refs.current[i + 1]?.focus()
  }

  return (
    <Screen>
      <StatusBar />
      <Header />
      <Scroll>
        <div className="flex flex-col gap-7 px-6 pt-12">
          <h1 className="text-[28px] font-bold leading-[1.3]">Enter the code sent to ({state.user.country}) {state.user.phone}</h1>
          <div className="flex gap-2.5">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                autoFocus={i === 0}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${i + 1}`}
                value={c}
                onChange={(e) => put(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus() }}
                className={cx(
                  'h-[74px] min-w-0 flex-1 rounded-[14px] border text-center !text-[28px] font-medium caret-brand-border outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[0_0_0_3px_rgba(160,232,112,0.35)]',
                  error ? 'border-danger focus:border-danger' : c ? 'border-ink' : 'border-line',
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            {left > 0 ? (
              <span className="tabular opacity-50">Resend in 0:{String(left).padStart(2, '0')}</span>
            ) : (
              <button onClick={() => { restart(); setCode(['', '', '', '']); refs.current[0]?.focus() }} className="py-2.5 underline underline-offset-2">Resend</button>
            )}
            <button className="py-2.5">Get it by SMS instead</button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p role="alert" className="-mt-3 text-sm text-danger" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                The code you entered is incorrect. Please try again.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Scroll>
      <Footer>
        <Button
          disabled={!done || error}
          onClick={() => {
            // Demo: "Wrong OTP code" rejects the first attempt, then lets the retry through.
            if (state.wrongOtp) { set({ wrongOtp: false }); setError(true); setCode(['', '', '', '']); refs.current[0]?.focus(); return }
            navigate('/signup/car')
          }}
        >
          Next
        </Button>
      </Footer>
    </Screen>
  )
}

/* Car info (shared by onboarding "Car Info" and Garage 1.1) */
export function CarForm({ title, cta, initial, onSubmit }: { title: string; cta: string; initial?: { name: string; plate: string; color: string; type: CarType }; onSubmit: (v: { name: string; plate: string; color: string; type: CarType }) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [plate, setPlate] = useState(initial?.plate ?? '')
  const [color, setColor] = useState(initial?.color ?? '')
  const [type, setType] = useState<CarType | null>(initial?.type ?? null)
  const [colorOpen, setColorOpen] = useState(false)
  const swatches = parseColors(color).map((n) => CAR_COLORS.find((c) => c.name === n)!).filter(Boolean)
  const valid = name.trim() && plate.trim() && color && type

  return (
    <Screen>
      <StatusBar />
      <Header />
      <Scroll>
        <div className="flex flex-col gap-7 px-6 pt-7">
          <h1 className="text-[28px] font-bold leading-none">{title}</h1>
          <div className="flex flex-col gap-6">
            <Field label="Name your car">
              <span className={inputBox}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lamborghini Jr." className="w-full bg-transparent outline-none placeholder:text-muted" /></span>
            </Field>
            <Field label="Plate number">
              <span className={inputBox}><b>Q</b><input inputMode="numeric" value={plate} onChange={(e) => setPlate(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full bg-transparent pl-1 tracking-wide outline-none placeholder:text-muted" /></span>
            </Field>
            <Field label="Car color">
              <button type="button" onClick={() => setColorOpen(true)} className={cx(inputBox, 'justify-between text-left')}>
                <span className={color ? '' : 'text-ink'}>{color || 'Car color'}</span>
                <span className="flex items-center gap-2">
                  {swatches.length ? (
                    <span className="flex -space-x-2">
                      {swatches.map((w) => <span key={w.name} className="size-7 rounded-full border border-line ring-2 ring-bg" style={{ background: w.hex }} />)}
                    </span>
                  ) : (<><span className="size-7 rounded-full border border-line bg-[#fff]" /><span className="size-7 rounded-full bg-[#222]" /></>)}
                  <ChevronRight size={24} strokeWidth={2} />
                </span>
              </button>
            </Field>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">What type of vehicle do you have?</p>
              {CAR_TYPES.map((t) => <OptionCard key={t.type} selected={type === t.type} onClick={() => setType(t.type)} title={t.type} sub={t.examples} />)}
            </div>
          </div>
          <InfoCard tone="warning" icon={<Coins size={16} strokeWidth={2} />} title="A larger vehicle affects the price">
            The amount of work varies based on what type of car you have.
          </InfoCard>
        </div>
      </Scroll>
      <Footer><Button disabled={!valid} onClick={() => onSubmit({ name, plate, color, type: type! })}>{cta}</Button></Footer>
      <ColorSheet open={colorOpen} value={color} onClose={() => setColorOpen(false)} onSave={(c) => { setColor(c); setColorOpen(false) }} />
    </Screen>
  )
}

export function CarInfo() {
  const navigate = useNavigate()
  const { set } = useStore()
  return (
    <CarForm
      title="Add your car details"
      cta="Done"
      onSubmit={(v) => {
        set({ cars: [{ id: 'c1', ...v }], primaryCarId: 'c1', savedCarBanner: true, onboarded: true })
        navigate('/welcome', { replace: true })
      }}
    />
  )
}

/* Welcome */
export function Welcome() {
  const navigate = useNavigate()
  const go = () => navigate('/home', { replace: true })
  useTimeout(go, 2200)
  const [dots, setDots] = useState(0)
  useEffect(() => { const t = setInterval(() => setDots((d) => (d + 1) % 4), 400); return () => clearInterval(t) }, [])
  return (
    <Screen>
      <StatusBar />
      <button onClick={go} className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16" aria-label="Go to home">
        <motion.div className="flex flex-col gap-6 self-stretch text-left" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-[40px] leading-none tracking-[-0.02em]"><span className="font-medium">Welcome to </span><b>ONGO</b></h1>
          <p className="text-sm text-muted">Setting things up{'.'.repeat(dots)}</p>
        </motion.div>
        <motion.span initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <ArrowRight size={64} strokeWidth={1.5} />
        </motion.span>
      </button>
    </Screen>
  )
}

