# CampConnect

Multi-campground service request PWA. Campers report a problem from their site, staff
work the queue, admins run the campground, and an owner account manages the whole
tenant list.

Live: https://androidbill.github.io/campconnect/

## What's in the repo

| File | What it is |
| --- | --- |
| `index.html` | The entire app — markup, styles and logic in one file, no build step |
| `service-worker.js` | Offline cache and update detection |
| `manifest.json` | PWA install metadata |
| `firestore.rules` | Firestore security rules (deploy separately, see below) |
| `icons/` | App icons and the About-screen logo |

## Roles

- **Camper** — logs in with site number + PIN. Submits requests with a service type,
  priority, optional photo and notes. Sees their own history. Five minute cooldown
  between requests, and the office can disable requests for a single site.
- **Staff** — works the request queue, assigns and completes jobs, uses note
  templates, chats with the team, looks up sites and resets camper PINs.
- **Admin** — manages sites, services (reorderable, with an icon picker), staff and
  admin accounts, announcements, themes, audit search, and analytics with CSV export.
- **Owner** — reached through the ⋮ menu under "Maintenance". Creates campgrounds,
  manages admins and owners, and exports across all campgrounds.

## Data and sync

State lives in Firestore under the `campconnectV2` root and is mirrored to
`localStorage` so the app keeps working offline. Every record carries `version`,
`lastUpdatedAt`, `lastUpdatedBy` and `active`. Writes go through `safeSetDoc()`, which
runs a transaction and refuses to save when the local version is behind the remote
one. Deletes are soft — `active` flips to `false` and the record stays.

If Firestore comes back empty the app deliberately disables remote writes rather than
seeding it, so a fresh device can never overwrite live data with starter content.

## Security, honestly

**Assume anything stored in this app is readable by anyone who opens the URL.**

Login is a client-side PIN comparison against data the app has already downloaded, so
the whole data set — including every PIN — has to be readable before anyone logs in.
Firebase anonymous auth is what fetches it. That is a property of the architecture, not
a bug in the rules, and no change to `firestore.rules` can close it while login works
this way.

What is in place:

- Default PINs (`0000`, `1234`, repeated digits, and similar) are rejected when
  creating or changing a staff, admin or owner account.
- A staff, admin or owner account that is still on a default PIN is forced to choose a
  new one before the login completes.
- Five failed logins for a given role and campground lock that form on the device for
  fifteen minutes. This is per-device and clearing site data resets it — it slows down
  casual guessing at a shared kiosk, nothing more.
- Session restore requires an exact, still-active account match.
- `firestore.rules` confines writes to the app's root collection, forbids hard
  deletes, and requires each write to carry a higher version than the stored one.

Closing the read hole properly means moving login to a Cloud Function that verifies
the PIN server-side and returns a custom token with a campground claim, then denying
unauthenticated reads. That is a rewrite of every read path and needs the Firebase
Blaze plan.

Camper PINs are intentionally left out of the weak-PIN check — they are assigned by
the office and forcing hundreds of sites through a PIN change would break the front
desk.

## Deploying

The app is served by GitHub Pages from `main`, so pushing to `main` deploys it.

Two things to remember on every change:

1. Bump `APP_VERSION` in `index.html` (format `YYYY.MM.DD.NN`). It shows in the home
   screen footer and the About dialog.
2. Bump `CACHE_NAME` in `service-worker.js`. Installed PWAs will not pick up new
   assets otherwise.

Navigations are network-first, so an online device gets new HTML on the next load, and
the app shows a "new version is ready" bar when the service worker finds an update.

Firestore rules are not deployed by Pages. Push them separately:

```bash
firebase deploy --only firestore:rules
```

## Photos

Request photos are stored as base64 data URLs on the request document. Firestore caps
a document at 1,048,576 bytes and base64 inflates a file by about a third, so uploads
are capped at 700 KB (`PHOTO_MAX_BYTES`).

## License

MIT — see [LICENSE](LICENSE).
