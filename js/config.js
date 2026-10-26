/* ==========================================================================
   WALEED MALIK — CONFIG
   Upwork link, the 8 categories and the artwork list (titles, alt text and
   what the case viewer shows). Page copy lives in js/content.js.
   w / h = the picture's real proportions (so the grid never crops a comic or wrap).
   ========================================================================== */
window.WM_CONFIG = {
  upwork: 'https://www.upwork.com/freelancers/~017a65fa7e10d206ea',
  // HEADSHOT SLOT: put a portrait in images/ (e.g. images/waleed-headshot.jpg, about 800×1000 px) and set its path here.
  // It then replaces the 3D book in the About section. null = keep the book.
  headshot: null,

  /* Small "Sample" / "Placeholder" tags on content that still needs real data (see content.js).
     Set to false only after every sample review and every item marked REPLACE has been replaced. */
  showPlaceholderTags: true,

  /* LOADING SCREEN: the longest time (in milliseconds) it may stay on screen while the 3D book gets ready.
     1000 = 1 second. Bigger number = the book is more often fully ready (smooth turning) when the page appears.
     It still goes away earlier if everything is ready sooner. */
  loader: { maxMs: 3000 },

  motion: { smoothScroll: 0.09 },
  // pagesDesktop / pagesMobile = how many page turns the hero book has (it shows one more page than this)
  three: { maxPixelRatio: 1.25, dustDesktop: 600, dustMobile: 160, objectsDesktop: 1, objectsMobile: 0.4, pagesDesktop: 8, pagesMobile: 5 },

  /* The 8 disciplines, in display order */
  categories: [
    { key: 'children',  name: "Children's Book Illustration", short: "Children's Books" },
    { key: 'comic',     name: 'Comics',                         short: 'Comics' },
    { key: 'character', name: 'Character Design',               short: 'Characters' },
    { key: 'cover',     name: 'Book Cover Design',              short: 'Book Covers' },
    { key: 'map',       name: 'Map Illustration',               short: 'Maps' },
    { key: 'sketch',    name: 'Line Art & Sketch',              short: 'Line Art & Sketch' },
    { key: 'handdrawn', name: 'Ink & Watercolor',               short: 'Ink & Watercolor' },
    { key: 'wrap',      name: 'Vehicle Wrap & Decal Design',    short: 'Vehicle Wraps' }
  ],

  /* Typical tools per discipline (shown as "Typical tools" in the case viewer) */
  tools: {
    children: 'Procreate · Photoshop', cover: 'Procreate · Photoshop · type layout', character: 'Procreate · Photoshop',
    map: 'Adobe Illustrator · Photoshop', sketch: 'Procreate · pen & pencil', comic: 'Procreate · Photoshop · ink',
    handdrawn: 'Pen, ink & watercolor · Photoshop clean-up', wrap: 'Adobe Illustrator · Photoshop'
  },

  /* ARTWORKS — id = file name in images/art (.jpg), images/thumbs and images/thumbs-sm (.webp)
     title: shown on the grid · alt: describes the picture · brief: one line on the job it does
     role / deliverables: shown in the case viewer
     story: the short storybook caption printed on the LEFT page of the hero book (only needed for book pages)
     fx: optional horizontal focus (0–1) used when a wide picture is trimmed to fit the book's right-hand page */
  artworks: [
    // Children's Book Illustration
    { id: 'children-01', cat: 'children', w: 760, h: 415, fx: 0.66, title: 'Tea in the Glowing Tree', alt: "Warm storybook illustration of a curly-haired girl sharing tea with a badger inside a glowing tree hollow, by Waleed Malik", brief: 'A cozy friendship spread lit by lanterns, with room left for the story text.', story: 'Deep inside the old oak, a girl and her badger friend poured tea by lantern-light, while the mushrooms glowed to listen in.', role: 'Illustration, color & lighting', deliverables: 'Full-bleed spread · print-ready file with bleed' },
    { id: 'children-02', cat: 'children', w: 760, h: 415, fx: 0.72, title: 'River-Stone Adventure', alt: "Children's book illustration of a boy hopping across mossy river stones in a jungle while a toucan watches, by Waleed Malik", brief: 'An adventure spread with a clear left-to-right path that pulls readers to the page turn.', story: 'One stone, two stones, three! Leo leapt across the river while the toucan cheered him on from the branches.', role: 'Illustration, color & composition', deliverables: 'Full-bleed spread · print-ready file with bleed' },
    { id: 'children-03', cat: 'children', w: 760, h: 415, title: 'Market Day in the Village', alt: "Picture-book illustration of a cobbled village street with a baker, a vegetable cart and two children drawing in chalk, by Waleed Malik", brief: 'A setting spread that introduces the whole world of the story in one picture.', story: 'On market day the whole village woke up early: the baker waved, the cart rattled by, and the children chalked their dreams on the stones.', role: 'Environment illustration & color', deliverables: 'Full-bleed spread · layered source file' },
    { id: 'children-04', cat: 'children', w: 760, h: 415, title: 'One World, Ten Stories', alt: "Children's book series concept sheet of ten small illustrated vignettes, including a galactic mail courier and a library knight, by Waleed Malik", brief: 'Ten story ideas painted as vignettes so a picture-book series can be pitched and planned.', story: 'A mail courier among the planets, a knight who guards the library, a mouse on a tightrope: ten little worlds, each waiting for its own book.', role: 'Concept development & character ideas', deliverables: 'Concept sheet · individual vignettes' },
    { id: 'children-05', cat: 'children', w: 760, h: 415, fx: 0.52, title: 'Bedtime by the Moonlit Window', alt: "Soft bedtime-story illustration of a child in pajamas kneeling by a moonlit bedroom window with teddy bears, by Waleed Malik", brief: 'A quiet bedtime spread with the moon as the only light source.', story: 'When the house was asleep, Mia knelt by the window and whispered goodnight to the moon. The moon, of course, whispered back.', role: 'Illustration, color & lighting', deliverables: 'Full-bleed spread · print-ready file with bleed' },
    { id: 'children-06', cat: 'children', w: 405, h: 619, title: 'Foraging in the Autumn Wood', alt: "Painterly children's book illustration of a father and son foraging for mushrooms in a red autumn forest, by Waleed Malik", brief: 'A rich autumn scene with a clear focal point and quiet space for text at the top.', story: 'Basket in hand, Grandpa showed Sam which mushrooms were for soup and which belonged to the fairies.', role: 'Illustration, color & mood', deliverables: 'Full-page illustration · print-ready file with bleed' },
    // Comics
    { id: 'comic-01', cat: 'comic', w: 452, h: 678, title: 'The Cookie Standoff', alt: 'Four-panel kids comic strip of a brother and sister arguing over a plate of cookies and agreeing to share, by Waleed Malik', brief: 'A four-panel strip with clear timing from set-up to punchline.', story: '“Finally, cookies all to myself!” “Not so fast…” Some arguments can only end one way: half and half.', role: 'Script layout, art, color & lettering', deliverables: 'Strip for web and print' },
    { id: 'comic-05', cat: 'comic', w: 366, h: 546, title: 'Night Flight Over the City', alt: 'Full-color comic page of a boy floating above city rooftops at night, with close-up reaction panels, by Waleed Malik', brief: 'A cinematic comic page that builds from quiet close-ups to a big reveal panel.', story: 'He looked down at the sleeping city and realized his feet were no longer touching the roof.', role: 'Layout, pencils, inks & color', deliverables: 'Comic page · print-ready and web files' },
    { id: 'comic-06', cat: 'comic', w: 449, h: 683, title: 'Everyday Heroes', alt: 'Full-color comic page of a teenager’s morning at home and on the walk to school, with speech bubbles, by Waleed Malik', brief: 'A dialogue-driven slice-of-life page with clear reading order and expressive acting.', role: 'Layout, art, color & lettering', deliverables: 'Comic page · print-ready and web files' },
    { id: 'comic-04', cat: 'comic', w: 452, h: 678, title: 'Inked Action Page', alt: 'Black-and-white inked superhero comic page with dramatic action panels and a BOOM sound effect, by Waleed Malik', brief: 'A dynamic action page with strong blacks and readable panel flow.', role: 'Pencils & inks', deliverables: 'Inked page · print-ready file' },
    { id: 'comic-03', cat: 'comic', w: 493, h: 740, title: 'Winged Hero Key Art', alt: 'Comic cover art of a winged hero in goggles leaping between skyscrapers, seen from above, by Waleed Malik', brief: 'Cover / key art with a dramatic downward camera angle.', role: 'Illustration & color', deliverables: 'Cover art · key-art file' },
    { id: 'comic-02', cat: 'comic', w: 526, h: 704, title: 'Y2K Pop-Art Comic Poster', alt: 'Pop-art comic poster of a girl with sunglasses and braids surrounded by speech bursts, by Waleed Malik', brief: 'Comic-style poster with halftone, bold type and speech bursts.', role: 'Illustration, color & lettering', deliverables: 'Poster file · print-ready' },
    // Character Design
    { id: 'character-06', cat: 'character', w: 447, h: 447, title: 'Series Line-up: Kids & Bikes', alt: 'Character line-up of three cheerful kids standing with their bikes for a children’s book series, by Waleed Malik', brief: 'A matching cast for a series: distinct silhouettes, one shared style.', story: 'Three best friends, three bikes, one summer. Every great series starts with a cast you can’t wait to follow.', role: 'Cast design & color', deliverables: 'Line-up · individual character files' },
    { id: 'character-01', cat: 'character', w: 405, h: 386, title: 'The Lanky Teacher: Sketch to Final', alt: 'Character design sheet of a lanky teacher, from construction sketches and turnaround to the final colored character, by Waleed Malik', brief: 'The full process: construction sketches, turnaround, then final color.', role: 'Character design, turnaround & color', deliverables: 'Sketch sheet · turnaround · final color design' },
    { id: 'character-05', cat: 'character', w: 405, h: 386, title: 'The Grandfather: Sketch to Final', alt: 'Character design of a grandfather with glasses and a cane, from sketch construction to the final colored character, by Waleed Malik', brief: 'From rough construction to a finished, on-model character full of warmth.', role: 'Character design & color', deliverables: 'Construction sketches · final color design' },
    { id: 'character-04', cat: 'character', w: 640, h: 489, title: 'Action-Pose Model Sheet', alt: 'Character model sheet of a boy in eight energetic action poses, by Waleed Malik', brief: 'Eight poses that keep the character on-model in any scene.', role: 'Pose design & model sheet', deliverables: 'Model sheet · individual poses on transparent background' },
    { id: 'character-02', cat: 'character', w: 443, h: 626, title: 'Streetwear Bear Mascot', alt: 'Mascot character design of a cool bear in sunglasses carrying a boombox, by Waleed Malik', brief: 'A merch-ready mascot with a bold silhouette for apparel and stickers.', role: 'Mascot design & color', deliverables: 'Mascot artwork · transparent PNG for merch' },
    { id: 'character-03', cat: 'character', w: 660, h: 700, title: 'Skater Ant Mascot', alt: 'Mascot character design of a skateboarding ant on a mustard background, by Waleed Malik', brief: 'A mascot with attitude, designed to read at small sizes.', role: 'Mascot design & color', deliverables: 'Mascot artwork · brand-color variations' },
    // Book Cover Design
    // Map Illustration
    { id: 'map-03', cat: 'map', w: 740, h: 740, title: 'Storybook Island Village', alt: 'Storybook fantasy map of an island village with mountains, trails, cottages and a river, by Waleed Malik', brief: 'A fantasy book map planned so the eye travels around the island in one loop.', role: 'Map layout & illustration', deliverables: 'Endpaper / poster map · print-ready file' },
    { id: 'map-05', cat: 'map', w: 735, h: 574, title: 'Illustrated Denver', alt: 'Illustrated tourism map of Denver with roads, landmarks and local icons, by Waleed Malik', brief: 'A tourism map that packs in landmarks while staying easy to read.', role: 'Map illustration & iconography', deliverables: 'Poster map · web version' },
    { id: 'map-06', cat: 'map', w: 621, h: 403, title: 'Watercolor Campus Map', alt: 'Watercolor isometric map of a campus with buildings, lawns and paths, by Waleed Malik', brief: 'A campus map with a hand-painted feel for brochures and signage.', role: 'Isometric illustration & watercolor', deliverables: 'High-res map · print & web versions' },
    { id: 'map-04', cat: 'map', w: 740, h: 555, title: 'City Delivery Infographic Map', alt: 'Isometric city infographic map for a delivery and relocation service, by Waleed Malik', brief: 'An infographic map that explains a service at a glance.', role: 'Isometric illustration & layout', deliverables: 'Vector infographic · editable source' },
    { id: 'map-02', cat: 'map', w: 587, h: 760, title: 'Transit Route Map', alt: 'Transit system route map with colored lines, stations and a legend, by Waleed Malik', brief: 'A wayfinding map built in vector for clarity at any size.', role: 'Vector map design', deliverables: 'Vector map (AI / PDF / SVG)' },
    { id: 'map-01', cat: 'map', w: 736, h: 417, title: 'Digital City Route', alt: 'Digital city map with a glowing route path and location pins, by Waleed Malik', brief: 'An app / UI map visual with a clear highlighted route.', role: 'Digital map illustration', deliverables: 'Web / app-ready image' },
    // Line Art & Sketch
    { id: 'sketch-04', cat: 'sketch', w: 447, h: 447, title: 'The Attic of Old Toys', alt: 'Detailed black-and-white line art of an attic full of old toys, a dollhouse and a tea set, by Waleed Malik', brief: 'A richly detailed coloring page packed with things to find and color.', story: 'Up in the attic, the old toys waited under the skylight: a dollhouse, a tea set and a bear, all ready for someone to bring them back to color.', role: 'Clean line art', deliverables: 'Print-ready coloring page · transparent PNG' },
    { id: 'sketch-03', cat: 'sketch', w: 534, h: 360, title: 'Playroom Coloring Page', alt: 'Black-and-white line art of a cozy playroom with a sofa, toys, a rug and a teddy bear, by Waleed Malik', brief: 'Kid-friendly line art with clean closed shapes that are easy to color.', role: 'Clean line art', deliverables: 'Print-ready coloring page · vector-ready line' },
    { id: 'sketch-05', cat: 'sketch', w: 643, h: 600, title: 'Reading Corner', alt: 'Line art of a girl lying on the floor reading a book among plants, cushions and stacks of books, by Waleed Malik', brief: 'A calm coloring scene with patterns and textures to fill in.', role: 'Clean line art', deliverables: 'Print-ready coloring page' },
    { id: 'sketch-06', cat: 'sketch', w: 443, h: 451, title: 'Happy Desserts', alt: 'Cute line art of smiling cakes, cookies and desserts with strawberries, by Waleed Malik', brief: 'Cute characters in bold, friendly outlines for a young coloring audience.', role: 'Character line art', deliverables: 'Print-ready coloring page · transparent PNG' },
    { id: 'sketch-07', cat: 'sketch', w: 386, h: 367, title: 'Mountain Lake Sketch', alt: 'Pen line sketch of a mountain lake with pine trees and wildflowers in the foreground, by Waleed Malik', brief: 'A loose landscape in pure line, from distant peaks to foreground flowers.', role: 'Landscape line drawing', deliverables: 'High-res scan · cleaned line art' },
    { id: 'sketch-08', cat: 'sketch', w: 500, h: 500, title: 'Portrait with a Shaggy Dog', alt: 'Line art portrait of a man in a checked coat sitting on a bench beside a shaggy dog, by Waleed Malik', brief: 'Portrait line art that captures likeness and texture with very few lines.', role: 'Portrait line art', deliverables: 'Clean line art · print-ready file' },
    { id: 'sketch-01', cat: 'sketch', w: 720, h: 533, title: 'Drawing Hands: Construction to Finish', alt: 'Pencil sketches of hands progressing from simple boxes to finished drawings, front and side views, by Waleed Malik', brief: 'An anatomy tutorial that breaks a difficult subject into simple steps.', role: 'Tutorial drawings', deliverables: 'Step-by-step line art · course-ready images' },
    { id: 'sketch-02', cat: 'sketch', w: 513, h: 598, title: 'Six-Step Coloring Process', alt: 'Six-step coloring process for a girl character, from line art to final highlights, by Waleed Malik', brief: 'A process tutorial: line art, flats, light and shadow, and details.', role: 'Line art, color & tutorial layout', deliverables: 'Process sheet · individual steps' },
    // Ink & Watercolor
    { id: 'handdrawn-01', cat: 'handdrawn', w: 760, h: 536, title: 'Café Reportage Sketchbook', alt: 'Pen and ink sketchbook spread of people drawn from life in a café, by Waleed Malik', brief: 'Reportage drawing from life, capturing people and atmosphere in ink.', role: 'Observational ink drawing', deliverables: 'High-res scan · cleaned digital file' },
    { id: 'handdrawn-02', cat: 'handdrawn', w: 760, h: 551, title: 'Workshop in Watercolor', alt: 'Watercolor and pencil illustration of a worker using a long-handled tool in a workshop, by Waleed Malik', brief: 'An editorial watercolor that shows a tool in real use.', role: 'Watercolor illustration', deliverables: 'Scanned artwork · print & web files' },
    // Vehicle Wrap & Decal Design
    { id: 'wrap-01', cat: 'wrap', w: 760, h: 571, title: 'Bucqa Gourmet Food Truck', alt: 'Red food truck wrap for Bucqa gourmet food with a sunburst pattern and a large logo, by Waleed Malik', brief: 'A food-truck wrap with branding readable from across the street.', role: 'Wrap design & layout', deliverables: 'Print-ready wrap panels · mock-up' },
    { id: 'wrap-02', cat: 'wrap', w: 679, h: 452, title: 'Colorful Food-Truck Wrap', alt: 'Colorful food truck wrap with food photography and a cartoon mascot, shown in a garage, by Waleed Malik', brief: 'Bold food-truck livery combining photography, mascot and menu cues.', role: 'Wrap design & layout', deliverables: 'Print-ready wrap panels' },
    { id: 'wrap-03', cat: 'wrap', w: 640, h: 480, title: 'VIP Welding & Fabrication', alt: 'Stars-and-stripes wrap on a VIP Welding & Fabrication service truck, by Waleed Malik', brief: 'A service-truck wrap that puts services and phone number front and center.', role: 'Wrap design & layout', deliverables: 'Print-ready wrap panels' },
    { id: 'wrap-06', cat: 'wrap', w: 600, h: 338, title: 'Camo Splash Pickup', alt: 'Pickup truck with a green and orange camouflage paint-splash wrap, by Waleed Malik', brief: 'An outdoor-style graphic wrap with a painterly splash finish.', role: 'Wrap concept & mock-up', deliverables: 'Mock-up · print-ready panels' },
    { id: 'wrap-07', cat: 'wrap', w: 447, h: 447, title: 'Sebago Signworks Fleet', alt: 'Black and orange fleet wrap for Sebago Signworks shown on two pickup trucks, by Waleed Malik', brief: 'Clean fleet branding that stays consistent across every vehicle.', role: 'Fleet wrap design', deliverables: 'Side-view mock-ups · print-ready panels' },
    { id: 'wrap-08', cat: 'wrap', w: 554, h: 426, title: 'Orange Shred Pickup', alt: 'Pickup truck with an orange, black and white shredded-graphic wrap, shown from both sides, by Waleed Malik', brief: 'An aggressive graphic wrap designed around the truck’s body lines.', role: 'Wrap concept & mock-up', deliverables: 'Side-view mock-ups · vector graphic' },
    { id: 'wrap-04', cat: 'wrap', w: 681, h: 450, title: 'Tiger-Stripe Pickup', alt: 'Black pickup truck with a green tiger-stripe wrap, shown from both sides, by Waleed Malik', brief: 'Design mock-up of an aggressive graphic wrap for a pickup.', role: 'Wrap concept & mock-up', deliverables: 'Side-view mock-ups · vector graphic' },
    { id: 'wrap-05', cat: 'wrap', w: 447, h: 447, title: 'Tribal Dragon Decal', alt: 'Tribal dragon decal design shown flat and applied to a yellow hatchback, by Waleed Malik', brief: 'Cut-vinyl decal designed as clean vector shapes, then previewed on the car.', role: 'Decal design', deliverables: 'Cut-ready vector · on-car preview' }
  ]
};
