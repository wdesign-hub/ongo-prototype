import clock3d from '../assets/img/3d-clock.png'
import wheel3d from '../assets/img/3d-wheel.png'
import car3d from '../assets/img/3d-car.png'
import cube3d from '../assets/img/3d-cube.png'
import flagQa from '../assets/img/flag-qa.png'
import flagSa from '../assets/img/flag-sa.png'
import flagKw from '../assets/img/flag-kw.png'

import svcCarFront from '../assets/icons/svc-car-front.svg'
import svcSparkles from '../assets/icons/svc-sparkles.svg'
import svcWax from '../assets/icons/svc-wax-seal.svg'
import svcWheels from '../assets/icons/svc-wheels.svg'
import svcWrench from '../assets/icons/svc-wrench.svg'
import svcSun from '../assets/icons/svc-sun.svg'
import svcDog from '../assets/icons/svc-dog.svg'
import svcSprayCan from '../assets/icons/svc-spray-can.svg'
import svcThermo from '../assets/icons/svc-thermo.svg'

export type ServiceId = 'express' | 'shine' | 'detailed' | 'custom'

export type Service = {
  id: ServiceId
  tab: string
  title: string          // title on the Home / Browse card
  listName: string       // name in "Choose a service" sheet
  detailName: string     // name in "Car wash details"
  duration: string
  price: number | null
  icon: string
  recommended?: boolean
  features: string[]
  detailFeatures: string[]
}

// Fixed sedan pricing (SUV: 55 / 85 / 160 QAR — not shown in the designs yet)
export const SERVICES: Service[] = [
  {
    id: 'express', tab: 'Express', title: 'Express Wash', listName: 'Express', detailName: 'Express',
    duration: '25–35 min', price: 45, icon: clock3d, recommended: true,
    features: ['Exterior wash', 'Interior vacuum', 'Dashboard wipe', 'Tyre cleaning'],
    detailFeatures: ['Exterior wash', 'Interior vacuum', 'Dashboard wipe', 'Tyre cleaning'],
  },
  {
    id: 'shine', tab: 'Shine', title: 'Shine', listName: 'Shine', detailName: 'Shine',
    duration: '40–60 min', price: 70, icon: car3d,
    features: ['Everything in Express', 'Wax shampoo', 'Interior shine', 'Tyre shine'],
    detailFeatures: ['Everything in Express', 'Wax shampoo', 'Interior shine', 'Tyre shine'],
  },
  {
    id: 'detailed', tab: 'Detailed', title: 'Detailed Wash', listName: 'Detailed', detailName: 'Detailed',
    duration: '60–90 min', price: 120, icon: wheel3d,
    features: ['Everything in Shine', 'Deep interior cleaning & upholstery', 'Light polish / wax', 'Rim detailing'],
    detailFeatures: ['Everything in Shine', 'Deep interior cleaning & upholstery', 'Light polish / wax', 'Rim detailing'],
  },
  {
    id: 'custom', tab: 'Custom', title: 'Custom', listName: 'Custom', detailName: 'Custom',
    duration: 'Time varies', price: null, icon: cube3d,
    features: ['Everything in Express, plus add-ons', 'Build your own package'],
    detailFeatures: ['Everything in Express, plus add-ons'],
  },
]

// Order used by the "Choose a service" sheet in Figma (Booking 1.2)
export const SERVICE_LIST_ORDER: ServiceId[] = ['express', 'shine', 'detailed', 'custom']

export const serviceById = (id: ServiceId) => SERVICES.find((s) => s.id === id)!

export const ADDONS = [
  { id: 'interior-polish', label: 'Interior polish / shampoo', icon: svcCarFront },
  { id: 'interior-clean', label: 'Interior clean', icon: svcSparkles },
  { id: 'wax', label: 'Wax & seal', icon: svcWax },
  { id: 'tire', label: 'Tyre shine', icon: svcWheels },
  { id: 'engine', label: 'Engine cleaning', icon: svcWrench },
  { id: 'headlights', label: 'Headlights', icon: svcSun },
  { id: 'pet', label: 'Pet hair removal', icon: svcDog },
  { id: 'paint', label: 'Paint polishing', icon: svcSprayCan },
  { id: 'ac', label: 'AC steam cleaning', icon: svcThermo },
]

export type CarType = 'Sedan' | 'SUV · 5 seats' | 'SUV · 7 seats'
export const CAR_TYPES: { type: CarType; examples: string; short: string; seats: number }[] = [
  { type: 'Sedan', examples: 'Camry, Accord, Corolla', short: 'Sedan', seats: 5 },
  { type: 'SUV · 5 seats', examples: 'RAV4, Captiva, X3', short: 'SUV', seats: 5 },
  { type: 'SUV · 7 seats', examples: 'Land Cruiser, Patrol, GX', short: 'SUV', seats: 7 },
]

export const CAR_COLORS = [
  { name: 'Red', hex: '#c8282f' },
  { name: 'Yellow', hex: '#f6e85f' },
  { name: 'Green', hex: '#4a7425' },
  { name: 'Blue', hex: '#5b90dd' },
  { name: 'Gold', hex: '#cfb152' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#222222' },
  { name: 'Grey', hex: '#4d4f4d' },
  { name: 'Silver', hex: '#dddddd' },
  { name: 'Other', hex: '#a0e870' },
]

/* A car can have up to 3 colours (Figma annotation on Choose color). Stored as "White, Black". */
export const MAX_CAR_COLORS = 3
export const parseColors = (v: string) => v.split(',').map((c) => c.trim()).filter(Boolean)

export const COUNTRIES = [
  { code: '+974', name: 'Qatar', flag: flagQa },
  { code: '+966', name: 'Saudi Arabia', flag: flagSa },
  { code: '+965', name: 'Kuwait', flag: flagKw },
]

export const LOCATIONS = [
  { id: 'seaside', name: 'Seaside Promenade', address: 'Al Corniche Street, West Bay, Doha, Qatar', recent: true },
  { id: 'marina', name: 'Marina Walkway', address: '12 Pearl Tower Avenue, Lusail, Doha, Qatar' },
  { id: 'harbor', name: 'Harborfront Pathway', address: '45 Al Dafna Street, West Bay, Doha, Qatar' },
  { id: 'waab', name: 'Building 12, Al Waab Street', address: 'Al Waab, Doha, Qatar' },
  { id: 'pearl', name: 'Porto Arabia', address: 'The Pearl-Qatar, Doha, Qatar' },
  { id: 'msheireb', name: 'Msheireb Downtown', address: 'Msheireb Street, Doha, Qatar' },
  { id: 'lusail', name: 'Lusail Marina Promenade', address: 'Lusail Marina, Lusail, Qatar' },
]

/* Areas the pin "resolves" to after the map is dragged (Bottom sheet / Search shows "Arumaila") */
export const PIN_AREAS = [
  { id: 'arumaila', name: 'Arumaila', address: 'Arumaila, Doha, Qatar' },
  { id: 'al-sadd', name: 'Al Sadd', address: 'Al Sadd, Doha, Qatar' },
  { id: 'west-bay', name: 'West Bay', address: 'West Bay, Doha, Qatar' },
]

export const CANCEL_REASONS = [
  'My plans changed',
  'Found it cheaper elsewhere',
  'Booked the wrong time or vehicle',
  'Washer was unresponsive',
  'Something else',
]

export const FEEDBACK_TAGS = ['Spotless', 'On time', 'Friendly', 'Missed spots', 'Arrived late']

export const NOTIFICATIONS = [
  { id: 'n1', icon: 'pin' as const, title: 'Marina Walkway promo', body: 'Earn Ooredoo points when you wash your car at Marina Walkway today.' },
  { id: 'n2', icon: 'logo' as const, title: '20% off your first wash', body: 'Book any wash in the app to claim it.', isNew: true },
  { id: 'n3', icon: 'pin' as const, title: 'Run ONGO Run', body: 'Join us for a run at Mall of Qatar at 7 AM. Wear your favourite running shoes.' },
]

// Washer tracking timeline (Bookings 1.0 / 1.1)
export const TIMELINE = [
  { title: 'Booking confirmed', time: '12:04' },
  { title: 'Washer assigned', time: '1:48', sub: 'Mike Mohammad · Van Q8812' },
  { title: 'On the way', time: '2:11', sub: 'Left Al Sadd · 14 min away' },
  { title: 'Arrived & locating your car', time: '~2:30' },
  { title: 'Wash in progress', time: '~2:32' },
  { title: 'Wash complete' },
]
