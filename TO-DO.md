# Tomorrow — Human To-Do

The app is fully built and functional. Here's what you need to wire up to go live:

## Firebase Setup
- [ ] Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Authentication** → Email/Password provider
- [ ] Enable **Firestore Database** → Create database in production mode
- [ ] Add Firestore security rules (see below)
- [ ] Replace values in `src/firebase/config.js`:
  - `apiKey`
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - `appId`

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /letters/{letterId} {
      // Anyone can read a delivered/opened letter (public claim page)
      // but only the sender can read their own letters
      allow read: if resource.data.status in ['delivered', 'opened']
                  || (request.auth != null && resource.data.senderId == request.auth.uid);
      allow create: if request.auth != null
                    && request.resource.data.senderId == request.auth.uid;
      allow update, delete: if request.auth != null
                              && resource.data.senderId == request.auth.uid
                              && resource.data.status == 'draft';
    }
  }
}
```

## Resend (Email)
- [ ] Create a [Resend](https://resend.com) account
- [ ] Add a domain (e.g. `tomorrow.app`) or verify individual emails
- [ ] Create an API key
- [ ] Replace `YOUR_RESEND_API_KEY` in `src/lib/email.js`
- [ ] Update `RESEND_FROM_EMAIL` to your verified sender

## Deployment
- [ ] Deploy to Vercel, Netlify, or Cloudflare Pages
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Configure environment variables for Firebase and Resend keys

## Scheduling / Cloud Functions
For Phase 1, letters are dispatched immediately on seal. For proper scheduled delivery:
- [ ] Set up a **Supabase** project (alternative to Firebase for scheduling)
- [ ] Or use **Firebase Cloud Functions** with a cron trigger (`0 9 * * *`)
- [ ] Query Firestore for letters where `deliverAt <= now` and `status == 'sealed'`
- [ ] Send email via Resend, then update letter status to `delivered`

## Branding
- [ ] **Logo** — Create a brand mark / wordmark for "Tomorrow"
- [ ] **Favicon** — Replace the emoji favicon with a proper SVG
- [ ] **Domain** — Register `tomorrow.app` (or similar)
- [ ] **Email template** — The HTML email in `src/lib/email.js` works but could use more design polish

## Optional
- [ ] Apple Developer account (if building an iOS app later)
- [ ] Wax seal SVG asset for the envelope animation
- [ ] Analytics (PostHog, Plausible, etc.)
- [ ] Error monitoring (Sentry)
