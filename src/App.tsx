import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router'
import { StoreProvider } from './lib/store'
import { PhoneFrame } from './components/PhoneFrame'
import { Auth, Browse, CarInfo, Country, Loader, Otp, Phone, Welcome } from './screens/Onboarding'
import { Home, Offline } from './screens/Home'
import { BookingConfirm, BookingDetails, BookingMap, CancelReason, Cancelling, NoWasher } from './screens/Booking'
import { BookingsCurrent, BookingsRecent, Rate, Thanks } from './screens/Bookings'
import { AddCard, Garage, GarageEdit, Notifications, Payments, Profile, ProfileEdit, Settings } from './screens/Account'
import { Cancelled, Receipt, Review, Scheduled } from './screens/Checkout'

// Tab roots swap with a plain dissolve (Figma: DISSOLVE); stacked screens slide a little in the push direction.
const TAB_ROOTS = ['/home', '/bookings', '/bookings/recent', '/garage', '/profile', '/offline']

function AnimatedRoutes() {
  const location = useLocation()
  const navType = useNavigationType()
  const isTab = TAB_ROOTS.includes(location.pathname) && navType === 'REPLACE'
  const dir = navType === 'POP' ? -1 : 1
  const offset = isTab ? 0 : 28 * dir

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={offset}>
      <motion.div
        key={location.pathname}
        className="absolute inset-0"
        custom={offset}
        variants={{
          enter: (o: number) => ({ opacity: 0, x: o }),
          center: { opacity: 1, x: 0 },
          exit: (o: number) => ({ opacity: 0, x: -o * 0.5 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Loader />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/signup/phone" element={<Phone />} />
          <Route path="/signup/country" element={<Country />} />
          <Route path="/signup/otp" element={<Otp />} />
          <Route path="/signup/car" element={<CarInfo />} />
          <Route path="/welcome" element={<Welcome />} />

          <Route path="/home" element={<Home />} />
          <Route path="/offline" element={<Offline />} />
          <Route path="/book" element={<BookingMap />} />
          <Route path="/book/details" element={<BookingDetails />} />
          <Route path="/book/review" element={<Review />} />
          <Route path="/book/scheduled" element={<Scheduled />} />
          <Route path="/book/confirm" element={<BookingConfirm />} />
          <Route path="/book/cancelled" element={<Cancelled />} />
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/book/cancel" element={<CancelReason />} />
          <Route path="/book/cancelling" element={<Cancelling />} />
          <Route path="/book/no-washer" element={<NoWasher />} />

          <Route path="/bookings" element={<BookingsCurrent />} />
          <Route path="/bookings/recent" element={<BookingsRecent />} />
          <Route path="/rate" element={<Rate />} />
          <Route path="/rate/thanks" element={<Thanks />} />

          <Route path="/garage" element={<Garage />} />
          <Route path="/garage/new" element={<GarageEdit />} />
          <Route path="/garage/:id" element={<GarageEdit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/add" element={<AddCard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <StoreProvider>
          <PhoneFrame>
            <AnimatedRoutes />
          </PhoneFrame>
        </StoreProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
