# NutriSmart — Complete App Redesign & Premium Launch

**Date:** 2026-05-08
**Status:** Draft
**Approach:** Option C — AI-First + Content Depth ("The Complete Package")

## Overview

Transform the existing NutriAI React Native app into **NutriSmart** — a subscription-based fitness and nutrition platform targeting fitness beginners. The app combines Claude-powered AI coaching with a deep curated content library of 200+ recipes and structured workout programs.

**Business model:** Freemium with one premium tier ($12.99/mo or $99.99/yr)
**Target audience:** Fitness beginners — people just starting their health journey who need guidance and simplicity
**Core value proposition:** "A personal nutritionist + trainer in your pocket"
**Timeline philosophy:** Build it right — quality over speed, no shortcuts

---

## 1. Feature Architecture

### 1.1 Free Tier — "Get Started"

Goal: Give enough value that users form a habit, then hit a natural ceiling that makes upgrading obvious.

**Nutrition:**
- Manual meal logging (calories + macros)
- 15 curated recipes (rotating weekly)
- Basic pantry tracking
- Daily macro ring dashboard

**Fitness:**
- 2 workout types (Full Body, Cardio HIIT)
- Basic workout logging
- Daily step count (HealthKit read)

**Tracking:**
- Water intake logging
- Weight logging (manual)
- Daily streak + gamification
- 7-day history view

**Limits:**
- No AI features
- No structured programs (except Healthy Habits Kickstart)
- No advanced analytics (30/90/365 day views)
- No HealthKit write
- No progress photos

### 1.2 Premium Tier — "NutriSmart Pro" ($12.99/mo or $99.99/yr)

**AI Coaching (Claude API):**
- **AI Chat Coach** — ask nutrition/fitness questions 24/7
- **AI Meal Plans** — weekly plans generated from 200+ recipe library, adapted to goals, dietary preferences, and pantry contents
- **Smart Meal Suggestions** — "What should I eat right now?" based on remaining daily macros
- **AI Workout Adaptation** — adjusts intensity/exercises based on progress and feedback

**Content Library:**
- 200+ recipes with full nutrition data, photos, and step-by-step instructions
- Structured programs — 4–12 week guided journeys (Beginner Fat Loss, Lean Muscle, Healthy Habits, Cardio Endurance)
- All 4 workout types + program-specific routines
- Auto-generated shopping lists from weekly meal plans

**Advanced Analytics:**
- Weekly AI Insights — "You averaged 1800 cal this week, here's what to adjust"
- Trend charts — weight, macros, calories over 30/90/365 days
- Body composition estimates — BMI, body fat %, lean mass tracking
- Full HealthKit sync — read AND write meals, workouts, weight
- Progress photos — side-by-side comparison with timeline

**Premium Perks:**
- No ads (if ads are added to free tier later)
- Priority support
- Early access to new features
- Custom macro targets — override calculated goals
- Export data — CSV/PDF reports

### 1.3 Paywall Trigger Points

Where free users naturally encounter the upgrade prompt:
- **After logging 3 days of meals** — "You're building a habit! Unlock AI-powered meal plans to hit your goals faster."
- **When tapping a locked recipe** — preview the photo + ingredients, blur the instructions
- **When opening AI Chat** — show 1 free sample response, then paywall
- **When viewing 7-day analytics** — show the chart, gate 30/90/365 day views
- **After completing a workout** — "Want a personalized program? Upgrade to Pro."

---

## 2. AI Architecture

### 2.1 System Design

All AI calls route through Firebase Cloud Functions. The Claude API key never touches the client.

```
React Native App
  → AI Service Layer (formats prompts, manages history, handles streaming)
  → HTTPS callable functions
  → Firebase Cloud Functions: AI Gateway
    1. Verify Firebase Auth token
    2. Check subscription status (active?)
    3. Rate limit (token bucket per user)
    4. Build prompt (system + user context + conversation history + request data)
    5. Call Claude API (Sonnet or Haiku based on task)
    6. Validate response (safety filter)
    7. Log usage for cost tracking
    8. Return to client
```

### 2.2 Model Routing

| Feature | Model | Rationale |
|---------|-------|-----------|
| AI Chat Coach | Sonnet | Complex reasoning, conversational quality |
| AI Meal Plans | Sonnet | Multi-constraint optimization (goals + diet + pantry + preferences) |
| Smart Suggestions | Haiku | Simple lookup, fast response needed |
| Weekly Insights | Sonnet | Analytical summary requiring data synthesis |
| Workout Adaptation | Haiku | Pattern-based adjustments, lower complexity |

### 2.3 Rate Limits & Cost Controls

| Feature | Rate Limit | Cache Strategy |
|---------|-----------|---------------|
| AI Chat | 30 messages/day | No (conversational) |
| Meal Plan Generation | 1/week + 2 regenerates | Cached for the week |
| Smart Suggestions | 10/day | Same macros = same result |
| Weekly Insights | 1/week (scheduled) | Generated once on Sunday |
| Workout Adaptation | After each completed workout | No (needs latest data) |

### 2.4 Safety Guardrails

System prompt includes strict rules:
- No medical diagnoses
- No extreme calorie advice (<1200 cal/day)
- No supplement recommendations
- Always suggest consulting a doctor for health concerns
- Response filter catches violations before reaching client

### 2.5 Conversation History Management

- Chat history stored in Firestore: `/users/{uid}/ai-chats/{chatId}/messages`
- Rolling window: last 10 messages sent as context to Claude
- Topic threads: users can start new chat threads (meal planning, general questions, workout help)
- Auto-expire: chat history older than 90 days archived/deleted
- Included in GDPR data export

### 2.6 PII Protection

- User data sent to Claude uses anonymized identifiers, never names or emails
- Prompt injection protection: user input sanitized before inclusion in prompts
- AI usage audit log in Firestore for abuse detection

### 2.7 Cost Estimates

**Per premium user per month:**
- Typical user: ~$0.30–0.60
- Heavy user: ~$1.00–2.00

**Margin at $12.99/mo:**
- Average user: ~$8.64 (66%) after API costs + Apple's 30% cut
- Heavy user: ~$7.59 (58%)
- Year 2+ (Apple drops to 15%): ~$10/user/mo

---

## 3. Subscription & Payment Infrastructure

### 3.1 Technology: RevenueCat

RevenueCat handles StoreKit 2 integration, receipt validation, entitlement management, subscription lifecycle, and analytics. Free up to $2,500/mo in tracked revenue, then 1%.

### 3.2 Products (App Store Connect)

| Plan | Price | User Revenue (Yr 1) | User Revenue (Yr 2+) |
|------|-------|--------------------|--------------------|
| Monthly | $12.99/mo | ~$9.09/mo | ~$11.04/mo |
| Annual | $99.99/yr (~$8.33/mo, 36% savings) | ~$69.99/yr | ~$84.99/yr |

### 3.3 Free Trial Strategy

- 7-day free trial on first subscription (monthly or annual)
- No payment upfront — Apple handles trial-to-paid conversion
- Trial reminder: local notification on day 5
- Onboarding during trial: guided walkthrough of AI Chat, Meal Plans, and Programs
- Introductory offer: first month at $6.99

### 3.4 Entitlement Flow

```
User taps premium feature
  → RevenueCat SDK checks customerInfo.entitlements["pro"].isActive
  → If YES: allow access
  → If NO: show PaywallScreen
    → User purchases
    → RevenueCat → App Store → receipt validated
    → RevenueCat webhook → Firebase Cloud Function
    → Firestore: /users/{uid} → { subscription: { status: "pro", expiresAt: ... } }
    → AI Gateway checks Firestore sub status on every call
```

### 3.5 Edge Cases

**Subscription Lapses:**
- Grace period: 16 days (Apple default) — user retains access
- After lapse: downgrade to free, keep all logged data
- AI chat history preserved (read-only)
- Meal plans/programs paused, resume on resubscribe

**Restore & Multi-Device:**
- RevenueCat handles restore purchases automatically
- Same Apple ID = same entitlements across devices
- Firebase Auth links to RevenueCat app user ID

**Refunds & Cancellations:**
- RevenueCat webhook notifies on refund → Cloud Function revokes access
- Cancellation: access continues until period ends
- Win-back: push notification with special offer after 30 days

**Offline & Connectivity:**
- RevenueCat caches entitlements locally — works offline
- Premium features that need AI show "offline" state gracefully
- Cached meal plans and programs accessible offline
- Queued actions sync when connectivity returns

---

## 4. Security Architecture

### 4.1 Layer 1: Device Security

- **Biometric lock**: Optional Face ID / Touch ID on app launch via `react-native-biometrics`
- **Keychain storage**: Migrate auth tokens from AsyncStorage → iOS Keychain via `react-native-keychain` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`
- **Certificate pinning**: On all HTTPS connections
- **Jailbreak detection**: Warn user, disable sensitive features
- **Screenshot protection**: Blur app content on app switch (no sensitive data in screenshots)
- **Auto-lock**: After 5 minutes in background

### 4.2 Layer 2: Authentication & Session Management

- Firebase Auth (email, Google OAuth, Apple Sign-In) — already implemented
- Short-lived ID tokens (1hr) with automatic refresh
- Force re-authentication for sensitive actions (delete account, export data, change email/password)
- Session invalidation on password change
- Login anomaly detection (new device → email alert)

### 4.3 Layer 3: Network Security

- **Firebase App Check**: DeviceCheck attestation on iOS — proves requests come from the real app
- All Cloud Functions require valid App Check token
- Rate limiting on all endpoints (per-user token bucket)
- Request signing to prevent replay attacks
- No sensitive data in URL parameters (POST bodies only)

### 4.4 Layer 4: Data Security

- Firestore rules: owner-only read/write on all user data (already implemented, needs hardening)
- Encryption at rest: Firebase default AES-256
- **Field-level encryption** for sensitive health data: weight, body fat %, health conditions, AI chat logs
- Encrypted with user-specific key derived from Firebase UID
- AI prompts sanitized: no PII sent to Claude API (anonymized identifiers only)

### 4.5 Layer 5: Compliance & Privacy

- **GDPR**: Data export (already built), right to deletion (already built), consent management
- **HIPAA-adjacent**: BAA with Google Cloud/Firebase, encryption at rest + in transit (TLS 1.3), access logging
- **App Store Privacy Nutrition Label**: Data linked to user (email, name, user ID, health/fitness data, usage data), no third-party ad tracking
- Privacy policy + Terms of Service (in-app + website)
- Data retention: auto-delete inactive accounts after 2 years, chat history after 90 days

### 4.6 Firestore Rules Hardening

| Rule | Current | Needed |
|------|---------|--------|
| App Check enforcement | Missing | Add `request.appCheck.token` validation |
| AI chat collection rules | N/A (new) | Owner-only, max message size 2KB |
| Subscription status | N/A (new) | Read-only for client (webhook writes only) |
| Rate limiting metadata | Cloud Fn only | Deny client writes to rate-limit docs |
| Write timestamps | Partial | Enforce `request.time` on all writes |

### 4.7 Penetration Testing

- Conduct before App Store submission
- Annual security review cadence
- Third-party audit recommended before crossing 10,000 users

---

## 5. Visual Design System

### 5.1 Design Direction

Glassmorphism as the primary aesthetic with bold vibrant gradients for energy. Full light + dark mode support. Every surface feels like frosted glass floating over a rich background.

### 5.2 Color Palette

**Dark Mode Backgrounds:** Deep navy-black with purple undertones
- `#0C0C1A` (deepest), `#161628`, `#1E1E35`, `#2A2A45`

**Light Mode Backgrounds:** Soft lavender-white with cool undertones
- `#FFFFFF`, `#F2F2F7`, `#E8E8F0`, `#D8D8E5`

**Accent Gradients (shared across modes):**
- **Primary** (CTAs, success): `#34C759 → #30D158 → #00C9A7` (green → teal)
- **Premium** (Pro badges, AI): `#A78BFA → #818CF8 → #6366F1` (purple → indigo)
- **Energy** (streaks, workouts): `#F97316 → #F59E0B → #FBBF24` (orange → amber)
- **Intensity** (calories, alerts): `#EC4899 → #F43F5E → #EF4444` (pink → red)
- **Hydration** (water): `#06B6D4 → #3B82F6 → #6366F1` (cyan → blue)
- **Protein**: `#A78BFA → #C084FC`
- **Carbs**: `#F5C060 → #FBBF24`
- **Fat**: `#F08050 → #F97316`

### 5.3 Glassmorphism Specifications

| Level | Usage | Background | Blur | Border | Shadow |
|-------|-------|-----------|------|--------|--------|
| Surface | Sections, containers | rgba(255,255,255, 0.06) | 16px | 1px rgba(255,255,255, 0.08) | None |
| Elevated | Modals, sheets | rgba(255,255,255, 0.10) | 24px | 1px rgba(255,255,255, 0.12) | None |
| Floating | Popovers, tooltips | rgba(255,255,255, 0.15) | 32px | 1px rgba(255,255,255, 0.18) | 0 8px 32px rgba(0,0,0,0.3) |

**Light mode glassmorphism values:**

| Level | Usage | Background | Blur | Border | Shadow |
|-------|-------|-----------|------|--------|--------|
| Surface | Sections, containers | rgba(255,255,255, 0.70) | 16px | 1px rgba(255,255,255, 0.50) | 0 2px 8px rgba(0,0,0,0.04) |
| Elevated | Modals, sheets | rgba(255,255,255, 0.80) | 24px | 1px rgba(255,255,255, 0.60) | 0 4px 16px rgba(0,0,0,0.06) |
| Floating | Popovers, tooltips | rgba(255,255,255, 0.90) | 32px | 1px rgba(255,255,255, 0.70) | 0 8px 32px rgba(0,0,0,0.10) |

### 5.4 Typography

SF Pro Display (headlines) + SF Pro Text (body) — iOS system fonts with explicit weight control.

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 28pt | Black (900) | Screen titles, hero numbers |
| Headline | 22pt | Bold (700) | Section headers, card titles |
| Subhead | 17pt | Semibold (600) | Labels, button text |
| Body | 15pt | Regular (400) | Descriptions, instructions |
| Caption | 13pt | Regular (400) | Timestamps, secondary info |

### 5.5 Micro-interactions & Animation

**Screen Transitions:**
- Shared element transitions between recipe cards → detail
- Spring-based tab switching (react-native-reanimated)
- Parallax scroll on dashboard hero section

**Feedback Animations:**
- Macro ring fills with smooth easing on meal log
- Confetti burst on streak milestones (7, 30, 100 days)
- Haptic feedback on all interactive elements

**Loading States:**
- Shimmer skeleton cards (upgrade existing SkeletonCard)
- AI response: typing indicator with pulsing dots
- Pull-to-refresh with custom branded animation

**Premium Touches:**
- Gradient border animation on Pro badge
- Glass card hover/press states with subtle glow
- Smooth number counting on dashboard stats

### 5.6 Component Library Upgrades

| Component | Current | Upgrade |
|-----------|---------|---------|
| Card | Solid background | Glassmorphism with 3 elevation levels |
| Button | Pill with solid fill | Gradient fill + glass secondary variant |
| DottedRing | Dotted circle | Gradient-stroked ring with glow effect |
| Bottom Sheet | Basic modal | Glass sheet with handle bar + spring animation |
| Tab Bar | Standard bottom tabs | Floating glass tab bar with animated indicator |
| Toast | Persistent message | Glass toast with slide-in + auto-dismiss |
| Navigation | Standard header | Transparent header with blur background on scroll |

### 5.7 New Dependencies

- `react-native-reanimated` — spring animations, shared element transitions, layout animations
- `@react-native-community/blur` — native iOS blur for glassmorphism
- `react-native-linear-gradient` — gradient fills for buttons, rings, backgrounds
- `react-native-gesture-handler` — swipe gestures, bottom sheet interactions
- `lottie-react-native` — complex animations (confetti, onboarding, loading)

---

## 6. Content & Data Architecture

### 6.1 Firestore Schema — Complete

```
firestore/
├── /users/{uid}/
│   ├── profile                          — existing (expanded)
│   │   + subscription: { status, plan, expiresAt, rcUserId }
│   │   + security: { biometricEnabled, lastLogin, devices[] }
│   ├── /pantry/{doc}                    — existing
│   ├── /meals/{mealId}                  — existing
│   ├── /workouts/{workoutId}            — existing
│   ├── /water/{dateDoc}                 — existing
│   ├── /weightLog/{entryId}             — existing
│   ├── /streaks/{doc}                   — existing
│   ├── /ai-chats/{chatId}/             — NEW
│   │   ├── metadata                     — title, createdAt, lastMessageAt, topic
│   │   └── /messages/{msgId}            — role, content, model, tokens, timestamp
│   ├── /meal-plans/{weekId}/            — NEW
│   │   ├── metadata                     — weekStart, generatedAt, regeneratesUsed
│   │   └── /days/{dayName}              — breakfast, lunch, dinner, snacks (recipe refs)
│   ├── /program-progress/{programId}    — NEW
│   │   — currentWeek, completedWorkouts[], startedAt, status
│   ├── /insights/{weekId}               — NEW
│   │   — summary, macroAvg, calorieAvg, recommendations[], generatedAt
│   ├── /progress-photos/{photoId}       — NEW
│   │   — imageUrl, date, notes, bodyweight
│   └── /ai-usage/{monthId}             — NEW (cost tracking)
│       — chatTokens, mealPlanTokens, insightTokens, totalCost
│
├── /recipes/{recipeId}                  — existing (migrated from data.js)
│   ├── name, description, category, cuisine
│   ├── prepTime, cookTime, servings, difficulty
│   ├── calories, protein, carbs, fat
│   ├── ingredients[]: { name, amount, unit, optional }
│   ├── instructions[]: { step, text, duration? }
│   ├── tags[]: "high-protein", "low-carb", "vegan", "quick", etc.
│   ├── imageUrl, thumbnailUrl
│   ├── dietaryFlags: { vegan, vegetarian, glutenFree, dairyFree, nutFree }
│   ├── premium: boolean
│   └── /reviews/{reviewId}              — existing
│
├── /programs/{programId}                — NEW
│   ├── name, description, difficulty, durationWeeks
│   ├── goal: "fat-loss" | "muscle-gain" | "healthy-habits" | "endurance"
│   ├── imageUrl, premium: boolean
│   ├── /weeks/{weekNum}/
│   │   └── /days/{dayNum}               — workoutRef, restDay, notes
│   └── /workouts/{workoutId}            — exercises[], sets, reps, duration
│
├── /shopping-lists/{uid}_{weekId}       — NEW
│   ├── items[]: { name, amount, unit, recipeSource, checked }
│   └── generatedAt, weekStart
│
└── /system/                             — NEW
    ├── /config                          — feature flags, maintenance mode, min app version
    └── /ai-prompts/{promptId}           — versioned system prompts (hot-swappable)
```

### 6.2 Recipe Database Migration

**Current:** 40 hardcoded recipes in `data.js` (881 lines), no images, no premium gating, no search/filter/pagination.

**Target:** 200+ recipes in Firestore with full nutrition data, real food photography, tagged and filterable, paginated (20 per page), 15 free + 185+ premium.

**Migration strategy:**
1. Seed script — Cloud Function to batch-write existing 40 recipes to Firestore with proper schema
2. Content expansion — Use Claude API (offline batch) to generate 160+ additional recipes with accurate macros
3. Image pipeline — Source food photography from Unsplash API or AI-generated, store thumbnails in Firebase Storage
4. Remove data.js — App reads exclusively from Firestore with local caching

### 6.3 Structured Programs

| Program | Duration | Workouts/Week | Diet Focus | Tier |
|---------|----------|--------------|------------|------|
| Beginner Fat Loss | 8 weeks | 3 | Calorie deficit | Premium |
| Lean Muscle Building | 12 weeks | 4 | High protein surplus | Premium |
| Healthy Habits Kickstart | 4 weeks | 2 | Balanced nutrition | **Free** |
| Cardio Endurance | 6 weeks | 4 | Performance/carb timing | Premium |

### 6.4 Cloud Functions — Complete

**Existing (6):**
- `moderateReview` — profanity filter
- `resetDailyStreaks` — midnight reset
- `onUserProfileCreated` — default fields
- `cleanupOrphanedData` — weekly orphan cleanup
- `submitReview` — rate-limited reviews
- `exportMyData` — GDPR export

**New (7):**
- `aiGateway` — proxy all Claude API calls with auth, sub check, rate limit, prompt building
- `generateMealPlan` — weekly AI meal plan from recipe DB + user profile
- `generateWeeklyInsights` — scheduled Sunday AI summary of user's week
- `handleSubscriptionWebhook` — RevenueCat webhook → Firestore sub status sync
- `generateShoppingList` — auto-generate from meal plan on creation
- `seedRecipes` — admin-only batch write recipes to Firestore
- `cleanupExpiredChats` — weekly deletion of AI chat messages older than 90 days

### 6.5 Screen Map

**Existing (14 screens — full glassmorphism redesign):**
DashboardScreen, PantryScreen, MealScreen, RecipeDetailScreen, MealLogScreen, WorkoutScreen, ActiveWorkoutScreen, ProfileScreen, WaterScreen, WeightScreen, SignInScreen, SignUpScreen, OnboardingScreen, WorkoutHistoryScreen

**New (11 screens):**
AIChatScreen, MealPlanScreen, ShoppingListScreen, ProgramsScreen, ProgramDetailScreen, AnalyticsScreen, InsightsScreen, ProgressPhotosScreen, PaywallScreen, SecuritySettingsScreen, SubscriptionScreen

### 6.6 Navigation Architecture

```
RootNavigator
├── AuthStack (unauthenticated)
│   ├── SignInScreen
│   ├── SignUpScreen
│   └── OnboardingScreen
│
├── MainTabs (authenticated) — 5 tabs
│   ├── HomeTab
│   │   ├── DashboardScreen
│   │   ├── MealLogScreen, WaterScreen, WeightScreen
│   │   ├── AnalyticsScreen (NEW)
│   │   └── InsightsScreen (NEW)
│   │
│   ├── MealsTab
│   │   ├── MealScreen, RecipeDetailScreen
│   │   ├── MealPlanScreen (NEW)
│   │   └── ShoppingListScreen (NEW)
│   │
│   ├── AITab (CENTER — gradient-highlighted icon)
│   │   └── AIChatScreen (NEW)
│   │
│   ├── FitnessTab (renamed from Workout)
│   │   ├── WorkoutScreen, ActiveWorkoutScreen, WorkoutHistoryScreen
│   │   ├── ProgramsScreen (NEW)
│   │   └── ProgramDetailScreen (NEW)
│   │
│   └── ProfileTab
│       ├── ProfileScreen, PantryScreen
│       ├── ProgressPhotosScreen (NEW)
│       ├── SecuritySettingsScreen (NEW)
│       └── SubscriptionScreen (NEW)
│
└── Modals
    └── PaywallScreen (NEW)
```

The AI tab sits center in the tab bar with a gradient-highlighted icon — the visual anchor point communicating "this app is AI-powered."

---

## 7. Technical Summary

### Current Stack (Unchanged)
- React Native 0.76.9
- Firebase (Auth, Firestore, Cloud Functions, Analytics, Crashlytics)
- React Navigation 6
- React Context API for state management

### New Dependencies
- `react-native-purchases` (RevenueCat SDK)
- `react-native-reanimated`
- `@react-native-community/blur`
- `react-native-linear-gradient`
- `react-native-gesture-handler`
- `lottie-react-native`
- `react-native-biometrics`
- `react-native-keychain`
- `@anthropic-ai/sdk` (server-side only, in Cloud Functions)

### Third-Party Services
- **Anthropic Claude API** — AI coaching (Sonnet + Haiku)
- **RevenueCat** — subscription management
- **Firebase** — auth, database, functions, analytics, crashlytics, storage, App Check
- **Apple HealthKit** — health data sync (already integrated)
