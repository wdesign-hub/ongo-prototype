# ONGO prototype

Clickable web prototype of the ONGO on-demand car wash app, built from the Figma consumer design (54 screens).

**Stack:** Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion · React Router

## Run

```bash
npm install
npm run dev
```

On desktop the app renders inside an iPhone frame with a side panel to jump to any screen and toggle demo states (empty garage, no payment methods, payment failure, no washer available, wrong OTP code, location services off) and switch the theme (System / Light / Dark). On a phone it runs full-screen.

## Flows

- Onboarding: sign in, price preview, phone + country, OTP, car details, welcome
- Booking: draggable map, location search, service selection, add-ons, scheduling, payment
- Tracking: washer search, live timeline, cancel, rating and feedback
- Account: garage, profile, settings, notifications, payment methods
- Empty, error and confirmation states

Design tokens in `src/index.css` mirror the Figma Theme (Light and Dark modes) and Sizes variables. Dark mode is set on `<html data-theme>` from App Settings → Appearance; Tailwind's `dark:` variant follows that attribute. State persists to `localStorage`; use "Reset demo" to start over.

## Live demo

https://wdesign-hub.github.io/ongo-prototype/

Redeploy after changes: `npm run deploy` (builds and publishes `dist` to the `gh-pages` branch; needs `gh auth login`).
