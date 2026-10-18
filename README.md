# Samridhi & Piyush — Illustrated invitation · v7

A mobile-first, cinematic invitation for **28 November 2026, 10:00 AM onwards, India Standard Time**, at The Cove, Sector 5, Panchkula. No build step, framework, account, or backend is required.

## The new experience

This is the Samridhi-first edition in `web-invite\v7-Samridhi-piyush`; all earlier versions are preserved. Samridhi's name comes first in the envelope letter, main heading, family introductions, page metadata, calendar entries, video caption, hashtag, and downloadable keepsake. The monogram is S&amp;P, and the family signoff lists Sharma before Kaushik. The existing character artwork, reunion choreography, ribbon-free envelope, music, date, time, and venue are unchanged. The matching supplied Samridhi_Piyush_Friends.mp4 film is used without editing its embedded titles. The blush-pink and powder-blue design retains a phone-first layout capped at 480 pixels even on a desktop, readable typography, 44–50 pixel touch targets, thumb-reachable navigation, and safe-area spacing.

Swipe up or down through five chapters: the beginning, an illustrated glimpse of the couple, the families, the celebration, and the closing invitation. Native momentum scrolling and CSS scroll snapping settle at each chapter while the same garden stays in place. The couple arrives from opposite sides and joins hands; a promise thread draws around them. Names drift apart, family introductions move in from the sides, the date emblem tilts into place, and the closing cards rise. Supporting browsers use CSS scroll-driven scene opacity and transforms; other browsers use a scroll-triggered animation frame. There is no touch or wheel interception, gesture threshold, animation library, or automatic chapter advancement.

The original cartoon-style SVGs are drawn from visible details in the supplied reference photos: his swept dark hair, glasses, beard, suit and tie; her long dark hair, fine glasses, sari and bangles. The suit, tie and sari are softened to blue-grey, muted rose and dusty aqua to fit the invitation. These are stylized illustrations, not exact facial reproductions or photographs processed by an external service. The original reference photos are not copied into the published folder.

Tap the couple to replay their reunion. Both full names use the same centered, single-line family heading style on narrow phones. “Share the love” and all sharing code are removed. The new **Our keepsake** link downloads a locally rendered 1080 × 1440 PNG postcard featuring the illustrated couple, date, time and venue. On phones, the browser may save it to Files or Downloads rather than directly to Photos.

The viewport follows the phone's available height. Rotation preserves the current chapter. Landscape, enlarged text, or content that cannot fit gets an unclipped reading layout instead of shrinking text or hiding details. Pinch zoom is not disabled.

The envelope keeps a clean, ribbon-free wax-seal exterior with swaying flowers and drifting petals. Opening it raises a full illustrated letter with the couple's names and timing, sends a few sparkles around it, then dissolves into the invitation. The letter's size and lift are calculated from the available phone height so its wording is not hidden behind the envelope. Butterflies, floating rings and the closing heart's petal shower remain.

Motion and music are enabled without visible toggle buttons, as requested for this version. Music starts directly from the guest's envelope-opening gesture and fades in over 1.8 seconds. Browser autoplay policies still apply: if playback is blocked, an explanatory notice asks the guest to tap the invitation, and playback is retried on that interaction. Device or browser mute settings cannot be overridden. Music pauses while the invitation film plays or the tab is hidden, then resumes when appropriate.

## Preview

Open `index.html` directly, or run `python -m http.server 8080` from this folder and visit `http://localhost:8080`. A local preview cannot be shared with guests; publish the folder first.

## Publish on GitHub Pages

1. Create a GitHub repository. Remember that a public repository exposes the invitation, family names, and video publicly.
2. Upload **the contents of this folder** to the repository root: `index.html`, `experience.css`, `mobile.css`, `storybook.css`, `experience.js`, `.nojekyll`, and the entire `assets` folder. Include `assets/engagement.ics` and `assets/our-keepsake.png`. Do not upload only the HTML or place everything inside a second `web-invite` folder.
3. In the repository, select **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Select your uploaded branch and **/ (root)**, then save.
5. When GitHub finishes deployment, use the website URL shown under Pages. It will typically look like `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

All asset links are relative, so repository subpaths work. There are no API keys or server-side dependencies. Google Fonts is an optional network enhancement; system serif and sans-serif fonts work when offline. The map opens Google Maps only when a guest requests directions.

## Features

- Keyboard-accessible, animated wax-seal envelope; replay from the footer.
- Light pink, powder blue, muted rose, and pearl tones throughout the envelope, text, flowers, buttons, video dialog, and original local illustrations.
- Five touch-snapped chapters, layered choreography, an illustrated reunion, a ceremony shortcut, native keyboard/touch scrolling, and a live progress line.
- Responsive layouts, safe-area support, keyboard-accessible chapter navigation, and printable details. Chapter changes move outgoing content focus to the new chapter heading rather than a navigation dot. Keyboard focus highlights the small navigation bar without outlining its full touch target.
- Countdown to **10:00 AM on 28 November 2026 in India Standard Time**.
- “Add to calendar” opens a mobile bottom sheet. Google Calendar and Outlook links prefill the ceremony start time for confirmation. Apple Calendar uses a normal calendar-file link, with a separate download option.
- Directions using the supplied Google Maps link.
- The supplied **Samridhi_Piyush_Friends.mp4** film, unchanged, in an accessible modal with native playback controls. It is 26 seconds long, is published as `assets/invitation.mp4`, and has a matching preview image extracted from the same film.
- Existing background music from the initial invitation, started by opening the envelope, with a gentle fade-in and no music or motion buttons. Replacing the film does not replace this music.
- A downloadable illustrated keepsake. No sharing or clipboard controls.

## Personalize

Use `?to=Ananya%20%26%20Family` after the published URL to address the envelope to a guest. Names are rendered as text, never HTML. This personalization is not private access control.

Edit names and invitation wording in `index.html`. The event start is `EVENT.startsAt` in `experience.js`; `EVENT.calendarStart` is the same instant in UTC. **10:00 AM IST equals 04:30 UTC.** If the date, time or venue changes, update HTML, the event object, `assets/engagement.ics`, and `assets/keepsake-art.svg`, then regenerate `assets/our-keepsake.png`. The PNG is a static image, not a live rendering of HTML. All botanical and character illustrations are original local SVG assets.

The shared palette is in `experience.css`, the native mobile scroller in `mobile.css`, and the illustrated opening, character choreography and keepsake controls in `storybook.css`. Calendar-file line endings must remain CRLF.

## Calendar behavior and limits

A normal webpage cannot write an event into someone's calendar without their permission. Google Calendar and Outlook open a prefilled editor; the guest must confirm Save and may need to sign in. Their service and the phone determine whether the editor opens in an app or a browser.

Apple does not provide a universal web link for creating a native Calendar event. Its option opens the local `.ics` file without forcing a download, which supported iPhone browsers can hand off for calendar import. Other browsers may download it or require the guest to open it from Files. No calendar access, OAuth token, backend, or subscription is requested.

The ceremony starts at **10:00 AM IST on 28 November 2026**. No end time was supplied, so the `.ics` event omits `DTEND` and Outlook does not receive an end-time parameter. Google's template URL uses the start instant at both endpoints instead of assigning a ceremony finish. Calendar apps may apply their own default duration or ask the guest to adjust it. The event description explicitly says the end time is unspecified. Both invitation editions retain the same event UID because they describe the same ceremony; only the displayed names and family order differ.

Motion uses CSS animations, one sticky viewport inside a native scrolling region, and a scroll-triggered `requestAnimationFrame` for navigation state and scenery. CSS scroll timelines handle scene transitions where supported; the JavaScript fallback uses only opacity and transforms. No story rendering continues when scrolling stops. Short-lived JavaScript animation is also used for the music fade-in. Hidden cinematic chapters are inert and excluded from the accessibility tree; all chapters are readable in the overflow fallback. Animation pauses when the browser tab is hidden. Motion remains enabled without toggles, as in v3. With JavaScript disabled or when printing, the invitation falls back to normal document flow.

The stylesheets and script use version queries to avoid reusing previous cached assets. The updated script and illustrated stylesheet use `nav-focus-7` for the navigation focus fix. Film and poster links use `friends-20261018` so browsers request the replacement media instead of a previously cached clip. When updating an existing deployment, upload `index.html`, `assets/invitation.mp4`, and `assets/video-poster.jpg` together. Upload the contents of **v7-Samridhi-piyush**, not the parent folder containing all versions.

No RSVP is collected and no analytics or tracking is included. Before publishing, confirm the date, venue, and spelling of all family names, and ensure you have permission to distribute the supplied video's imagery and music.
