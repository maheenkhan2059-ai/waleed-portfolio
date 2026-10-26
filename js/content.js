/* ==========================================================================
   WALEED MALIK — ALL PAGE TEXT
   Edit the words between the quote marks; keep the commas. Save, refresh.
   *word* = gold italic highlight in headings.

   Anything marked  REPLACE  or  SAMPLE  is a stand-in for real data (reviews,
   case-study results, response time). Those items show a small "Sample" /
   "Placeholder" tag on the page until you replace them and set  placeholder: false.
   ========================================================================== */
window.WM_CONTENT = {

  nav: [
    { id: 'home', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'services', label: 'Services' },
    { id: 'work', label: 'Work' }, { id: 'process', label: 'Process' }, { id: 'skills', label: 'Skills' },
    { id: 'testimonials', label: 'Reviews' }, { id: 'faq', label: 'FAQ' }, { id: 'contact', label: 'Contact' }
  ],

  hero: {
    eyebrow: "Children's book illustrator · Now booking new stories",
    name: 'Waleed Malik',
    positioning: "Picture books, comics & characters that children want to step inside.",
    intro: "I paint warm, story-led illustrations for authors, publishers and creators: picture-book spreads, comics, lovable characters, covers and maps. You approve every sketch along the way, and you receive files that are ready for print.",
    ctaWork: 'Open the portfolio',
    ctaHire: 'Start your book on Upwork',
    facts: [ { value: '8', label: 'disciplines' }, { value: '44', label: 'illustrations', auto: true }, { value: '$20/hr', label: 'on Upwork' }, { value: 'Open', label: 'for new books' } ]
  },

  about: {
    label: 'About me',
    title: 'I draw the pictures that make *stories come alive.*',
    sub: 'Characters, spreads, covers and print files: one illustrator, from the first sketch to the final page.',
    bio: [
      "I'm Waleed Malik, a children's book illustrator working with authors and publishers around the world through Upwork. I paint digitally in Procreate and Photoshop, and traditionally with pencil, pen, ink and watercolor.",
      "Most of my days are spent inside picture books: designing characters children fall in love with, painting spreads that carry the story, and drawing comics with real comic timing. I also create book covers, storybook maps, line art and coloring pages, ink and watercolor pieces, and the occasional vehicle wrap for a small business.",
      "Authors tell me they enjoy how calm the process feels. You see rough sketches before anything is painted, you get regular updates, and your final files are prepared for exactly where the book is going: KDP, IngramSpark or your own printer."
    ],
    knownFor: [
      { title: 'Characters kids fall in love with', text: 'Expressive, on-model characters that stay consistent from the first page to the last.' },
      { title: 'Spreads that carry the story', text: 'Every page leaves space for your words and gently leads little readers to the page turn.' },
      { title: 'Comics with real timing', text: 'Clear panel flow, lively acting and lettering that lands the joke or the twist.' },
      { title: 'Print-ready delivery', text: 'Correct trim, bleed, resolution and color mode, so your book goes straight to print.' }
    ],
    howTitle: 'How we work together',
    how: [
      'You share your manuscript or idea, references and deadline.',
      'I reply with questions and a clear quote through Upwork.',
      'You approve rough sketches before any color is added.',
      'Two rounds of revisions are included in every milestone.',
      'Final files arrive in the formats and sizes your printer needs.'
    ],
    toolsTitle: 'Tools',
    tools: ['Procreate', 'Photoshop', 'Adobe Illustrator', 'Pencil & ink', 'Watercolor']
  },

  services: {
    label: 'Services',
    title: 'How I can help *your story.*',
    sub: 'Eight ways to bring your book, comic or brand to life, each with clear deliverables and a quote tailored to your project.',
    cta: 'Discuss this project',
    items: {
      children: { value: 'Picture-book spreads full of warmth and wonder that carry your story and leave room for your words.', who: 'Children’s authors, self-publishers, educational publishers, picture-book and early-reader projects', get: ['Storyboard of every spread', 'Character reference sheet', 'Full-color spreads with text-safe areas', 'Print-ready KDP / IngramSpark PDF with bleed', 'Layered source files on request'] },
      comic: { value: 'Comic pages and strips with clear panel flow, lively acting and lettering that lands every beat.', who: 'Kids’ comic and webcomic creators, graphic-novel writers, educators and brands telling a story in panels', get: ['Panel layout thumbnails', 'Pencils and inks', 'Flat or full color', 'Speech bubbles and sound-effect lettering', 'Web and print exports'] },
      character: { value: 'Characters with heart and personality, designed to stay on-model across a whole book or series.', who: 'Children’s authors, series creators, game and animation teams, brands needing a friendly mascot', get: ['Silhouette and concept sketches', 'Final color design', 'Front, side & back character views', 'Expression and pose sheet', 'Color palette guide'] },
      cover: { value: 'A cover that reads at thumbnail size, sparks curiosity and makes little hands reach for your book.', who: 'Children’s and middle-grade authors, indie presses, series that need a consistent look', get: ['2–3 rough cover concepts', 'Final illustrated front cover', 'Title lettering or space for typography', 'Full wrap with spine and back on request', 'eBook and print versions'] },
      map: { value: 'Storybook and fantasy maps that are a joy to explore and easy to read.', who: 'Fantasy and middle-grade authors, game and tabletop designers, tourism boards, campuses', get: ['Layout sketch with key locations', 'Full-color illustrated map', 'Labels, legend and compass', 'Vector source (Illustrator) where suitable', 'Poster, endpaper and web exports'] },
      sketch: { value: 'Clean line art, coloring pages and step-by-step drawings with crisp, closed lines.', who: 'Coloring-book publishers, activity-book authors, course creators and art teachers', get: ['Pencil roughs', 'Clean inked line art', 'Step-by-step construction stages', 'Transparent PNG layers', 'Print-ready PDF'] },
      handdrawn: { value: 'Real ink and watercolor artwork with the soft texture that digital polish cannot fake.', who: 'Picture books with a traditional feel, magazines and editorial, menus, packaging and gifts', get: ['Ink, pencil or watercolor artwork', 'High-resolution scan', 'Digital clean-up and color correction', 'Print-ready files', 'Original artwork on request'] },
      wrap: { value: 'Playful, eye-catching vehicle wraps and decals that stay readable from across the street.', who: 'Food-truck owners, trade and service businesses, car owners wanting custom decals', get: ['Design on your vehicle template', 'All sides, rear and roof', 'Logo, menu and contact layout', 'Mock-up previews', 'Installer-ready vector files'] }
    }
  },

  work: {
    label: 'Selected work',
    title: 'Stories, characters and *the full portfolio.*',
    sub: 'Three projects in depth, then every illustration by discipline. Click any image to see the brief, my role and the deliverables.',
    featuredLabel: 'Featured stories',
    gridLabel: 'All work',
    // REPLACE: the challenge / approach / result details are written from the artwork itself;
    // replace them with the real project story and set placeholder: false.
    featured: [
      { img: 'children-01', placeholder: true, tag: "Children's Book Illustration", title: 'A storybook spread built around a friendship',
        challenge: 'Show two very different characters as instant friends, in a magical setting, while leaving clear space for the story text.',
        approach: 'A rounded tree-hollow composition hugs both characters. One warm lantern light sets a cozy bedtime mood and keeps the faces readable.',
        result: 'A finished spread with a defined text area, delivered as a print-ready file with bleed.' },
      { img: 'character-05', placeholder: true, tag: 'Character Design', title: 'From construction sketch to a grandfather kids adore',
        challenge: 'Design a grandfather with warmth and humor who stays consistent across every scene of a picture book.',
        approach: 'Simple shapes first, then proportions, glasses, posture and cane as character cues, finished with a gentle, limited palette.',
        result: 'An approved sketch sheet and a final color design that keeps him on-model on every page.' },
      { img: 'comic-01', placeholder: true, tag: 'Comics', title: 'A four-panel strip with perfect comic timing',
        challenge: 'Tell a complete, funny story about sharing in just four panels that young readers understand at a glance.',
        approach: 'Bold color blocking per panel, big readable expressions and lettering that builds to the punchline in the last frame.',
        result: 'A finished strip with clean lettering, exported for both web and print.' }
    ]
  },

  process: {
    label: 'Process',
    title: 'Five steps from your idea to *a print-ready book.*',
    sub: 'The same gentle, clear process on every project, so you always know what happens next.',
    steps: [
      { n: '01', title: 'Your story', text: 'You share the manuscript, audience, trim size, deadline and references. I ask the questions that prevent surprises later.', img: 'children-04', crop: 'brief' },
      { n: '02', title: 'Sketch', text: 'Rough sketches lock in composition, characters and page layout. Nothing is painted until you approve them.', img: 'character-05', crop: 'sketch' },
      { n: '03', title: 'Feedback', text: 'Two rounds of revisions per milestone, while changes are still quick and easy.', img: 'sketch-02', crop: 'feedback' },
      { n: '04', title: 'Final art', text: 'Clean line, color and lighting on the approved sketch, with progress updates along the way.', img: 'character-05', crop: 'final' },
      { n: '05', title: 'Print-ready delivery', text: 'Files prepared for where they will be used: KDP or IngramSpark PDFs with bleed, cover wraps, layered sources and web exports.', img: 'cover-01', crop: 'print' }
    ],
    // drag-to-compare card at the end of the process (crops of character-05 and sketch-02, made by hand in images/compare/)
    compare: {
      title: 'Sketch to final',
      text: 'Drag across the picture to compare the drawing underneath with the finished art.',
      sets: [
        { key: 'grandfather', label: 'Grandfather', before: 'Sketch', after: 'Final color', altBefore: 'Construction sketch of the grandfather character with his cane, by Waleed Malik', altAfter: 'The finished, colored grandfather character, by Waleed Malik' },
        { key: 'girl', label: 'Coloring', before: 'Line art', after: 'Flat color', altBefore: 'Line art of a girl’s face, by Waleed Malik', altAfter: 'The same girl’s face with base flat color, by Waleed Malik' }
      ]
    }
  },

  skills: {
    label: 'Tools & skills',
    title: 'Tools and *expertise.*',
    sub: 'Digital and traditional, with the production know-how to get your book printed.',
    groups: [
      { name: 'Software', items: ['Procreate', 'Photoshop', 'Adobe Illustrator'] },
      { name: 'Traditional', items: ['Pencil', 'Pen & ink', 'Watercolor'] },
      { name: 'Styles & disciplines', items: ["Children's book illustration", 'Comics', 'Character design', 'Book covers', 'Storybook maps', 'Line art & coloring pages', 'Ink & watercolor', 'Vehicle wraps & decals'] },
      { name: 'Print & production', items: ['KDP & IngramSpark specs', 'Bleed, trim & safe areas', 'CMYK print files', 'Cover wraps & spines', 'Book layout', 'Web & eBook exports'] }
    ]
  },

  testimonials: {
    label: 'Client reviews',
    title: 'Kind words from *authors & clients.*',
    sub: 'What it’s like to bring a story to life together.',
    // Each review below is a SAMPLE written for layout only. Before launch, replace the quote, name, role and
    // project with a real Upwork review (with the client's permission) and set placeholder: false.
    // While placeholder is true the card shows a small "Sample" tag. rating = number of stars (1–5).
    items: [
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Sarah', role: "Children's Author", project: '32-page picture book',
        quote: 'Waleed brought my picture book to life in ways I never imagined. He shared sketches for every spread before painting, listened to every little note, and the final files went straight to KDP without a single problem. My niece now asks for “the badger book” every night!' },
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Daniel', role: 'Self-Publisher', project: 'Middle-grade book cover',
        quote: 'The cover is stunning, and it still reads beautifully as a tiny thumbnail on Amazon. Waleed gave me three concepts, helped me pick the strongest one and handled the spine and back cover too. Easy to work with from start to finish.' },
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Amira', role: 'Educational Publisher', project: 'Character design for a reading series',
        quote: 'We needed a cast of characters that would stay consistent across a whole series. The turnarounds and expression sheets were thorough and full of personality, and our other artists could pick them up straight away.' },
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Tom', role: 'Fantasy Author', project: 'Storybook map',
        quote: 'My fantasy world finally has a map! Waleed turned my rough notes into a charming, easy-to-read map that readers love exploring. He even suggested little details that made the world feel more alive.' },
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Grace', role: 'Webcomic Creator', project: 'Kids’ comic strips',
        quote: 'Clear panels, lively expressions and spot-on comic timing. Waleed understood the humor straight away, and the lettering was clean and easy for young readers to follow.' },
      // <!-- SAMPLE – replace with real client review before launch -->
      { placeholder: true, rating: 5, name: 'Lena', role: "Children's Author", project: 'Watercolor bedtime story',
        quote: 'I wanted a soft, dreamy feel for my bedtime story and Waleed captured it perfectly. He was patient, always on time with updates, and the artwork is even lovelier in print.' }
    ]
  },

  faq: {
    label: 'FAQ',
    title: 'Before we *begin.*',
    sub: 'Rights, revisions, files, timelines and payment.',
    // left column under the heading: how to start + what to send for a quote (matches the first Process step)
    aside: {
      title: 'Not sure where to start?',
      text: 'You don’t need a finished brief. Tell me about your story and I’ll ask the right questions before anything is drawn.',
      listTitle: 'For a clear quote, send me:',
      list: ['What you need: picture-book spreads, a cover, characters, a comic, a map or a wrap', 'Trim size, page count or your printer / KDP template', 'Your deadline', 'Your manuscript or a short summary', 'Illustrations or styles you love'],
      cta: 'Ask a question on Upwork'
    },
    items: [
      { q: 'Who owns the rights to the artwork?', a: 'After the final payment you receive the usage rights agreed in the Upwork contract, usually full commercial rights for your book, cover, comic or map. I keep the right to show the work in my portfolio unless you ask me not to.' },
      { q: 'How many revisions are included?', a: 'Two rounds of revisions per milestone, mainly at the sketch stage where changes are quick. Small color adjustments on final art are always fine. Larger changes after color approval are quoted before any work starts.' },
      { q: 'What file formats will I receive?', a: 'High-resolution PNG and JPG as standard. Print-ready PDF with bleed for books and covers, layered PSD or Procreate files on request, and vector AI, PDF or SVG files for maps, wraps and decals.' },
      { q: 'How long does a picture book take?', a: 'It depends on the number of spreads and the level of detail. A single character or cover is much quicker than a full 32-page book. You get a schedule with clear milestones before we start.' },
      { q: 'Can you set up files for KDP, IngramSpark or my printer?', a: 'Yes. Send the trim size and page count or your printer’s template and I prepare the artwork with the correct bleed, spine width and safe areas.' },
      { q: 'How does payment work?', a: 'All projects run through Upwork at $20/hr or as fixed-price milestones. Your payment is protected by Upwork and you release each milestone when you are happy with it.' },
      { q: 'Can you work in my existing style or with my characters?', a: 'Yes. I study your existing artwork or style guide and keep new illustrations consistent with it, so a series always feels like one world.' }
    ]
  },

  contact: {
    label: 'Contact',
    title: 'Have a story that is *waiting for pictures?*',
    text: 'Tell me about your book, comic or character on Upwork. I’ll reply with questions, a first idea and a clear quote.',
    cta: 'Start your book on Upwork',
    availability: 'Available for new books',
    response: 'Usually replies within 24 hours', // REPLACE if your usual response time is different
    rate: '$20/hr · fixed-price milestones available'
  },

  footer: {
    tagline: "Children's book illustrator: picture books, comics, characters, book covers, storybook maps, line art, ink & watercolor, and vehicle wraps."
  }
};
