# Waleed Malik — Children's Book Illustrator Portfolio

A premium, dark editorial portfolio for a children's book illustrator, built with plain HTML/CSS/JS (Three.js r158, GSAP 3.13 + ScrollTrigger, Lenis), all inside this folder.

The sections are, in order: **Home → About → Services → Selected work → Process → Tools & skills → Reviews → FAQ → Contact → Footer**.

- **Home:** a real 3D hardcover storybook that you open by clicking, with the "Open the book" button, the arrow keys, a swipe or by scrolling. The pages turn with a curl. Every spread has the story text on the left page and the illustration on the right page (9 pages on computers, 6 on phones and tablets).
- **Background:** a cursor-reactive aurora whose colours change per section, 4 depth layers, and ink-bloom transitions between sections.
- **Services:** 8 cards, each with its own visual: an open storybook (children's books), a comic page (comics), a character turntable (characters), a 3D book (book covers — the only book), a folded map (maps), a sketchbook and pencil (line art), a watercolor sheet with palette and brush (ink & watercolor) and a studio turntable (vehicle wraps). Click a card for the details drawer.
- **Selected work:** animated filters (shareable links such as `#work/map`) and a full-screen case viewer with zoom.
- **Process:** a pinned horizontal process with a sketch ↔ final compare slider.
- **Reviews and FAQ:** a reviews slider, the FAQ, and a contact book.

---

## 1. Run it

**Double-click `index.html`.** It works offline: fonts, libraries and 3D textures are all inside the folder. It is tested in Chromium (Chrome / Edge engine) and built for Firefox and Safari too, but those two have not been tested yet.

### Test switches (add to the address)

| Address | What it does |
|---|---|
| `index.html?no3d` | No WebGL: static CSS book + painted background |
| `index.html?quality=full` | Never lower the 3D quality automatically |
| `index.html?tier=high` / `medium` / `low` | Start at that quality tier and skip the start-up benchmark (the live guard still works) |
| `index.html#work/map` | Open the page at Selected work with the Maps filter on (any category key works) |

### Automatic modes

- **Quality tiers:**
  - A loading screen (name, subtitle, thin gold line) shows for at most ~1.5 s. Right after it, a 1-second benchmark picks *high*, *medium* or *low* while the 3D book fades in.
  - If the frame rate stays under 45 fps for 2 s, quality steps down one tier. It never flickers back up.
  - Typing `__wm.tier()` in the browser console shows the current tier.
- **Computer without a graphics card:** painted background, no glass blur, only the hero book in 3D.
- **Phones / tablets:**
  - The cursor effects are replaced by device tilt.
  - Lighter 3D; the service books become still images.
  - Swipeable service cards; the process becomes a vertical list.
- **"Reduce motion" (system setting):** static book and a still painted gradient. No smooth scrolling, pinned scenes or particles.
- **Hidden tab or full-screen viewer / drawer / menu open:** the 3D drawing pauses.

---

## 2. Files

| File / folder | What it is |
|---|---|
| `index.html` | Page structure, `<head>` meta (SEO, social preview) |
| `css/style.css` | Design. Colour tokens at the top (`--bg`, `--text`, `--gold`, `--coral`) |
| `js/content.js` | **All text**: hero, about, services, work case studies, process, skills, reviews, FAQ, contact, footer, nav labels |
| `js/config.js` | Upwork link, **headshot slot**, the 8 disciplines, the artwork list (title, alt text, brief, role, deliverables), tools per discipline |
| `js/main.js` | Everything interactive (book controls, service books, drawer, filters, viewer, process slider, reviews slider, menu, cursor) |
| `js/scene.js` | The 3D background and all 3D books (one shared WebGL renderer) |
| `js/tex-book.js`, `js/tex-book-2.js` | Hero-book artwork, embedded so it works offline (generated) |
| `js/tex-svc.js` | Covers and pages of the 8 service-card books (generated) |
| `js/vendor/` | Three.js r158, GSAP 3.13 + ScrollTrigger, Lenis 1.1.13 |
| `images/art/` | Full-size JPGs (loaded only in the case viewer) |
| `images/thumbs/`, `images/thumbs-sm/` | ~760 px and ~420 px WebP versions used on the page |
| `images/compare/` | The before/after pictures of the Process slider (cut from character-05 and sketch-02) |
| `images/og-image.jpg` | 1200×630 social preview (source: `tools/og-image.html`) |
| `tools/make-textures.py` | Rebuilds the three `tex-*.js` files after you change book pictures |
| `_headers`, `robots.txt` | Netlify cache settings and search-engine permissions |
| `fonts/` | Fraunces + Manrope (OFL licences included) |
| `CHANGELOG.md` | What changed in each step, with the test results |

---

## 3. Edit text

1. Open **`js/content.js`** in any text editor (VS Code, Notepad, TextEdit in plain-text mode).
2. Change only the words **between the quote marks** and keep the commas.
3. Save and refresh the browser.

- `*word*` inside a heading becomes the gold italic highlight.
- If the page goes blank, a comma or quote mark is missing: undo the last change.

---

## 4. Replace the placeholders

Search `js/content.js` for **REPLACE**. On the page these items show a dashed **PLACEHOLDER** tag.

| What | Where | What to do |
|---|---|---|
| **Reviews (6 SAMPLE reviews)** | `testimonials.items` | The six reviews are samples written for layout only (each is marked `<!-- SAMPLE – replace with real client review before launch -->` and shows a small "Sample" tag). Replace quote, name, role, project and rating with real Upwork reviews (with the client's permission) and set `placeholder: false`. Use as many as you have and delete the rest. |
| **3 featured case studies** | `work.featured` | Replace challenge / approach / result with the real project story, set `placeholder: false`. |
| **Response time** | `contact.response` | Change "Usually replies within 24 hours" if it isn't accurate. |
| "Two rounds of revisions" | about, process, FAQ | Check it matches how you actually work. |

When everything is real, set `showPlaceholderTags: false` in `js/config.js`. That hides any remaining tags.

---

## 5. Add your headshot

1. Save a portrait (about **800 × 1000 px**) as `images/waleed-headshot.jpg`.
2. In `js/config.js` set:
   ```js
   headshot: 'images/waleed-headshot.jpg',
   ```
3. Refresh. The photo replaces the 3D book in the About section, in a gold-edged frame with a small name tag.

Set it back to `null` to show the book again.

---

## 6. Swap or add images

The category keys are `children`, `comic`, `character`, `cover`, `map`, `sketch` (Line Art & Sketch), `handdrawn` (Ink & Watercolor) and `wrap`.

1. Save three versions with the same name, e.g. `wrap-06`:
   - `images/art/wrap-06.jpg`: full size
   - `images/thumbs/wrap-06.webp`: ~760 px on the longest side
   - `images/thumbs-sm/wrap-06.webp`: ~420 px

   (squoosh.app or any image editor can export WebP.)
2. Add one line to `js/config.js` → `artworks`:
   ```js
   { id: 'wrap-06', cat: 'wrap', w: 760, h: 520, title: 'Coffee Van Livery',
     alt: 'Describe what is in the picture', brief: 'One line on the job it does.',
     role: 'Wrap design & layout', deliverables: 'Print-ready wrap panels' },
   ```
   `w` and `h` are the picture's width and height; they keep the grid from cropping it.

Counts, filters, the grid, film-strips, the drawer and the viewer all update by themselves.

### The 3D books (only if you change their pictures)

- **Hero book:** the cover and pages are listed in `BOOK` in `js/main.js` and in `tools/make-textures.py`. The left-page caption of each spread is the artwork's `story` line in `js/config.js` (falls back to `brief`). Optional `fx` (0–1) sets where a wide picture is trimmed on the right-hand page.
- **Service visuals:** built in `svcVisual()` in `js/main.js` (styles under "service-card visuals" at the end of `css/style.css`). Only Book Cover Design is a 3D book; its cover is in `SVC_BOOKS` and `SVC` in `tools/make-textures.py`.

After changing either one, run:

```bash
python tools/make-textures.py      # needs Python 3 + Pillow:  pip install pillow
```

---

## 7. Change the Upwork link

At the top of `js/config.js`:

```js
upwork: 'https://www.upwork.com/freelancers/~017a65fa7e10d206ea',
```

Every "Hire me" / "Discuss this project" button uses it. Copies also appear in:
- the `<noscript>` block at the bottom of `index.html`;
- the JSON-LD `sameAs` line in the `<head>`.

---

## 8. Publish (Netlify drag-and-drop)

1. Go to **app.netlify.com** → *Add new site* → *Deploy manually*.
2. Drag the whole site folder onto the page. It is live in seconds. Netlify compresses HTML/CSS/JS automatically and applies the cache rules in `_headers`.
3. **Custom domain:** *Site settings → Domain management → Add a domain*, then follow the DNS steps. HTTPS is switched on automatically.
4. **Social preview:** in the `<head>` of `index.html`:
   - Replace `images/og-image.jpg` (in `og:image` and `twitter:image`) with the full address, e.g. `https://your-site.netlify.app/images/og-image.jpg`.
   - Un-comment the `og:url` / `canonical` line and put your address in it.

   Facebook, LinkedIn and X need full URLs.

---

## 9. Known limits

- The page is tested on a computer **without a graphics card**, where the 3D renders on the CPU. Real-GPU frame rates and the feel of the animations must be checked on a real laptop and phone. See `CHANGELOG.md` → Step 7.
- **Fonts stay inside the CSS file** (`css/fonts.css`, ~230 KB) on purpose. Fonts loaded as separate files do not work from a double-clicked file in Chrome.
- **Social sharing previews** only work once the site is online, with full image URLs (step 8).
