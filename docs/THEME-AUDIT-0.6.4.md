# Theme audit — 0.6.4

Before refactoring, style.css contained successive historical LCARS styles and console.css overrode them. The first theme attempt mapped all nav gradients to one pair of colors. Identical colors served both decorative and semantic chart roles. Different golds served the same panel-border role.

## Original literal inventory

### public/style.css

| Literal | Original lines |
|---|---|
| #0c111a | 1 |
| #151d29 | 1 |
| #293548 | 1 |
| #96a7bd | 1 |
| #eaf0f9 | 1 |
| #e8b57e | 1 |
| #85bdfa | 1 |
| #111824 | 1 |
| #73849c | 1 |
| #273143 | 1 |
| #85cead | 1 |
| #365048 | 1 |
| #b9c7d9 | 1 |
| #39465b | 1 |
| #0f1723 | 1 |
| #1e2a3c | 1 |
| #3a4960 | 1 |
| #24202a | 1 |
| #344153 | 1 |
| #29384b | 1 |
| #beadf0 | 1 |
| #28364b | 1 |
| #51677f | 1 |
| #e39797 | 1 |
| #ffd6d6 | 1 |
| #35222c | 1 |
| #7e90aa | 1 |
| #172438 | 2 |
| #d5e3f6 | 2 |
| #edba86 | 4 |
| #9ebfe9 | 4 |
| #baa4d7 | 4 |
| #665a7a | 4 |
| #baa4e5 | 4, 6, 18 |
| #000 | 6 |
| #08080c | 6 |
| #34303e | 6 |
| #fcc19f | 6, 15, 18 |
| #8899ff | 6, 18 |
| #b3aec1 | 6 |
| #f3edf8 | 6 |
| #090710 | 6 |
| #211b39 | 6 |
| #17101c | 6 |
| #15101c | 6, 15 |
| #ea9c72 | 6, 15, 18 |
| #c082a9 | 6, 18 |
| #080510 | 6 |
| #fff | 6, 15 |
| #b5a9bf | 6 |
| #130d1a | 6 |
| #d7d1e0 | 6 |
| #0d0b13 | 6 |
| #3a3048 | 6 |
| #211a2c | 6 |
| #140e18 | 6 |
| #100d19 | 6 |
| #11101a | 6 |
| #655c78 | 6 |
| #110b1c | 6 |
| #d29b7f | 18 |
| #edb378 | 18 |
| #895129 | 18 |
| #7a506d | 18 |
| #9d698a | 18 |
| #8a72a7 | 18 |
| #ff2200 | 18 |
| #eb943a | 18 |
| #cf4f4f | 18 |
| #c47d69 | 18 |
### public/console.css

| Literal | Original lines |
|---|---|
| #000 | 3, 5, 6, 11, 13, 14, 15, 17, 18, 21, 23, 24, 25, 26, 30, 47, 53, 56, 57, 68, 70, 74, 163, 164, 262, 265, 266, 267, 272 |
| #08060b | 21, 30 |
| #080510 | 26 |
| #000b | 30 |
| #e5c36e | 46 |
| #e3bf4c | 46 |
| #be9444 | 46 |
| #887537 | 46 |
| #ead49a | 46 |
| #eca02d | 46 |
| #ce932d | 46 |
| #bd8e29 | 46 |
| #685719 | 48 |
| #c3ac56 | 48, 49, 52 |
| #635619 | 50 |
| #cfb751 | 50 |
| #7e6a22 | 50 |
| #885018 | 53, 68 |
| #ed971e | 53, 68 |
| #ffb736 | 53 |
| #f7de60 | 55, 75 |
| #bba548 | 55, 75 |
| #d4b680 | 56 |
| #d7c15e | 56 |
| #af883e | 57 |
| #251805 | 58 |
| #030302 | 59 |
| #96822c | 60 |
| #ffe352 | 60, 208, 232 |
| #151005 | 60 |
| #a7954c | 61 |
| #fff0a0 | 61 |
| #765118 | 62 |
| #efa13c | 62 |
| #fff8c9 | 63 |
| #665a27 | 64 |
| #9d893b | 64 |
| #806a20 | 65 |
| #dcb748 | 65 |
| #191206 | 65, 107, 131, 134, 143, 149, 158, 162, 166, 183 |
| #b6a66c | 66 |
| #e2d29c | 66 |
| #29200c | 66 |
| #8d6826 | 67 |
| #bdae80 | 67 |
| #baa4e5 | 81, 168, 209, 227, 233, 239, 258 |
| #171020 | 81 |
| #54ef83 | 85 |
| #27bd58 | 85 |
| #27bd5880 | 85 |
| #239947 | 85 |
| #88601e | 89 |
| #d4a448 | 89 |
| #161006 | 89 |
| #e2bc4d | 89 |
| #ffe88a | 89 |
| #fff1b4 | 89 |
| #dca845 | 89, 95, 97, 107 |
| #c8ae73 | 89 |
| #f4d77b | 89 |
| #735a29 | 89 |
| #a7792a | 91 |
| #171005 | 91 |
| #f4d778 | 91 |
| #d6aa46 | 107, 120, 126, 141, 149, 154, 162, 166, 170, 182, 188, 220, 235, 238, 243 |
| #f8df83 | 107 |
| #ead477 | 120, 128, 144, 159, 164, 167, 172, 181, 190 |
| #b98a32 | 129, 150, 163, 171, 189 |
| #e2bd59 | 130, 196 |
| #bd9139 | 160 |
| #100d06 | 170 |
| #29200d | 172, 190 |
| #51401f | 173, 191 |
| #171205 | 188 |
| #f06464 | 207, 231 |
| #555 | 210, 234 |
| #7e6229 | 221 |
| #191321 | 226 |
| #30240c | 240 |
| #100d05 | 243 |
| #ffe38b | 247 |
| #0b0b10 | 270 |
| #17171f | 271 |
| #22222b | 273 |

## Role assignments

| Section | Role | Shakedown | Classic | Voyager |
|---|---|---|---|---|
| Local/version elbow, Analyze nav | Primary | Orange | Mauve | Science blue |
| How to Use, Shipyard, Compare, Exit nav | Secondary | Yellow | Lavender | Blue-gray |
| Log Folder nav | Tertiary | Light yellow | Almond cream | Pale cream |
| Horizontal frame | Horizontal frame | Gold-yellow | Lavender | Blue-gray |
| Body panel frames | Main / secondary frame | Gold / pale gold | Lavender / cream | Blue-gray / frost |
| Headings | Heading text | Orange | Orange | Command gold |
| Primary actions | Supporting accent | Lavender | Bluey | Command gold |

## Canonical tokens

All values are defined in public/themes.css. The default set applies without JavaScript; data-theme overrides only values. Components never select a theme by name.

- surface-base/panel/input/selected/table/backdrop: black canvas, content surfaces, controls, expanded evidence, table headers, modal shade.
- text-primary/secondary/inverse/heading: normal copy, explanatory copy, dark text on light fills, headings.
- accent-primary/secondary/tertiary/support/muted: recurring decorative and action hierarchy. The three *-shade tokens are derived darker versions of the same hue.
- frame-horizontal, frame-panel, frame-panel-secondary: solid external rails and body frame hierarchy.
- nav-primary/secondary/tertiary/active: section assignments and selection stripe. nav-fill is a component-local alias.
- button-primary-background, button-secondary-background, selected, focus: action and interaction roles. Hover retains existing brightness behavior; disabled retains opacity.
- footer-background, border-muted: credits panel and quiet dividers/control borders.
- state-success/border/glow/halo and state-danger/text/surface: status/error roles.
- chart-high/low/normal/zero: stable evidence semantics, independent of theme.
- guide-rail/light and analysis-rail: local aliases for section frames.

## Architecture and remaining observations

The existing authenticated local settings endpoint persists the theme beside saved app state. No account or external service is involved. Unknown/removed IDs fall back to Shakedown. Only three palettes are registered. Additional palettes are deferred; their original reference values remain in version/task history.

Color literals were removed from both component stylesheets and centralized in themes.css. Chart high/low colors and status colors are intentionally shared across themes. JavaScript inline styles set chart sizes, not theme colors. Historical duplicate layout rules remain: removing them is unrelated cleanup and could change frame geometry. Existing Analyze button sizing also affects sort controls; left unchanged.

## Validation

27 automated tests passed, including authenticated palette validation and persistence. Browser checks covered all three themes, distinct nav section assignments, five main pages, populated analysis/drilldowns, sorting, backup, no browser errors, mobile picker, stable frame bounds/fonts, reload and backend restart, and invalid-theme fallback. Screenshots were captured for each major page/theme and populated analysis. No release was published.

## 0.6.4.2 update

TNG primary is red #cf4f4f, secondary mauve #c082a9, tertiary orange #eb943a. Voyager tertiary is gold #ffbb33. Shakedown retains orange/yellow/light yellow. Log Folder, theme control, and footer share tertiary without per-section overrides. The native dropdown is replaced by an in-column disclosure with three native buttons, aria-expanded, aria-pressed selection, keyboard activation and Escape-to-close. The stored Classic ID stays compatible and is displayed as TNG. Browser tests checked opening, selecting/collapsing, keyboard Escape, reload/restart, mobile, and all major pages; API validation also passed.

## 0.6.4.4 role updates

| Theme | Primary | Secondary | Tertiary | Fourth / Compare Builds | Alert | Active navigation |
|---|---|---|---|---|---|---|
| Shakedown | #ff9911 | #ffaa44 | #ffcc99 | #cc5500 | #ff4400 | #ffeecc |
| TNG | #cf4f4f | #c082a9 | #eb943a | #8899ff | #ff2200 | #fcc19f |
| Voyager | #2288ff | #828cad | #ffbb33 | #e98181 | #ff3300 | #99ccff |

How to Use uses primary, alongside Analyze and the Local elbow. Compare Builds uses accent-quaternary. Alert is registered as --alert and used by the existing danger border role; chart colors remain unchanged. Active navigation uses --active. The collapsed theme toggle fills the entire block; clicking unused panel space also toggles the choices. Existing theme-option buttons still select and save without double-toggling. Browser checks include clicking near the bottom of the collapsed block, keyboard dismissal, three palettes, navigation role differences, restart persistence, and mobile.

## Four-theme flyout and desktop icon

Shakedown restores the former #efa13c / #ffe352 / #fff0a0 palette as ID shakedown. The current amber ID remains stable and is now labeled Lower Decks. The four choices are positioned to the right of the sidebar, over content, with outside-click and Escape dismissal. Opening the options does not change sidebar height. The panel stays inside the viewport on smaller screens.

The user-supplied PNG is preserved in launcher/shakedown.png, with multi-resolution ICO in launcher/shakedown.ico. The desktop window uses that ICO; the build script embeds the same icon in the staged EXE without modifying the dependency runtime. Packaged startup, folder picker, backup, and data-folder controls passed; the EXE icon was extracted and visually checked. No release was published.

## Download version policy

Every newly provided testing download must have a new version number and a matching unique ZIP and extracted-folder name. Never replace a previously shared ZIP with different contents under the same version. This applies even to small visual or packaging corrections.
