# BUILD NOTES, preview-2026-10-15 (not part of the site)

## Rebuild
    cd design && python3 build_preview.py        # empties this folder, rebuilds, then runs check_preview.py (exit 1 if a check fails)
    python3 check_preview.py                     # checks only
    python3 compare_essay.py                     # proof the essay page is unchanged except its chrome (old 10-14 vs this build)
    cd preview-2026-10-15 && python3 -m http.server 8797 --bind 127.0.0.1

## What changed vs 10-14
- Same URLs: / , essay/ , how/ , sources/ , thesis/ , cut/ (each folder holds index.html).
- how/, sources/, thesis/, cut/ are now the approved D2 pages (review-2026-10-15/d2-art-director), copied with paths and links rewritten (menu and doors point to ../how/ etc., canister to ../). The old generated pages are gone; css/site-old.css, side.css, navpeek.* and js/ are no longer built.
- Shared files: css/inner.css (D2 style.css, fonts at ../fonts), css/essay-chrome.css (essay only), fonts/ (D2 set; Schola and Libre Franklin are byte-identical to the landing's), img/ (D2 images), photos/, assets/canister.webp (identical, reused).
- Added at install (no wording or design change): width/height on images, loading=lazy after the first two images, role="presentation" on alt="" images.
- Essay: old back link, text menu and scroll-up menu removed; new film strip (D2 markup, classes prefixed lr-, reveal script in INTENTIONAL mode: hides on scroll down, returns after 450 px continuous scroll up or at the top; ?reveal=quick overrides for testing); head restyled (centred, Sofia Sans title, circled note drawn with a CSS background image); reading column centred as one unit (text + record link) in the 1200 container; "Next in the record" door to ../how/ with "Back to the top" at the end.
- Landing: one line under the buttons, plus a small CSS block appended to fork.css.
- check_preview.py is new (15 checks + 2 info lists); compare_essay.py is new.

## Essay proof (python3 compare_essay.py)
sha256 (old vs new)
file                         old            new            same
essay/essay-enhance.js       6fae75f331b4   6fae75f331b4   YES
essay/record-sheet.js        0dd7b95b258d   0dd7b95b258d   YES
essay/record-sheet2.js       92e1726a191f   92e1726a191f   YES
essay/essay-enhance.css      eb132d3e10f9   eb132d3e10f9   YES
essay/record-sheet.css       1c9dc0d87120   1c9dc0d87120   YES
essay/record-sheet2.css      d5552aa65740   d5552aa65740   YES
essay/photos.json            55c3f5f885c4   55c3f5f885c4   YES
engine8.js                   de17ab6bebb4   de17ab6bebb4   YES
data.js                      0d0c6ad0ce08   0d0c6ad0ce08   YES
diff.js                      a446009670c4   a446009670c4   YES
sketch-mode.js               6ca2ca69bb23   6ca2ca69bb23   YES
latent-mode.js               bf460a1eea3a   bf460a1eea3a   YES
assets/strokes.json          c7154692ff13   c7154692ff13   YES
essay/img/*                  40 files, all byte-identical: YES

The whole essay HTML, with only the named chrome cut out of each side, is byte-identical (592,669 characters). Added/removed: removed div.kick, nav.pages, navpeek css link and script; added div.lr-bar (strip + reveal script), section.lr-next (door), link to css/essay-chrome.css.

## Surprising or worth knowing
- The essay has no doctype or body tag (quirks mode) and a default 8px body margin; essay-chrome.css sets body margin 0 so the strip is full width. Adding a doctype was avoided on purpose.
- The essay already uses .dn, .next, .l and header in its own CSS (.dn is width 0), so the strip and door use lr- class names.
- body.recOpen (phone record sheet only) hides the strip with !important. On desktop the record opens inline, recOpen is not set, and the strip behaves normally; its sticky bar (z-index 50) can sit over the record's sticky text column (top 16px) when it returns.
- Back to the top is href="#" (an id link would not scroll, the strip is sticky).
- The circled note on the essay is a static oval (CSS background image); D2's draw-itself animation needs the SVG element and was not added.
- "Letter" block on how/ quotes Evan with 12 em-dashes in his own words; check iii-d exempts it.
- Outbound citation links (target=_blank rel=noopener) to 9 hosts are allowed by check iv-a; any other external src/url/script fails.
- Landing: buttons move up 11 px on a 1280x800 desktop (one-screen page) and 28 px on a 390 phone (fixed bar grows; the line wraps to two lines).
