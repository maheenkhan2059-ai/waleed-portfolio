# Update — office feedback (Oct 2026)

## 1. Third-party trademarked / copyrighted artwork removed
- Removed 4 artworks completely: the two famous-book covers (cover-01, cover-02) and the two franchise comic images (comic-07, comic-08) — config entries, all 12 image files, alt text, credits and changelog mentions.
- Hero 3D book: that page is now "The Attic of Old Toys" (sketch-04, Waleed's own line art) with its own story caption. Book textures regenerated.
- Book Cover Design service card: the 3D book / CSS book cover now uses Waleed's autumn-forest painting (children-06); its film strip, details drawer and 3D page use the same picture. Service texture regenerated.
- Process step 5 ("Print-ready delivery") now shows children-06.
- noscript fallback grid: the cover picture replaced with children-02.
- Social preview (og-image) did not show any removed artwork, so it is unchanged.
- Hero stat now counts 42 of Waleed's own illustrations (automatic).
- Safety fix: a service card whose category has no own artwork can no longer freeze the page (film strip loop).

- Also removed the 4 remaining covers by other artists (cover-03 to cover-06) and their 12 image files. Book Covers now has no artwork, so its filter button is hidden; the footer link for it goes to Services, and the Book Cover Design service card stays (showing Waleed's autumn-forest painting).

## 2. New loading screen
- Replaced the 3D book + 0–100% counter with: "Waleed Malik" in the serif font, the subtitle "Children's Book Illustrator" and a thin gold progress line on the site's dark background.
- The 3D book is built behind the loading screen, so it turns smoothly as soon as the page appears. The screen goes away as soon as everything is ready, and never later than `loader.maxMs` in js/config.js (default 3000 = 3 seconds; a safety timer guarantees it). Works with ?no3d, reduced motion and on phones (those take about 0.5 s).

---

# Update — October 2026: customised for Waleed (children's book illustrator)

## 1. Hero / open book
- Removed every truck (wrap) and map page from the book. The 3D book now has 9 pages on computers and 6 on phones/tablets:
  Tea in the Glowing Tree · The Cookie Standoff (comic) · River-Stone Adventure · Kids & Bikes (character) · Bedtime by the Moonlit Window · Night Flight Over the City (comic) · Market Day in the Village · The Attic of Old Toys (line art) · One World, Ten Stories.
  Children's book + comic pages = 7 of 9 on computers, 5 of 6 on phones.
- Every spread: LEFT page = category, title and a short story-style caption; RIGHT page = the illustration on a cream mat. Wide pictures are trimmed gently around the characters (`fx` in config.js) so faces are never cut.
- Book cover art changed to the autumn-forest picture-book painting; cover tagline now "Picture books · Comics · Characters · Covers".
- Static (no-WebGL / reduced-motion) book now matches: text left, picture right, with a short page-turn animation.
- Page count is read from `three.pagesDesktop / pagesMobile` in config.js (was hard-coded).
- Book pages now always finish painting (idle-callback timeout), so fast page-turns never show a blank page. Book textures re-encoded at 760 px (smaller download, same sharpness).

## 2. Services
- Each card has its own category visual (CSS 3D, uses Waleed's artwork): open storybook spread (Children's Books), comic page with panels + POW burst (Comics), character turntable on a pedestal (Character Design), hardcover book (Book Cover Design — the only book), folded 3D map with pin (Maps), spiral sketchbook + pencil (Line Art & Sketch), watercolor sheet + palette + brush (Ink & Watercolor), studio turntable truck (Vehicle Wraps). Each animates on hover.
- The real WebGL book now runs only on the Book Cover card.
- Removed the "Typical turnaround" time label from every card and from the details drawer, with its styling and spacing.
- Card order puts Children's Books and Comics first. Category names: Comics, Book Cover Design, Line Art & Sketch, Ink & Watercolor.

## 3. Work / portfolio
- 42 artworks, all by Waleed, one category each: Children's 6 · Comics 6 · Characters 6 · Book Covers 0 · Maps 6 · Line Art & Sketch 8 · Ink & Watercolor 2 · Vehicle Wraps 8.
- New from the attached files: 2 comic pages; 6 line-art/coloring pages; 3 vehicle wraps. The autumn-forest painting moved from "Book Covers" (it has no title) to Children's Book Illustration.
- White margins trimmed from line art; grid tiles keep each picture's real shape (no cropping).
- Filters verified: every chip shows only its own category.
- Featured stories: friendship spread, grandfather character, cookie comic strip (the truck case study was replaced).

## 4. Site-wide image consistency
- Hero, About and Contact books use the children's-book cover; noscript fallback, social preview image (og-image.jpg, rebuilt) and Process step 5 (now the autumn-forest painting for "Print-ready delivery") all show matching categories.
- Service-card film strips, drawer examples and case viewer all pull from the corrected category lists.

## 5. Reviews
- Removed all "Paste a … review here" placeholder text.
- 6 sample reviews (Sarah – Children's Author, Daniel – Self-Publisher, Amira – Educational Publisher, Tom – Fantasy Author, Grace – Webcomic Creator, Lena – Children's Author), each 5 stars.
- Each one is marked `<!-- SAMPLE – replace with real client review before launch -->` in js/content.js, the same comment is written into the page HTML, and a small "Sample" tag shows until `placeholder: false`.
- Section title no longer claims the reviews come from Upwork.

## 6. Copy, SEO & accessibility
- New hero, About, Services, Work, Process, Skills, FAQ, Contact and footer copy for a children's book illustrator; CTAs "Open the portfolio" / "Start your book on Upwork".
- New meta title, description, Open Graph / Twitter text, JSON-LD.
- Alt text rewritten for all 43 artworks + compare slider, ending "by Waleed Malik".
- Spelling switched to US English (color, watercolor) to match the brief.

## 7. Images & performance
- All artwork re-exported: full-size progressive JPG (max 1600 px) + WebP at 760 px and 420 px. Grid, featured and drawer images use `<picture>` (WebP, JPG fallback), lazy-loaded with width/height set.
- Unused old files removed.

## 8. Fixes
- Service details drawer moved outside `<main>` so the footer can no longer paint over it.

## Images still needed
- Book Cover Design: no covers on the site at the moment (the service card is still there). Send 3–5 covers Waleed illustrated.
- Ink & Watercolor: only 2 (café ink sketchbook, watercolor workshop); none in this batch. Send 4+ genuine ink / watercolor pieces.
- Map Illustration and Character Design: nothing new in this batch; the 6 existing site images were kept.

## Other artists' work
- None. Every picture on the site is Waleed's own work (the office asked for no third-party / trademarked material).

## Tested
Chromium at 1440×900, 1280×800 (?no3d and reduced motion), 820×1180 tablet, 375×812 phone, and from file://: all pages turn, all 8 filters correct, all 42 full-size images load in the viewer, all 8 drawers open, no horizontal scroll, no console errors or failed requests.

---

# CHANGELOG

## STEP 7: Final QA and delivery (Waleed-Portfolio-FINAL)

### Fixes made during the final QA

| Found by | Problem | Fix (file → function) |
|---|---|---|
| Lighthouse (a11y) | Service cards were `<li role="button">` (role not allowed on `li`) | `main.js` services markup + `index.html`: the grid and cards are now `<div>`s; `role="button"` is valid there |
| Lighthouse (a11y) | Work tiles had an `aria-label` ("Open …") that didn't match their visible text | Removed; the tile's visible category + title + brief is its accessible name |
| Lighthouse (a11y) | Review cards: `role="group"` not allowed on `<figure>` | Removed the role |
| Lighthouse (a11y) | Slider dots were 9 px touch targets | Dots keep their look but are now 24 px buttons (`style.css` Step 7 block) |
| Lighthouse (perf) | The browser created **two** WebGL contexts at start-up (probe + renderer), 0.2–0.9 s each without a GPU | `main.js` `probeGL()` makes the probe on the page canvas and hands it to three.js (`scene.js` `create()` → `context`). One context in total. With 3D off, the probe runs 2.5 s after start-up instead of blocking the first paint. |
| Lighthouse (perf) | Hidden hero fallback images (3D mode) were downloaded | `index.html`: `loading="lazy"`, so hidden images are never fetched |
| Lighthouse (perf) | The reviews slider measured layout during start-up | `main.js`: dots are built in idle time |
| Lighthouse (LCP) | The page stayed hidden until the preloader finished, so the main content painted late | `main.js` / `style.css`: the page is shown (behind the preloader) as soon as the fonts are in (`fonts-ready`). Still no layout shift. |
| Deployment | No cache rules | New `_headers` (Netlify, works with drag-and-drop): long cache for images, fonts and libraries |
| Docs | — | New **README.md** (replaces README.txt) |

### Final test suite: 4 screen sizes (Playwright + Chromium)

| Test | 1440×900 | 1920×1080 | 820×1180 | 390×844 |
|---|---|---|---|---|
| All 9 sections: screenshot, no horizontal scroll, no broken images, no HTTP errors | PASS | PASS | PASS | PASS |
| Hero book (open / next / keys / prev / close) | PASS | PASS (see note) | PASS | PASS |
| Nav links land and highlight (desktop) / phone menu → section (tablet, phone) | PASS | PASS | PASS | PASS |
| Services drawer → viewer → Esc | PASS | PASS | PASS | PASS |
| Work filter (Wraps = 5), viewer next, FAQ, footer filter link (Comics = 4) | PASS | PASS | PASS | PASS |
| All 93 image files load | PASS | PASS | PASS | PASS |
| Console errors | 0 | 0 | 0 | 0 |

**Note on 1920×1080 in forced full 3D:** with 3-second waits the book caption lagged one page twice, because at 1920×1080 the CPU-only renderer draws about 1 frame per second. The book suite with normal waits **passed fully at 1920×1080**: click, next/prev, keys, Esc, Open button, swipes, captions.

#### Other modes and suites on the final build

| Test | Result |
|---|---|
| Also at 1440: reduced motion, `?no3d`, forced full 3D, `file://` | PASS (all 5 modes) |
| **Double-click test:** `index.html` opened from disk with **all network blocked**: no request leaves the page, fonts + GSAP + ScrollTrigger + Lenis + Three.js load, hero 3D book opens, service books work (full 3D), 168 images load, viewer shows the full JPG | PASS (default and full 3D) |
| Step 2 suite: cursor trail, palettes per section, scroll-scrubbed blooms both ways, gyro, reduced motion, painted fallback | PASS |
| Step 2: 60 s soak, full 3D | PASS: 2.5 / 2.5 / 2.1 / 2.5 / 2.8 / 2.5 fps per 10 s; heap 10.8 → 9.5 MB; GPU objects unchanged |
| Step 3 suite: every way to open / turn / close, captions = artwork, page overshoot (3.19 vs π), turn shadow, cursor ring, contact book | PASS |
| Step 4 suite: 8 correct covers, one canvas, rotation, hover, click → drawer, carousel, focus trap, magnetic, CLS 0.0002, phone rail, reduced motion | PASS |
| Step 5 suite: 9 filters + hash, deep link, ratios, hover caption, every viewer control incl. pinch, featured, process both ways, compare slider, phone | PASS |
| Step 6 suite: nav landing, keyboard (skip link first, 78 stops, footer reached, focus ring on every stop), cursor, magnetic, split text, phone menu, reviews (6), FAQ, headshot slot, OG / SEO / alt / lazy | PASS |
| WCAG AA contrast, text on the background (18 blocks) | PASS (lowest 5.52:1) |

### Lighthouse

- **How it was run:** Lighthouse 12.2.1, Chromium **without a GPU** (SwiftShader).
- **Server:** a local server with gzip and cache headers, like Netlify serves the site.
- **Before** = the Premium build you sent; **After** = this final build. Same machine, same settings.

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Desktop, before | 45 | 96 | 100 | 100 | 1.8 s | 5.0 s | 0.252 |
| **Desktop, final** | **64** | **100** | **100** | **100** | **1.0 s** | 5.2 s | **0.005** |
| Mobile, before | 39 | 96 | 100 | 100 | 14.1 s | 11.9 s | 0.001 |
| **Mobile, final** | **51** | **100** | **100** | **100** | **3.7 s** | 9.9 s | **0.001** |
| Desktop `?no3d`, before | 56 | 93 | 100 | 100 | 1.5 s | 1.0 s | 0.186 |
| **Desktop `?no3d`, final** | **67** | **100** | **100** | **100** | **0.7 s** | 1.2 s | **0.007** |
| Mobile `?no3d`, before | 41 | 96 | 100 | 100 | 5.2 s | 3.9 s | 0.094 |
| **Mobile `?no3d`, final** | **58** | **100** | **100** | **100** | **3.5 s** | 2.6 s | **0** |

**Why Performance is not higher here, honestly:**
- **Total Blocking Time** dominates the score.
  - On this machine every WebGL step (creating the context, compiling shaders, drawing) runs on the **CPU**, inside the page's main thread.
  - With a real graphics card those same steps take a small fraction of the time. Lighthouse on your own laptop or PageSpeed Insights will score differently.
  - Run-to-run spread here is large (desktop TBT measured 2.0–5.2 s on identical code).
- **Still flagged:**
  - "Unminified JS/CSS" and "unused CSS/JS": kept readable on purpose, so you can edit them. GSAP and ScrollTrigger are only partly used.
  - "DOM size": the per-letter heading animation and the film-strips.
  - "Fonts": the fonts are embedded in the CSS on purpose, so the site works when double-clicked.

### Speed: before Step 1 vs final

Same machine, CPU-only renderer, wheel-scroll through the whole page at 1440×900.

| Run | Ready after | Long tasks while scrolling | Longest task | Avg fps* | Median frame* |
|---|---|---|---|---|---|
| Default mode, before | 7.4–8.6 s | 1 | 0.9–1.2 s | 9.3–10.1 | 50 ms |
| **Default mode, final** | **3.4–3.6 s** | **0** | **0** | 6.9–7.8 | 67 ms |
| Full 3D, before | 21.9 s | 1 | 2.6 s | 3.1 | 283 ms |
| **Full 3D, final** | **17.5 s** | **0** | **0** | 2.5 | 333 ms |
| `?no3d`, before | 3.7 s | 0 | 0 | 16.1–16.5 | 17–33 ms |
| **`?no3d`, final** | **1.9–2.1 s** | 0–1 | 0–51 ms | 12.6–14.0 | 33–50 ms |

\* **The frame-rate columns** measure a CPU emulating a GPU (2–16 fps) and say nothing about the 55–60 fps target on real hardware. On this CPU-only machine the final build draws a little fewer frames than the original. The reason is that it simply paints much more: the 1.5x book, 8 service books, film-strips, the compare slider and 6 reviews. In exchange:
- the freezes while scrolling are gone (0 long tasks, was up to 2.6 s);
- the page is ready **2–2.5x faster**;
- nothing jumps at load (CLS 0.25 → 0.005).

### What could NOT be verified here (needs a real device)

1. **Real-GPU frame rate**, i.e. the 55–60 fps target on an integrated-GPU laptop, and the smoothness of the cursor fluid, the page springs and the service books at 60 fps.
   - **To check on your laptop:** open the site normally, then type `__wm.tier()` and `__wmBench` in the browser console.
   - **Shortcut:** `?tier=high` forces the top quality, which shows how it feels.
2. **Real phones and tablets:** the gyro (incl. the iPhone permission prompt), touch swipe, pinch-zoom and the compare drag. All were simulated.
3. **Safari and Firefox:** all tests ran in Chromium. The code uses standard features with fallbacks, but these two browsers were not tested.
4. **Social previews:** Facebook, LinkedIn and X need the site online and full image URLs (README → Publish).
5. **Lighthouse on real hardware / PageSpeed Insights** after publishing.

### Files in the final zip

- `index.html`, `css/`, `js/`, `images/`, `fonts/`, `tools/`
- `README.md`: how to edit, swap images, replace placeholders, add the headshot, change the Upwork link, publish on Netlify, test switches.
- `CHANGELOG.md`: this file, with all 7 steps.
- `_headers`, `robots.txt`

Double-click `index.html`: it works offline.

---

## STEP 6: Global interactivity and polish (fixes K, J) + your two additions

### Your additions for this step

- **Reviews: 3 → 6.** The reviews section is now a slider with 6 review cards. Following the brief ("do not invent reviews or client names"), all 6 are placeholders (marked PLACEHOLDER on the page and REPLACE in `js/content.js`). Paste real Upwork reviews there and set `placeholder: false`.
- **FAQ "Before we start." no longer looks empty.** Under the heading there is now a card:
  - "Not sure where to start?" with a short intro.
  - A 5-point checklist, "For a clear quote, send me:": what you need, sizes / KDP template, deadline, references, where it will be used. This matches the Brief step in Process.
  - An "Ask a question on Upwork" button.
  - On desktop the card stays in view while the questions scroll.

### What you should see in the browser

- **Custom cursor:**
  - Follows smoothly and shows labels: View (work, case studies), Open (books), Drag (compare slider, zoomed viewer), Zoom (viewer), Upwork (hire links).
  - Shrinks to a small dot over reading text.
  - Hidden on touch screens.
  - "Play" is supported by the same system, but the site has no video, so nothing uses it yet.
- **Unchanged and checked again:**
  - Magnetic buttons.
  - Split-text heading reveals (all 9 section headings).
  - Scroll progress bar.
  - Active-section indicator in the nav.
  - Footer nav in the same order as the header.
- **Every nav link lands exactly under the fixed nav.** The pinned Process section starts at its own top, and links work from the footer and the phone menu too.
- **Full-screen phone menu:**
  - Fades in and the links slide in one after another.
  - Tab stays inside the menu.
  - Esc closes it and puts focus back on the menu button.
  - Tapping a link closes it and goes to that section.
- **Reviews slider:** scroll-snap, ← / → buttons, dots, a counter ("1–3 / 6"), arrow keys, and swipe on touch. It shows 3 per view on desktop, 2 on tablet, 1 on phone.
- **FAQ accordion:** smooth height animation; Enter and Space open and close it.
- **Headshot slot (documented):**
  - Set `headshot: 'images/waleed-headshot.jpg'` in `js/config.js`. The photo then replaces the About book, in a gold-edged frame with a name tag.
  - It is `null` for now, so the book stays. Instructions are in README.txt and in a comment in `index.html`.
- **Social preview (J):** a proper **1200×630** image, `images/og-image.jpg`. It has the name, "Children's books, characters, maps & brand visuals", the disciplines, the portfolio book cover with three artworks, and "Hire me on Upwork · $20/hr". Its source is `tools/og-image.html`.
- **SEO:**
  - `og:image` with width / height / alt.
  - Twitter large-image card, author, robots.
  - Person structured data (JSON-LD) with the Upwork profile.
  - `robots.txt`.
  - Placeholders for `og:url` / `canonical`, to fill in once the site has its address.
- **Alt text and images:**
  - Every image has alt text; decorative ones are empty and hidden from screen readers.
  - Only WebP thumbnails load on the page. Full JPGs load only in the viewer.
  - Everything below the fold is lazy-loaded.

### What changed (file → function)

| File | Function / part | Change |
|---|---|---|
| js/content.js | `testimonials.items` | 6 placeholder slots. |
| js/content.js | `faq.aside` (new) | Intro, checklist and button text for the FAQ card. |
| js/config.js | `headshot` (new) | Headshot slot switch. |
| index.html | `<head>` | OG / Twitter / robots / author / JSON-LD; placeholder comment for og:url + canonical. |
| index.html | markup | Reviews slider markup, FAQ side column, menu `role="dialog"`, headshot comment. |
| js/main.js | `anchorY()` (new) | Landing point under the solid nav; used by every nav, footer and menu link and by deep links. |
| js/main.js | `setMenu()` | Animated open/close and focus trap. |
| js/main.js | reviews slider IIFE (new) | Prev / next / dots / counter / keys / resize. |
| js/main.js | FAQ aside render (new) | — |
| js/main.js | headshot render (new) | Also skips the About 3D book when a headshot is set. |
| js/main.js | cursor `pointerover` | Adds the "text" state. |
| css/style.css | Step 6 block | Cursor text state, menu animation, reviews slider, FAQ side column (sticky), headshot frame; menu background more opaque. |
| images/og-image.jpg (new) | — | 1200×630 social preview. |
| tools/og-image.html (new) | — | Source of the social preview image. |
| robots.txt (new) | — | — |
| README.txt | — | Headshot, reviews and social-image instructions. |

### Tests run (Playwright + Chromium)

| Test | Result |
|---|---|
| Every nav link (9): section lands exactly under the nav (69 px; Home and pinned Process at 0) and the nav highlights it (`aria-current`) | PASS (9/9) |
| Footer nav order matches the header | PASS |
| Scroll progress bar (0 at top → 0.52 halfway) | PASS |
| Split text: 9 of 9 headings split into letters | PASS |
| Magnetic button moves toward the cursor (4.5 px) | PASS |
| Cursor: label "View" on a button, "Open" on the book, shrinks over text, hidden on touch | PASS |
| Keyboard: fresh page, 260× Tab: first stop is "Skip to content", then the nav in order; reaches the footer; 78 distinct stops; every stop has a visible focus ring; never lands in a closed dialog | PASS |
| Phone menu: opens animated, focus on "Home", 16× Tab stays inside, Esc closes and returns focus to the menu button, link closes the menu and lands under the nav | PASS |
| Reviews: 6 cards, 6 placeholder tags, next → "2–4 / 6", last dot → "4–6 / 6" (next disabled), ← key → "3–5 / 6"; phone shows 1 per view and swipes | PASS |
| FAQ side card: title, 5 checklist items, Upwork link | PASS |
| FAQ accordion: Enter opens with a smooth height (25 px mid-animation → 98 px), Space closes | PASS |
| Headshot slot (test-only config pointing at an existing picture): photo shown in the frame, About book removed, alt "Waleed Malik" | PASS |
| OG image is exactly 1200×630; og:image + width/height + Twitter large card + JSON-LD Person present; one `<h1>`; `lang="en"` | PASS |
| Alt text: no image without a proper alt | PASS (0 problems) |
| No full-size JPG requested on page load; all page images are WebP; images 2 screens below are lazy | PASS |
| Screenshots of all 9 sections at **390×844** and **820×1180**, no horizontal scroll on any | PASS |
| Regression: hero book, drawer, viewer, filters, FAQ, footer, all images (default, full 3D, phone, tablet, reduced motion, `?no3d`, `file://`) | PASS (7/7; the default run passed on its second try, see note) |
| Step 4 (service books) and Step 5 (work / viewer / process) suites re-run | PASS |
| WCAG AA for text on the background (18 blocks, now incl. the reviews counter) | PASS (lowest 4.92:1) |
| Long tasks while scrolling (default / full 3D) | PASS: 0 / 0 |
| CLS at load / during interactions | PASS: 0.0002 / 0.0003 |
| Console errors | PASS (0) |

**Note:** in one default-mode run the book caption was still on "Cover" 3.5 s after pressing Open. This machine draws 3D at 2–4 fps without a GPU, so the opening animation hadn't finished yet. The re-run passed all 6 book states.

### Not tested (honestly)

- **Real devices:** a phone, a tablet and Safari. Emulated sizes only.
- **Social previews on Facebook / LinkedIn / X:** these need the site online with a full image URL (see README). The image file itself was checked.
- **Lighthouse:** not run in this step. It is planned for Step 7.

---

## STEP 5: Selected Work + Process interactivity (fixes C)

### What you should see in the browser

- **Work filters** (All + the 8 disciplines, each with its count):
  - Clicking a chip fades the tiles that leave. The tiles that stay **glide from their old position to the new one** (FLIP animation), and the new ones fade and rise in.
- **The filter is kept in the URL:**
  - It becomes `#work/map`, `#work/comic` and so on, so a shared link, a reload, or typing the address opens the page on Work with that filter on.
  - The footer category links set the same filter and the same address.
- **Masonry:** every artwork keeps its true proportions, with no cropping of comics or wraps. Reveal masks wipe each image in as it scrolls into view.
- **Tile hover:** the category, title and brief slide up over the artwork, with "View case →". On touch screens the brief shows under the tile instead.
- **Case viewer:**
  - **Zoom:** mouse wheel (zooms where you point), double-click (2.5x / back to fit), pinch on touch screens, the − / + / Fit bar, or the + / − / 0 keys.
  - **Pan:** drag the picture when zoomed.
  - **Change artwork:** prev / next buttons, the arrow keys, or a swipe (at normal size).
  - **Esc:** first resets the zoom, then closes the viewer.
  - The next and previous full-size images are preloaded, Tab stays inside the viewer, and Brief / My role / Deliverables / Tools show for every artwork.
- **3 featured case studies:** Challenge, Approach and Result for each. They are still marked as placeholders on the page and with **REPLACE** in `js/content.js`.
- **Process:**
  - The horizontal pinned scroll with its gold progress line works in both scroll directions.
  - New last card **"Sketch to final"**: drag across the picture (or use the arrow keys) to wipe between the drawing and the finished art. It plays one gentle demo sweep the first time it comes into view.
  - Two examples cut from the two artworks you named:
    - **Grandfather** (character-05: construction sketch ↔ final colour).
    - **Colouring** (sketch-02: line art ↔ flat colour).
  - Each of those artworks already contains the sketch and the finished version side by side. I cut the matching halves and lined them up so the wipe compares the same drawing.
  - On phones the process is a vertical list and the compare card works by touch drag.

### What changed (file → function)

| File | Function / part | Change |
|---|---|---|
| js/main.js | `setFilter()` | Rewritten. FLIP animation with the Web Animations API: measure → fade out leavers → re-layout → animate from old to new position. `aria-pressed`. The URL hash is written with `replaceState`. No animation with reduced motion. |
| js/main.js | `hashFilter()` + `hashchange` (new) | Read `#work/<category>` on load, on hash change, and from footer links. `revealPage()` scrolls to Work when the link has a filter. |
| js/main.js | masonry markup | New `.tile__over` hover caption. |
| js/main.js | viewer | New zoom/pan engine: `zoomAt()` keeps the point under the cursor fixed, `zClamp()` limits panning, pinch via two pointers, swipe only at 1x. Buttons `#vZoomIn` / `#vZoomOut` / `#vZoomReset`, keys + − 0. Esc resets zoom first. Preloads next **and** previous images. |
| js/main.js | process markup + compare | New compare card: pointer drag (`setPointerCapture`), keyboard range input, example switch, one demo sweep (IntersectionObserver). |
| js/content.js | `process.compare` | New text and labels for the compare card (no invented facts: it only describes the two artworks). |
| index.html | viewer | Zoom bar and hint. |
| images/compare/ (new) | — | 4 aligned crops: `grandfather-before/after.webp` from character-05, `girl-before/after.webp` from sketch-02. |
| css/style.css | Step 5 block | Tile hover caption, viewer zoom/pan cursors and bar, compare slider (clip-path wipe, handle, tags, focus ring), phone rules, `.tile__img` as a block. |

### Tests run (Playwright + Chromium)

| Test | Result |
|---|---|
| Every filter (Children 5, Covers 1, Characters 6, Maps 6, Sketch 2, Comics 4, Ink 2, Wraps 5, All 31): right count, only that category, `aria-pressed`, URL hash | PASS (9/9) |
| FLIP animation runs on filter change (running tile animations seen mid-transition) | PASS (1–31 per change) |
| Deep link `#work/map` on page load: Maps filter on, 6 tiles, page scrolled to Work | PASS (also from `file://`) |
| Changing the hash by hand (`#work/comic`) switches the filter | PASS |
| Every tile shows its true aspect ratio (within 2%), no `object-fit: cover` | PASS |
| Reveal masks on all 31 tiles | PASS |
| Hover caption shows category, title and brief | PASS |
| Viewer: opens, Brief / Role / Deliverables / Tools filled | PASS |
| Viewer: next / prev buttons, → / ← keys, swipe left | PASS |
| Viewer: wheel zoom (100 → 190%) | PASS |
| Viewer: drag pans when zoomed (and does not change artwork) | PASS |
| Viewer: double-click 250% → 100% | PASS |
| Viewer: + / − buttons and + / − keys | PASS |
| Viewer: 0 resets zoom | PASS |
| Viewer: two-finger pinch (touch events) → 400% | PASS |
| Viewer: Esc resets zoom first, second Esc closes | PASS |
| Viewer: focus trap (12× Tab stays inside) | PASS |
| Viewer: next and previous full-size images preloaded | PASS |
| Featured: 3 case studies, each with Challenge / Approach / Result and a placeholder tag | PASS |
| Process scrolling **down** (0 → 25 → 50 → 75 → 100%): track moves −327 px per step, progress line 0 → 1 | PASS |
| Process scrolling **up**: identical positions in reverse | PASS |
| Compare: drag to 15%, then 10× → key to 25%, switch to the second example (images load, labels change) | PASS |
| Phone 390×844: process becomes a vertical list, compare card present, no sideways scroll | PASS |
| Regression: hero book, nav, services drawer, viewer, FAQ, footer, all images (default, full 3D, phone, tablet, reduced motion, `?no3d`, `file://`) | PASS (7/7) |
| Step 4 service books suite re-run (covers, hover, click → drawer, carousel, focus trap, magnetic, CLS 0.0002) | PASS |
| WCAG AA for text on the background | PASS (lowest 4.65:1) |
| Long tasks while scrolling (default / full 3D) | PASS: 0 / 0 |
| Console errors | PASS (0) |

### Not tested (honestly)

- **Real touchscreens:** pinch, swipe and dragging the compare slider. Simulated with Chrome DevTools touch events and mouse drags.
- **Lighthouse:** not run in this step. It is planned for Step 7.

---

## STEP 4: Services section (fixes D) + 3D books on the service cards

### What you should see in the browser

- **A small 3D hardcover book on every service card** (replaces the flat thumbnail). It has the same look as the hero book: rounded spine, page block with paper-edge lines, headbands, ribbon bookmark and glossy clearcoat cover. Each one:
  - **Cover:** a real artwork from that category, with its name in gold foil:

    | Category | Cover | Category | Cover |
    |---|---|---|---|
    | Children's | children-01 | Sketch | sketch-02 |
    | Covers | cover-01 | Comics | comic-01 |
    | Characters | character-01 | Ink & watercolour | handdrawn-02 |
    | Maps | map-03 | Wraps | wrap-01 |

  - **Cloth colour:** each category's cloth has its own colour.
  - **Idle:** sways slowly, with a soft parallax as you scroll.
  - **Hover:** the book tilts toward your cursor, the shine sweeps faster across the cover, and the book opens and turns through 2–3 pages of that category's artworks (1 page for Book Covers, which has one artwork).
  - **Click:** the book opens to a page, then the details drawer slides in (about 0.65 s later). The keyboard (Enter) opens the drawer straight away.
- **One renderer, no extra canvases:**
  - All 8 books are drawn by the same single WebGL renderer as the hero. Each one is clipped to its card's picture area.
  - A book off screen is not drawn or animated.
  - The page textures are painted in idle time once a card scrolls into view, so the first hover is instant.
- **No WebGL for these books on** phones/tablets, reduced motion, computers without a graphics card, or the low quality tier. Instead they show a static book image (cover, spine and page edge) with a slight CSS 3D tilt that straightens on hover.
- **Living film-strip** under each book: the category's artworks scroll slowly. It pauses on hover and while the card is off screen, and stays still with reduced motion or no graphics card.
- **Card hover:** 3D tilt with a moving light glare, and a magnetic "Discuss this project" link.
- **Drawer:**
  - The 2–3 related artworks are now a swipeable scroll-snap carousel with dots, ← / → buttons and the arrow keys.
  - Clicking an artwork opens the full-screen case viewer.
  - Esc closes, and Tab stays inside the drawer (focus trap).
- **Phones:** the 8 cards become a swipeable rail with snap; the next card peeks in from the edge.
- **Card copy is unchanged:** value line, who it's for, 5 deliverables, typical turnaround, Upwork link.
- **No layout jump at load:** the page and nav stay invisible (but laid out) behind the preloader until the web fonts are in.

### What changed (file → function)

| File | Function / part | Change |
|---|---|---|
| js/scene.js | `addMini()` (new) | Builds the 8 service books on the shared renderer: own clearcoat cover (`miniCover()`), own cloth colour, 1–3 spreads, a scene each. They share geometry and back cover with the hero book. |
| js/scene.js | `miniPages()`, `miniHover()`, `miniEnable()`, `miniInfo()` (new) | Paint 512 px spreads in idle time; tilt toward the cursor; turn off on the low tier; state for tests. |
| js/scene.js | `frame()` | Service books: skipped when off screen (IntersectionObserver + viewport check), scissored to their card picture, gentle parallax, faster shine sweep on hover. |
| js/scene.js | `measureStage()` | Size rule for card books (closed and open both fit the picture area). |
| js/scene.js | `animateBook()` | Per-book cursor tilt (`bk.ptr`). |
| js/scene.js | `makeSpread()` | Optional scale: small spreads are drawn directly at 512 px. |
| js/scene.js | `buildBook()` | A one-spread book shows its spread when opened. Lighter geometry and no floor shadow for card books. |
| js/main.js | `SVC_BOOKS` (new) | Category → cover + cloth colour (the mapping you gave). |
| js/main.js | services markup | CSS fallback book, film-strip, magnetic CTA. |
| js/main.js | `startSvcBooks()` (new) | Loads `js/tex-svc.js` after start-up and adds the books. Only on desktop with a GPU and not on the low tier; `svcOff()` reverts to CSS books if the tier drops to low. |
| js/main.js | card handlers | Hover open + page cycling, tilt, click → open book → drawer. IntersectionObserver for film-strips and pre-painting. |
| js/main.js | `openDrawer()` | Carousel (snap, dots, arrows, keys), focus trap, Esc. |
| js/main.js | `measureSvc()` + tick | Picture parallax from cached positions (no layout reads while scrolling). |
| js/main.js | `revealPage()` | Adds `is-revealed`. |
| js/tex-svc.js (new, generated) | — | 20 small (400 px) WebP covers/pages under their own name, `WM_TEX_SVC`, so they never replace the big hero-book pages. Generated by `tools/make-textures.py`. |
| css/style.css | services block | `.svc-book` (CSS book), `.svc3d` mode (the picture area becomes a window onto the WebGL book), `.svc__strip` film-strip, `.drawer__car` / dots, phone rail, reduced-motion rules, hidden-until-revealed rule. |

### Tests run (Playwright + Chromium, CPU-emulated WebGL)

| Test | Result |
|---|---|
| 8 books exist, each with the correct category cover (exact mapping above) | PASS |
| Only one `<canvas>` on the page (no extra WebGL canvases) | PASS (1) |
| All 8 books rotate while on screen (row 1: 4/4, row 2: 4/4) | PASS |
| Books off screen are not animated (their angle stays still) | PASS |
| Hover: book opens, tilts toward the cursor (tiltY 0.37), all 3 category pages painted | PASS |
| Hover: card 3D tilt + glare (--rx 2.92°, glare on) | PASS |
| Magnetic "Discuss this project" link moves toward the cursor | PASS (4 px) |
| Click: book opens first (page 2), drawer not yet open at 250 ms, then drawer opens with "Map Illustration" | PASS |
| Film-strip moves; pauses on hover | PASS |
| Drawer carousel: arrow key scrolls; dot shows 1; dot 3 scrolls; ← button scrolls back; 3 slides | PASS |
| Drawer focus trap: 20× Tab and 5× Shift+Tab never leave the drawer | PASS |
| Carousel slide opens the case viewer ("Storybook Island Village"); Esc closes viewer, then drawer; focus returns to the card | PASS |
| Every card keeps value line, who-for, 5 deliverables, turnaround, Upwork link | PASS (8/8) |
| No layout shift: CLS during page load / during all services interactions | PASS: 0.0002 / 0.0003 (was 0.086–0.18 at load from the font swap, now fixed) |
| Phone 390×844: no WebGL books, static CSS book shown, rail with snap that swipes, no page sideways scroll | PASS |
| Reduced motion: static book, film-strip not animated | PASS |
| Regression: hero book, nav, drawer, viewer, filters, FAQ, footer, all images (default, full 3D, phone, tablet 820×1180, reduced motion, `?no3d`, `file://`) | PASS (7/7) |
| WCAG AA contrast for text on the background | PASS (lowest 5.8:1) |
| Long tasks while scrolling the whole page (default / full 3D) | PASS: 0 / 0 |
| Console errors | PASS (0) |

#### Frames per second: before this step vs after

Same machine, same scenario, two runs each. Services: cursor moving across the cards for 10 s.

| Scenario | Before (Step 3) | After (Step 4) |
|---|---|---|
| Full 3D, hero | 4.1 / 4.1 | 4.1 / 4.1 |
| Full 3D, services (8 books, hover opening) | 5.4 / 5.4 | 5.4 / 5.3 |
| Default, hero | 4.7 / 4.3 | 4.6 / 4.4 |
| Default, services | 18.3 / 18.9 | 18.8 / 17.6 |

- **Result:** no drop beyond run-to-run noise (±0.6 fps).
- **What was fixed to get there:** the first version cost ~10% in the services section on this machine. The causes were the film-strip mask and full-size page painting on hover; both were fixed (plain fade overlays, strips paused off screen, half-size pages painted ahead of time) before these numbers.
- **These numbers come from a CPU renderer.** The absolute values say nothing about the 55+ fps target on a real GPU.

### Not tested (honestly)

- **Real-GPU frame rate:** the "above 55 fps" rule can only be checked on a real GPU. Here the comparison shows no loss vs Step 3 in the same conditions. Please check on a laptop by scrolling to Services and hovering the cards. Typing `__wm.tier()` in the browser console shows the quality tier.
- **Real touchscreen:** swiping the phone rail and the drawer carousel. Simulated with mouse wheel / scroll only.
- **Lighthouse:** not run in this step. It is planned for Step 7.

---

## STEP 3: The 3D book upgrade (fixes F, G; adds the contact book)

### What you should see in the browser

- **Hero book (F):** about **1.5x bigger** when closed: roughly 410 px → 610 px tall at 1440×900. It is the star of the hero.
  - When you open it, it eases down in size so the open spread fits its column instead of covering the text.
- **More presence:**
  - A red satin ribbon bookmark hangs out of the bottom of the page block and sways gently.
  - The page block shows paper-edge lines, with headbands at the spine.
  - A stronger violet rim light plus a new warm rim light on the spine side.
  - Environment reflections, the moving light sweep across the glossy cover, and the soft contact shadow underneath.
- **Physical page turns:**
  - The cover swings on a sprung hinge and every page turns on a spring, so it eases in, lands with a slight overshoot (about 1.5%) and settles.
  - A fast flip bends the paper more.
  - The lifted half of a turning page catches a warm sheen.
  - A soft shadow falls on the page underneath as the page lifts, then on the other side as it lands.
- **Ways to open and turn the book:**
  - **Open:** click the book, or the "Open the book" button.
  - **Turn:** the ← / → buttons, the arrow keys, Enter, a swipe on the book, or scrolling.
  - **Close:** Escape or "Close".
  - Each page shows its artwork and the caption below matches it.
- **"OPEN" cursor (G):** the label is now small gold text inside a thin, see-through ring that follows the pointer. It is no longer a filled gold disc, so it no longer looks like a stray button on the book.
- **Contact section:** a second, closed book turns slowly (front cover, spine, back cover) right next to the "Hire me on Upwork" card.
  - Phones: it sits under the card.
  - No graphics card or reduced motion: a still picture of the closed book.
- **Unchanged:**
  - The idle float, the eased sway and the mouse-parallax tilt.
  - Phones and reduced-motion keep the lighter / still versions, and the book can still be opened there.

### What changed (file → function)

| File | Function / part | Change |
|---|---|---|
| js/scene.js | `measureStage()` | Hero book scale: closed = `min(column × 0.9 / 1.15, stage × 0.9 / 1.42, screen height × 0.62 / 1.42)` (≈1.5x before). `openScale` lets the open spread fit its column. |
| js/scene.js | `spring()` (new), `animateBook()` | Cover hinge and every page leaf follow a damped spring (slight overshoot). The bend grows with page speed. Turn-shadow placement and opacity. Open-scale blend. Continuous slow turn for the contact book (`spinMode: 'turn'`). Ribbon sway. |
| js/scene.js | `buildBook()`, `buildBookShared()` | New satin ribbon (V-cut end, hanging curve). New turn-shadow plane with a gradient texture. |
| js/scene.js | `PAGE_FS` | New `uLift` uniform: warm sheen on a lifted page. |
| js/scene.js | `bookScene()` | Stronger rim light plus a warm back rim light. |
| js/scene.js | `init()` | Book instances can set `spin`. |
| js/main.js | `start3D()` | New `contact` book instance (closed, turning). On no-GPU machines only the hero book is 3D. |
| index.html | contact section | `contact__grid` with the card and the new `#contactBook` stage (with a still-picture fallback). |
| css/style.css | `.book-stage` | Hero stage taller: `min(70vh, 660px)`. |
| css/style.css | `.cursor.is-label` | Thin glass ring with gold label (G). |
| css/style.css | contact | `.contact__grid` and `.book-stage--contact` (stacked on ≤980 px). |

### Tests run (Playwright + Chromium, CPU-emulated WebGL)

| Test | Result |
|---|---|
| Click on the book opens it (caption "01 / 07 Tea in the Glowing Tree") | PASS |
| "Open the book" button opens | PASS |
| Next / Prev buttons turn pages (01 → 02 → 01) | PASS |
| Arrow keys → / ← turn pages | PASS |
| Escape closes back to the cover | PASS |
| Swipe left / right on the book (pointer drag) turns next / previous | PASS |
| Scrolling the hero drives the pages: cover and pages 1–7 | PASS |
| Every caption matches its artwork title and number, in the same order as the 3D page textures (children-01, character-01, map-03, comic-01, wrap-01, handdrawn-02, children-05) | PASS |
| Page turn overshoots slightly and settles (max angle 3.187 vs π = 3.142) | PASS |
| Paper bends more during a fast flip (bend −1.0 → −1.7) | PASS |
| Shadow under the turning page appears during the turn | PASS |
| Cursor shows "Open" inside a transparent ring (gold text, no filled disc) | PASS |
| Contact book is closed and turning (angle increases over time) | PASS |
| Book open: frames per second | 1.6 fps on the CPU renderer (not meaningful for real GPUs) |
| Regression: book, nav, drawer, viewer, filters, FAQ, footer, all images (default, mobile 390×844, tablet 820×1180, reduced motion, `?no3d`, `file://`) | PASS |
| Regression in forced full 3D (`?quality=full`) | PASS with longer waits (Step 3 suite above). The 3-second-wait version showed the caption one page late, because at ~1.6 fps the animation clock runs about 6x slower than real time. |
| WCAG AA for text on the background (17 blocks) | PASS (lowest 5.61:1) |
| No horizontal scroll at 390 / 820 / 1440 px | PASS |
| Console errors | PASS (0) |
| Speed, default mode | PASS: ready in 4.9 s, 0 long tasks while scrolling, 6.8 fps (Step 2: 7.3, within noise) |
| Speed, full 3D | 41 draw calls (was 40), 0 long tasks |

### Not tested (honestly)

- **Real-GPU feel:** the smoothness of the spring page turns and the overshoot at 60 fps. Here everything runs at 1–7 fps on the CPU.
- **Real phones:** a swipe on a real touchscreen. Only simulated with a mouse drag.
- **Lighthouse:** not run in this step. It is planned for Step 7.

---

## STEP 2: Premium interactive background (fixes B, H, I)

### What you should see in the browser

- **Aurora (H):** clearly visible, not mostly black. Midnight navy into plum, with a warm gold light pocket.
- **Cursor:** moving the mouse drags warm light through the aurora and swirls it, like light in liquid. It settles back smoothly within a few seconds.
  - Floating objects near the cursor get pushed aside and spin a little, then drift back.
  - A warm lamp follows the cursor and lights the pages, pencils and ink drops it passes.
- **Each section has its own palette,** cross-fading smoothly as you scroll:

  | Section | Palette |
  |---|---|
  | hero | gold light on navy |
  | about | warm plum |
  | services | teal-navy with gold |
  | work | deep neutral, so the art pops |
  | process | ink and paper |
  | skills / reviews / FAQ | their own variations |
  | contact | warm gold glow |

  The fog, the light colours and the dust follow the palette too.
- **Depth layers** move at different speeds when you scroll and when you move the mouse:
  1. **Far:** gold dust.
  2. **Mid:** lit objects (pages, paper planes, pencils, ink drops, brush strokes).
  3. **Near:** soft bokeh.
  4. **Foreground:** big out-of-focus silhouettes that slide past the screen edges about 3.5x faster than the mid layer.
- **Floating pages (I)** are no longer flat beige cards. Each page is lit and printed:
  - It is printed with one of four papers: ruled notes, graphite sketch, watercolour study or a gold-edged page.
  - Lighting: a warm key light, light glowing through the thin paper, a palette-coloured rim light, a soft sheen and the cursor lamp.
  - Each has a soft shadow behind it.
  - Pencils, planes and ink drops get a rim light. Ink drops have a slight gold glow.
- **Ink-bloom transitions** at every section boundary (8):
  - A pigment bloom with a feathered, fibrous edge, in the colour of the section it introduces.
  - It is driven by scroll position, not time, so it grows and recedes exactly with your scroll in both directions.
- **Readable text:** headings and intros that sit directly on the background now have an invisible feathered dark scrim behind them. Every measured text block passes WCAG AA (see tests).
- **Phones and tablets:** there are no cursor effects. The scene follows a gentle device tilt (gyro; iPhone asks permission on the first tap), and a slow "virtual hand" stirs the aurora, harder while you scroll.
- **Reduced motion:** a static painted navy / plum / gold gradient, with no animation.
- **Computers with no graphics card:** the painted gradient now also changes palette per section.

### What changed (file → function)

| File | Function / part | Change |
|---|---|---|
| js/scene.js | `AURORA_FS` | Rewritten: stronger plum/blue bands, darker valleys for depth, gold glow whose position and strength come from the section palette, domain-warped by the cursor trail, light carried by the trail, mouse parallax. |
| js/scene.js | `TRAIL_FS`, `makeTrail()`, `stepTrail()` | **New** cursor "fluid": a small velocity + light texture (160 px wide, 96 on phones, plain RGBA8 so it works on every device). It advects itself, decays, and gets a swirl splat at the pointer each frame. Touch uses an autopilot driven by scroll speed. |
| js/scene.js | `PAL_SRC`, `updatePalette()`, `measureSections()` | **New** per-section palettes (base, two aurora colours, light colour, glow position and strength). They cross-fade over the last part of each section, are eased over time (no jumps on anchor clicks), and also drive fog, key, fill, rim and ambient light, lamp colour, dust colour and the foreground tint. |
| js/scene.js | `SHEET_VS / SHEET_FS`, `sheetAtlas()` | Loose pages: 4 printed paper variants (512 px atlas). Lighting: key + translucency + cursor point light + rim + specular + curl self-shadow. |
| js/scene.js | `SPRITE_VS / SPRITE_FS`, `softAtlas()` | **New** camera-facing soft sprites, used for the sheet shadows (they narrow when a sheet turns edge-on) and for the foreground layer. |
| js/scene.js | `buildWorld()` | Mid objects moved to z −9…0. Bokeh moved to the near layer (z 2.5…6.5), dust to the far layer. Planes switched to a lit material. `addRim()` adds a fresnel rim light to pencils, planes and drops. Drops get a slight gold emissive. The cursor lamp follows the pointer. |
| js/scene.js | `updateWorld()` | Eased pointer / gyro parallax. Cursor ray push + spin per object (spring back, damped). Shadow and foreground updates. |
| js/scene.js | `BLOOMSTAIN_FS` | Ink bloom rewritten: tendril edge from seamless circular noise, a pigment body that dries darker in the middle, a fibrous luminous rim. 20×12.5 plane so it is never clipped. |
| js/scene.js | `applyTier()` | Low tier also hides sheet shadows and the foreground layer. The trail stays on: it costs one 160×96 pass. |
| js/scene.js | API | `palette()`, `trailSpeed()`, and a `_dbg()` test hook (freeze the clock, inspect the trail). |
| js/main.js | `start3D()` | Passes `sections` and `touch` to the scene. |
| js/main.js | active-section loop | Sets `data-sec` on `<html>`, which drives the painted fallback palette. |
| js/main.js | touch branch | **New** `deviceorientation` gyro, an iOS permission request on the first tap, and a slow drift when no gyro exists. |
| css/style.css | `.bg-fallback` | Painted background uses the same 9 palettes via registered colour properties (`@property`), cross-fading per section. It swaps instantly on no-GPU machines, where repainting is expensive. |
| css/style.css | `.sec-head::after`, `.mini-label::after` | Feathered dark scrim behind text on the background. Plain tint without a GPU. Kept inside the screen on phones. |

### Tests run (Playwright + Chromium, CPU-emulated WebGL, `?quality=full` to force the 3D world)

| Test | Result |
|---|---|
| Cursor changes the background: clock frozen, book hidden; screenshot before vs after a cursor sweep (mean pixel difference on the cursor path) | **PASS:** still vs still = 0.00 → after sweep = 5.97; settles back to 0.64 after 6 s |
| Cursor trail texture: light energy before / after the sweep | **PASS:** 0 → 4.1 |
| Objects react to the cursor (push distance, spin) | **PASS:** pushed 1.24 units and spun, then springs back |
| Palette changes per section (all 9 sections, distinct base / light colours and screen averages) | **PASS** |
| Ink blooms scroll-scrubbed: same state reached scrolling down and scrolling up | **PASS:** identical values |
| 60 s soak, full 3D, cursor circling: fps per 10 s window | **PASS** (no downward trend): 2.2 / 2.6 / 2.1 / 2.1 / 2.5 / 2.7 on the CPU renderer. Heap 8.6 → 8.2 MB. GPU objects stable (+1 texture = a lazily painted book page). |
| 60 s soak, default mode | **PASS:** 5.2 / 4.7 / 5.0 / 5.3 / 5.3 / 5.3 fps, heap 8.7 → 8.6 MB |
| Touch (390×844): tilt event moves the camera; trail runs without a cursor; no custom cursor | **PASS:** camera x 0.165 → 0.372; trail energy 4.75 |
| Reduced motion: static painted gradient, no WebGL | **PASS** |
| No graphics card: painted background follows the section | **PASS:** home / services / contact palettes |
| WCAG AA for the 17 text blocks that sit directly on the background, measured against the brightest 5% of background pixels behind each | **PASS:** all ≥ 4.5:1, lowest 5.85:1 |
| No horizontal scroll at 390 px | **PASS** (found and fixed a 6 px overflow from the new scrim) |
| Regression: book, nav, drawer, viewer, filters, FAQ, footer links, all images (default, full 3D, mobile 390×844, reduced motion, `?no3d`, `file://`) | **PASS** (all 6) |
| Console errors | **PASS:** 0. The only warning, "GPU stall due to ReadPixels", comes from the test itself reading the trail texture. |
| Speed vs Step 1, default mode | **PASS:** ready in 4.7 s; 0 long tasks during a full scroll; 7.3 fps (Step 1: 7.2) |
| Speed vs Step 1, full 3D | 40 draw calls (was 37), 16,040 triangles (was 15,954), 0 long tasks, 2.3 fps (CPU renderer) |

### Not tested (honestly)

- **Real-GPU smoothness:** the fluid trail and the 60 fps feel. Here everything renders on the CPU at 2–7 fps, so the cursor light appears as separate puffs instead of a continuous ribbon. On a real GPU it is drawn every frame. Please move the mouse around the hero on a laptop.
- **Real phones:** the gyro on a real phone and the iPhone motion-permission prompt. Only simulated events were tested.
- **Safari:** not tested. The painted fallback uses `@property` and `color-mix()`, which are supported in current Safari, Chrome and Firefox. Older browsers fall back to a plain gradient.
- **Lighthouse:** not run in this step. It is planned for Step 7.

---

## STEP 1: Performance audit and speed fix

### How it was measured

- **Tools:** headless Chromium (Playwright) at 1440x900, with a script that records:
  - time until the page is interactive (preloader gone)
  - JS heap
  - frame times while wheel-scrolling the whole page top to bottom
  - long tasks (>50 ms) during that scroll
  - WebGL draw calls, triangles and textures per frame
- **Limitation:** this machine has **no graphics card**. Chromium falls back to SwiftShader, which runs WebGL on the CPU. Frame rates here are therefore 10–30x lower than on any real laptop, and they say nothing about the 55–60 fps target.
  - **What these numbers are reliable for:** main-thread problems, such as long tasks, start-up time and shader compiles.
  - **What they are not reliable for:** GPU speed.
- **The site's own handling:** the site detects software rendering and switches itself to its lightest mode (painted background, no glass blur). That is the **default** row below. To force the full 3D world, add `?quality=full` (the **full** rows).

### Before / after

| Run | Interactive after | Long tasks while scrolling | Longest task | Avg fps* | Median frame* | p95 frame* | Worst frame* | JS heap | Draw calls / frame | Triangles / frame |
|---|---|---|---|---|---|---|---|---|---|---|
| BEFORE default | 10,010 ms | yes | **1,432 ms** | 7.5 | 50 ms | 450 ms | 2,583 ms | 8.8 MB | 23 | 1,104 |
| **AFTER default** | **5,252 ms** | **0** | **0 ms** | 7.2 | 67 ms | 517 ms | 3,383 ms | 8.1 MB | 23 | 1,104 |
| BEFORE full 3D (`?quality=full`) | 30,052 ms | yes | **3,415 ms** | 2.4 | 367 ms | 900 ms | 4,666 ms | 9.0 MB | 37 | 20,254 |
| **AFTER full 3D** | **24,007 ms** | **0** | **0 ms** | 2.4 | 367 ms | 917 ms | 2,267 ms | 8.3 MB | 37 | 15,954 |
| BEFORE no-3D (`?no3d`) | 3,763 ms | 0 | 0 ms | 12.6 | 33 ms | 267 ms | 517 ms | 3.3 MB | – | – |
| **AFTER no-3D** | **3,243 ms** | 0 | 0 ms | 14.1 | 33 ms | 217 ms | 633 ms | 3.9 MB | – | – |

\* CPU-emulated GPU, so these columns are not meaningful for real hardware. Repeated runs vary by roughly ±30%, and the before/after differences in these columns are inside that noise.

- **Start-up download:**
  - Book textures needed before the page appears went from **801 KB to 248 KB**: cover plus the first 2 spreads.
  - The other 554 KB load after the page is shown.
- **Estimated texture memory** (new `__wm.stats()`, includes render targets):
  - about 34 MB on the low tier
  - about 45 MB on the high tier
  - The old build had no way to read this, so there is no BEFORE number.

### Real causes found, and fixed

| # | Cause | Fix (file → function) |
|---|---|---|
| 1 | **The 1.4–3.4 s freezes while scrolling** were shaders being compiled the first time a page of the book was turned. three.js links shader programs lazily on the first draw, and the hidden page leaves were skipped by `renderer.compile`. | `js/scene.js → compileAll()`: compiles every material, hidden leaves included, then forces the program link, all behind the preloader. It runs again after any quality change. |
| 2 | **Render targets were rebuilt on every refresh.** Every lazy-loaded image fired `refreshLayout()`, which called `SC.resize()` → `makeTargets()`, which threw away and re-created the 4x MSAA render targets. | `js/scene.js → makeTargets()`: rebuilds only when the size or tier really changes. `js/main.js` image `load` listener: re-measures only when the page height actually changed. |
| 3 | **MSAA (`samples: 4`) on the full-screen scene target.** | `js/scene.js → makeTargets()`: `samples: 0`. Bloom and grain hide the edges anyway. |
| 4 | **Pixel ratio up to 1.5.** | Capped at **1.25 on desktop and 1 on mobile** (`create()`, `js/config.js → three.maxPixelRatio`). |
| 5 | **Bloom cost.** It was already quarter-resolution with 4 blur passes every frame. | `frame()`: high tier 2 passes, medium tier 1 pass, low tier no post-processing. |
| 6 | **Too many objects.** | `buildWorld()`: dust 900 → 600 (mobile 220 → 160), sheets 46 → 36, planes 16 → 12, pencils 22 → 18, ink drops 34 → 26, strokes 16 → 12. Tiers scale these further (×0.6 / ×0.35). |
| 7 | **Clearcoat on 34 far-away ink drops.** | `buildWorld()`: the ink drops now use `MeshStandardMaterial`. Clearcoat stays only on the book cover, where you can see it, and is turned off on the low tier. |
| 8 | **The 784 KB `tex-book.js` was decoded at start**, and all 7 page spreads were painted before the page appeared. | `tools/make-textures.py` splits it into `js/tex-book.js` (cover + 2 pages) and `js/tex-book-2.js`. `scene.js → fillSpreads()` paints and uploads the remaining spreads one per idle slot (`requestIdleCallback` + `renderer.initTexture`). `main.js → start3D()` downloads three.js and the textures in parallel. |
| 9 | **Per-frame allocation.** `animateBook()` returned a new object every frame. | It now reuses `bk.res`. No other `new Vector3/Color` calls were found in the frame loop. |
| 10 | **Two throw-away WebGL contexts at start-up**, each about 1 s on slow machines. | `js/main.js`: one probe does both checks: is WebGL available, and is the renderer software. |
| 11 | **The preloader counter eased per frame**, so on slow frames it took seconds to reach 100%. | `main.js → loaderTick()`: time-based easing, and the reveal delay cut from 350 ms to 150 ms. |
| 12 | **One ScrollTrigger per image mask** (31+). | `main.js → setupReveals()`: a single `ScrollTrigger.batch`. |
| 13 | **Images decoded on the main thread.** | `decoding="async"` on all generated images and the viewer image. `loading="lazy"` stays on everything below the fold. Only the hero cover gets `fetchpriority="high"`. |
| 14 | **Rendering behind overlays.** The canvas was still drawing behind the full-screen viewer, the drawer and the mobile menu. | `main.js` sets `S.paused`, and `scene.js → frame()` skips the frame. Hidden-tab skip kept. The book scene is now also paused by an `IntersectionObserver` when it is off screen. |
| 15 | **Shadow maps.** | None are used: the shadows are baked textures. Nothing to fix. |
| 16 | **Layout reads in scroll handlers.** | None found. Scroll is read once per frame from Lenis, and all section positions are cached in `measure*()`. |

### New: adaptive quality (3 tiers): `js/scene.js → TIERS / applyTier() / benchFrame() / monitor()`

| Tier | Pixel ratio | Bloom | Objects | Dust | Ink blooms | Clearcoat | Glass blur |
|---|---|---|---|---|---|---|---|
| high | ≤ 1.25 | 2 blur passes | 100% | 100% | yes | yes | yes |
| medium | 1 | 1 blur pass | 60% | 55% | yes | yes | yes |
| low | 1 | off | 35% | 30% | no | no | off |

- **Start:** a 1-second benchmark of real frames runs behind the preloader. It picks high at ≥ 50 fps, medium at ≥ 32 fps, otherwise low. The preloader step reads "Tuning for this screen".
- **Live:** below 45 fps for 2 seconds in a row drops one tier, followed by a 3-second cool-down. It **never steps back up**, so the quality never flickers.
- **Software rendering (no graphics card):** low tier plus a painted static background, as before.
- **Test switches:**
  - `?quality=full` keeps high and never steps down.
  - `?tier=high|medium|low` starts at that tier with the live guard still on.

### Grain fix (problem E): `js/scene.js → COMPOSITE_FS`

- **Placement:** grain is added **after** `colorspace_fragment` (sRGB), not in linear space.
- **Amplitude:** 0.011, down from 0.035.
- **Dark areas:** grain fades out in the darks (`smoothstep` on luminance).
- **Animation:** re-seeded **12 times per second** instead of every frame.
- **Measured:** in the dark sky area of the hero, pixel-noise standard deviation dropped from **14.1 to 0.8** (screenshot analysis, full-3D mode).

### What you should see in the browser

- The preloader finishes noticeably sooner, with a last step "Tuning for this screen".
- No hitch the first time you scroll or turn the book's pages.
- Dark areas are clean, with no TV-static speckle. The grain is only a faint film texture on lighter areas.
- The background and book look the same as before on a capable machine, which picks the high tier. On weaker machines the quality drops quietly instead of the page stuttering.
- Nothing else changed: structure, copy, images and section order are untouched.

### Tests run (Playwright + Chromium, SwiftShader)

| Test | Result |
|---|---|
| Profile BEFORE and AFTER (default, `?quality=full`, `?no3d`) | PASS (table above) |
| Long tasks > 50 ms during a full-page scroll, default mode | PASS (0; was 1,432 ms) |
| Long tasks > 50 ms during a full-page scroll, full 3D | PASS (0; was 3,415 ms) |
| Console errors / page errors / failed requests (all runs) | PASS (0) |
| Hero loads, book opens / next / arrow keys / prev / close, 1440x900 | PASS |
| Same book test via `file://` (double-click index.html) | PASS |
| Same book test, mobile 390x844 | PASS |
| Same book test, reduced motion and `?no3d` (static book) | PASS |
| Later book pages (lazy `tex-book-2.js`) show artwork: page 3 "Storybook Island Village" screenshot | PASS |
| All 9 nav links land and highlight the right section | PASS |
| Section order home, about, services, work, process, skills, testimonials, faq, contact | PASS |
| Services drawer opens → artwork opens viewer → Esc closes both | PASS |
| Work filter (Wraps = 5 tiles), viewer, arrow key next | PASS |
| FAQ opens, footer category link filters Work (Comics = 4) | PASS |
| All 93 image files load, no broken images, no horizontal scroll | PASS |
| Tier benchmark picks a tier and the page reveals (simulated "real GPU" on the CPU renderer) | PASS (picked low, as expected on a CPU renderer) |
| Live step-down: `?tier=high` → medium → low, never back up | PASS (high → medium after ~4 s → low after ~13 s) |
| Rendering pauses while the full-screen viewer is open | PASS (0 GL frames in 3 s while open; resumed after Esc) |
| Grain in dark areas (noise std-dev) | PASS (14.1 → 0.8) |

### Not tested (honestly)

- **Real-GPU frame rate:** the 55–60 fps target on an integrated-GPU laptop at 1440x900. There is no graphics card here, so this needs checking on a real laptop.
  - Open the site normally, then type `__wm.stats()` and `__wmBench` in the browser console to see the chosen tier and the benchmark fps.
- **First interactive under 3 s:** met only in `?no3d` mode here (3.2 s, CPU-emulated). With 3D on, the CPU renderer itself is the bottleneck (5.3 s). On a real GPU the 3D path should be well under 3 s, but that was not measured.
- **Chrome DevTools Performance panel:** not used (no Chrome per your rule). The equivalent data came from the Chromium CPU profiler via Playwright.
- **Hidden-tab pause:** the code skips frames when `document.hidden` is true, but this was not simulated in the test.
- **Lighthouse:** not run in this step. It is planned for Step 7.
