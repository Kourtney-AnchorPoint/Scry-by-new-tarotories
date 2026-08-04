# SCRY by New Tarotories — Vision and TODO for Coding Agents

This is the source-of-truth product direction for autonomous coding agents working on SCRY.

Do not rebuild SCRY from scratch. Do not flatten it into a generic tarot app. Do not remove rooms, routes, decks, data models, or working fallbacks unless a replacement is already implemented and tested.

## Current source of truth

- Repository: `Kourtney-AnchorPoint/Scry-by-new-tarotories`
- Live app: `https://main.d9v72l1if77fe.amplifyapp.com`
- AWS Amplify app ID: `d9v72l1if77fe`
- AWS region: `us-east-1`
- Primary local project folder: `scry-modernized`
- Current direction: AWS Amplify, Cognito, AppSync/DynamoDB-style data, Lambda/API functions, S3 uploads, Stripe, analytics, and later mobile packaging.

## The product vision

SCRY by New Tarotories is a premium dark-cosmic spiritual toolkit. It is not just tarot. It is not just astrology. It is a modern witch’s toolkit for intuitive self-reflection, ritual, pattern recognition, and emotionally direct guidance.

SCRY should feel like opening a private mystical room on your phone:

- moody
- premium
- feminine but not childish
- emotionally honest
- spiritual but grounded
- cosmic, witchy, glassy, neon, intimate
- direct enough to tell the truth without sounding cruel

The app voice is a compassionate truth-teller:

- no fake mystical filler
- no generic “the universe has your back” mush
- no sterile chatbot tone
- no pretending AI is an actual dead person, deity, doctor, therapist, or legal/financial adviser
- lived-experience honesty, recovery-aware, single-mom-real-talk energy
- guidance should feel personal, specific, reflective, and useful

Brand identity:

- Product: `SCRY`
- Creator brand: `New Tarotories`
- Tagline: `Exploring the Unknown`
- Core palette:
  - Background: `#07070F`
  - Panel: `#100C1A`
  - Border: `#2A1F3D`
  - Magenta: `#D4159A`
  - Purple: `#8844E8`
  - Cyan: `#10D8F0`
  - Teal accents
  - Gold accents
  - Primary text: `#E8E8F0`
  - Muted text: `#888899`

## Agent rules

Autonomous agents must follow these rules:

1. Do not rewrite the app from scratch.
2. Do not remove existing app rooms.
3. Do not reintroduce Base44 dependencies.
4. Do not hardcode secrets, Stripe keys, AWS keys, OpenAI/Anthropic keys, or private credentials.
5. Do not commit generated build folders, zip deployment packages, browser screenshots, logs, or local environment files.
6. Do not expose private journal text, private user questions, raw saved readings, payment details, or secrets in analytics.
7. Do not use AI to calculate astrology positions. Deterministic code calculates planets, houses, aspects, rising signs, transits, and timing. AI may interpret verified chart data only.
8. Do not make anonymous users access app rooms. Current decision: signed-out users should only reach login and legal pages.
9. Do not delete working fallback behavior unless a real backend replacement is live and tested.
10. Make small, reviewable commits.
11. Run a production build before claiming code is done.
12. If unsure, add a TODO or open an issue. Do not “simplify” by deleting product depth.

## Current access decision

Earlier planning allowed public previews. The current owner decision supersedes that:

- Public: `/login`, `/privacy`, `/terms`
- Requires sign-in: everything else

Routes that require sign-in include:

- `/`
- `/tarot`
- `/oracle`
- `/astrology`
- `/numerology`
- `/pendulum`
- `/premium`
- `/channeled`
- `/downloads`
- `/journal`
- `/account`
- `/tarot/history`
- `/altar`
- `/insights`
- `/shared/:id`

The app may have a marketing website/storefront later, but the in-app spiritual rooms should not be browsable while signed out.

## Main rooms and required feature set

### 1. The Room / Dashboard

The Room is the daily ritual hub. It should feel like the user enters their personal cosmic room for the day.

Required:

- date
- moon phase
- daily affirmation
- daily tarot card
- daily oracle card
- crystal of the day
- spell or ritual of the day
- numerology of the day
- sacred geometry symbol
- daily astrology/transit energy
- color of the day
- visual omen to look for
- digital candle
- quick links into main tools
- stable daily rotation
- fallback content if AI/backend fails

The dashboard must never appear as a blank frame or permanent loading screen.

Daily astrology language must answer:

- What is happening in the sky?
- What does it mean collectively?
- How could it affect the user?
- How could it affect relationships/people around them?
- Is it applying, peaking, or separating?
- What should the user do or stop doing?
- What visual omens or everyday patterns might show up?

### 2. Tarot

Tarot is a core feature.

Required:

- deck selection
- spread selection
- shuffle/draw interaction
- card reveal/flip
- optional reversals
- one synthesized reading using all drawn cards
- listen/audio button
- save reading
- share reading
- new reading/draw again
- saved history
- premium advanced spreads

The result screen should focus on the synthesis. Do not repeat the same card meanings underneath if the synthesis already explains them.

Desired spreads:

- single card
- three-card spread
- past/present/future
- love/relationship
- self-love
- message from them
- shadow work
- full moon
- Celtic Cross
- career
- pick-a-pile
- combined Tarot + Oracle

### 3. Oracle

Oracle should feel distinct from Tarot, but able to combine with Tarot.

Required:

- deck selection
- one-card draw
- three-card draw
- synthesized oracle reading
- listen/audio button
- save
- share
- draw again
- no overlapping card text
- no repeated meaning blocks under the synthesis

Deck direction:

- Lunar Oracle
- Constellation Oracle
- Element Oracle
- Recovery Oracle
- Messages Oracle
- Spell Oracle as archived/source material or future expansion

### 4. Channeled Messages

This feature should be called Channeled Messages, not Downloads.

Required:

- route `/channeled`
- old `/downloads` redirects to `/channeled`
- message type choices
- grounded safety copy
- clean human-readable output, never raw JSON/code
- fallback message if AI fails
- optional follow-up question
- save
- share
- listen/audio

Guardrails:

- Do not claim certainty about the dead, medical outcomes, legal outcomes, pregnancy, death, or danger.
- Do not frame generated text as guaranteed truth.
- Keep the voice spiritually meaningful but grounded.

### 5. Astrology

Astrology must be deterministic first, interpreted second.

Required:

- birth data form
- worldwide birthplace support
- unknown birth time support
- birth chart
- Big Three
- planets
- houses
- aspects
- current transits
- daily horoscope/personal sky
- Pattern Feel / Pattern Layers
- compatibility
- synastry
- connection saving
- shareable relationship reading

Important:

- AI may interpret chart data.
- AI must not invent chart data.
- Location errors should tell users exactly how to fix the input.
- ZIP/postal code must not be required because the app should support worldwide users.

### 6. Numerology

Required:

- full birth name
- birth date
- Life Path
- Destiny/Expression
- Soul Urge
- Personality
- Birthday number
- Personal Year
- Personal Month
- compatibility later
- save result
- listen/audio later
- premium deeper reading

Numerology should gracefully produce local fallback text if AI/backend is down.

### 7. Pendulum

Required:

- yes/no/unclear responses
- varied results
- not a visible deterministic pattern
- short supporting message specific to the question
- local history
- clear disclaimer that this is reflection, not commandment

Target response mix:

- about 45% yes
- about 45% no
- about 10% unclear

The response should never be generic like “keep your eyes open” every time.

### 8. Journal / Grimoire

Required:

- private journal entries
- save reflections
- attach readings to reflections
- search/filter later
- mood tags later
- grimoire/spellbook sections
- cloud sync through authenticated user account

Privacy:

- The owner should not casually read raw private journal text.
- If a future admin tool exposes user content, the privacy policy must explicitly say so and the product must intentionally support it.

### 9. Altar Workspace

Required:

- personal altar cards
- uploaded artwork/images
- ritual/spell workspaces
- candles/crystals/symbols
- saved layouts later
- S3-backed uploads
- owner-controlled artwork manager later

### 10. Premium / Subscription

Current Stripe state is not finished. Do not trust old Base44 Stripe functions.

Required:

- Stripe monthly plan
- Stripe annual plan
- optional trial
- Checkout
- Customer Portal
- webhook Lambda with signature verification
- server-side premium status
- manual premium grants
- premium expiration dates
- audit log for premium grants/revocations
- cancelled/failed payment handling
- renewal handling

Pricing direction from planning:

- monthly: `$9.99`
- annual: `$80`
- possible 3-day trial

Owner must be able to grant premium to any user manually whenever she chooses.

### 11. Account

Required:

- Cognito signup
- email confirmation
- sign in
- sign out
- password reset
- profile
- birth data
- subscription state
- billing portal
- data export
- account deletion request

### 12. Owner Studio / Admin Room

This is a major priority.

Build private owner-only pages for:

- users
- manual premium grants
- premium expiration dates
- grant/revoke audit log
- subscriptions
- revenue
- failed payments
- cancellations
- analytics and conversion funnels
- deck/card/spread management
- art uploads and card backs
- daily dashboard content
- spells/grimoire content
- songs and Spotify/YouTube links
- blog posts
- announcements
- products/storefront
- ads and placements
- shared-reading moderation
- error monitoring

The owner wants broad visibility into the business. Give visibility into metadata and usage, but be careful with private content.

### 13. Analytics

The owner wants to know what happens on the site/app.

Track:

- authenticated visits
- sessions
- device/browser
- traffic source when available
- signup funnel
- login success/failure
- feature starts
- feature completions
- tarot deck/spread/type
- oracle deck/spread/type
- channeled message type
- numerology calculation
- astrology chart/transit/synastry usage
- pendulum usage
- save actions
- share actions
- listen/audio actions
- paywall impressions
- checkout starts
- checkout completions
- subscription status changes
- cancellations
- failed payments
- manual premium grants
- errors
- retention

Do not track:

- raw journal text
- exact private questions
- payment card details
- secrets
- private credentials

### 14. Sharing

Required:

- native share when supported
- copy caption
- email
- Facebook
- X/Twitter
- Threads
- TikTok/Instagram caption copy
- share links for chosen readings only

Do not make all saved private readings public. A share action exposes only that selected share artifact.

### 15. Audio / Listen

Required:

- users should be able to listen to readings/text
- audio should work on Tarot, Oracle, Channeled Messages, Numerology, Astrology interpretations, and premium readings over time
- do not block the main reading if audio fails

### 16. Marketing Website / Storefront

Still needed.

Required:

- landing page
- product tour
- pricing
- about New Tarotories / Kourtney
- FAQ
- contact/support
- privacy
- terms
- account deletion instructions
- blog
- store/products
- SEO metadata
- social preview cards
- app download/install CTA
- Google Play links when ready

Recommendation:

- Keep app, account, premium, analytics, and storefront under one AWS-backed architecture if possible.
- Wix can be used for a brochure/storefront, but it may split the business into two systems and create duplicate account/data headaches.

### 17. Ads

Possible future feature.

Rules:

- free tier can show ads later
- premium is ad-free
- ads should not interrupt the sacred reading moment
- owner should control placements from Owner Studio

### 18. Mobile app / Google Play

Required before production mobile launch:

- mobile-safe scrolling
- safe-area spacing
- no buttons covered by nav bars
- PWA install flow
- Android Trusted Web Activity or Capacitor wrapper
- app icons
- splash screens
- screenshots
- store listing
- internal testing
- closed testing
- production rollout
- `assetlinks.json`
- signing key backed up securely

## What is already working or partially working

- AWS Amplify hosting
- GitHub repo connected as source control
- dark cosmic React app shell
- forced dark mode
- Cognito-style login page
- signed-out users redirected to login for app rooms
- dashboard fallback content
- Tarot page with synthesis-focused results
- Oracle page with cleaner result spacing
- Channeled Messages route and JSON/code cleanup/fallback
- Numerology fallback behavior
- Pendulum varied local behavior
- mobile navigation and safe-area improvements
- PWA manifest/icons
- share helpers for Tarot/Oracle
- local build and manual AWS deploy packaging

## Known unfinished backend work

Replace remaining fragile/local/fallback behavior with real AWS services:

- real Cognito session enforcement everywhere
- real user profile persistence
- DynamoDB/AppSync models finalized
- saved readings across devices
- journal cloud sync
- altar upload to S3
- artwork upload/management
- owner/admin permissions
- Stripe checkout
- Stripe portal
- Stripe webhook
- premium enforcement server-side
- analytics dashboard
- error monitoring
- daily content generation/cache
- astrology calculation verification
- AI prompt and response hardening

## Priority TODO list

### P0 — Stabilize source, auth, and deploy flow

- [x] Push project to GitHub.
- [x] Deploy latest build to AWS Amplify.
- [x] Lock app rooms behind sign-in.
- [ ] Connect Amplify hosting to the GitHub repo instead of manual ZIP deploys.
- [ ] Add a normal CI build check on GitHub.
- [ ] Add `.env.example` with safe placeholder variables.
- [ ] Review `amplify_outputs.json` and confirm whether API-key auth should remain committed or be generated per environment.
- [ ] Remove any remaining Base44-specific runtime dependencies.
- [ ] Add a clear developer README section for local setup/build/deploy.

### P1 — Stripe and premium

- [ ] Create Stripe products/prices for monthly and annual.
- [ ] Build AWS Checkout Session function.
- [ ] Build AWS Customer Portal function.
- [ ] Build Stripe webhook Lambda.
- [ ] Store subscription state server-side.
- [ ] Build premium entitlement checks.
- [ ] Build owner manual premium grants.
- [ ] Build premium grant audit log.
- [ ] Test Stripe end-to-end in test mode.
- [ ] Switch to live Stripe only after test-mode walkthrough is clean.

### P1 — Owner Studio

- [ ] Add owner-only route `/owner`.
- [ ] Add owner role/group enforcement.
- [ ] Build user search/list.
- [ ] Build user detail page.
- [ ] Build grant/revoke premium controls.
- [ ] Build analytics overview.
- [ ] Build error/event logs.
- [ ] Build content management shell for cards, decks, spells, songs, blog, announcements, and art.

### P1 — Analytics

- [ ] Finalize event schema.
- [ ] Track authenticated visits only.
- [ ] Track feature starts/completions.
- [ ] Track save/share/listen actions.
- [ ] Track paywall and checkout funnel.
- [ ] Track subscription changes.
- [ ] Track errors.
- [ ] Build owner dashboard.
- [ ] Add privacy-safe filtering so raw private content is not logged.

### P1 — Data persistence

- [ ] Confirm/create DynamoDB/AppSync models for users, profiles, readings, journals, altar cards, connections, shared readings, app events, premium grants, content items, and products.
- [ ] Ensure every user-owned record has server-side ownership enforcement.
- [ ] Add account deletion flow.
- [ ] Add data export flow.
- [ ] Migrate local-only journal behavior to cloud storage.

### P2 — Reading engine

- [ ] Build unified reading builder: Tarot, Oracle, or Tarot + Oracle.
- [ ] Wire deck selector into Tarot.
- [ ] Wire all Oracle decks.
- [ ] Add combined Tarot + Oracle synthesis.
- [ ] Add premium spreads.
- [ ] Add usage limits.
- [ ] Add server-side limit enforcement.
- [ ] Make “draw again” create a fresh draw and fresh synthesis.
- [ ] Save reading metadata and content for authenticated users.

### P2 — Astrology

- [ ] Verify deterministic birth chart calculations.
- [ ] Verify timezone handling.
- [ ] Verify unknown birth time behavior.
- [ ] Verify worldwide birthplace support.
- [ ] Implement current transits.
- [ ] Implement Pattern Feel / Pattern Layers.
- [ ] Implement compatibility/synastry fully.
- [ ] Add personal transit interpretation from verified data.
- [ ] Add daily collective sky interpretation from verified data.

### P2 — Dashboard daily engine

- [ ] Build date-seeded daily content selection.
- [ ] Cache daily content in backend.
- [ ] Prevent recent repeated cards/crystals/colors/omens.
- [ ] Connect moon phase and current sky data.
- [ ] Add owner override/scheduling later.
- [ ] Add Spotify/YouTube song links only when useful.

### P2 — Audio/listen

- [ ] Confirm current text-to-speech approach.
- [ ] Make listen buttons consistent across tools.
- [ ] Add fallback if speech fails.
- [ ] Consider premium-only long-form audio.

### P3 — Content, website, store, mobile

- [ ] Build marketing website.
- [ ] Build blog.
- [ ] Build storefront/products.
- [ ] Add support/contact.
- [ ] Add SEO/social previews.
- [ ] Add ads architecture for free users.
- [ ] Prepare PWA install.
- [ ] Prepare Google Play wrapper/listing/testing.

## Definition of done for agents

A task is not done until:

- the requested behavior works locally
- production build passes
- private data is not exposed
- no secrets are committed
- mobile layout is not obviously broken
- the change is committed to Git
- the commit message clearly says what changed
- if deployed, the live URL is checked

## Best next tasks for Jules

If using Jules or another autonomous coding agent, assign one bounded task at a time:

1. Connect Amplify to GitHub and document deployment flow.
2. Add `.env.example` and clean README setup instructions.
3. Build `/owner` shell with owner-only route guard.
4. Build manual premium grants in backend and UI.
5. Build Stripe Checkout in test mode.
6. Build analytics event dashboard shell.
7. Finish cloud saved readings.
8. Finish journal cloud sync.
9. Verify astrology calculations.
10. Build unified Tarot + Oracle reading builder.

Do not give Jules “rebuild the app.” Give Jules one precise task, one branch, one PR.
