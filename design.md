# Confluence Main Website — Premium UI Design Specification

> Revamp target: replace the current Confluence landing page shown in the second reference image with a refined, editorial developer-tool aesthetic closely matching the first ObsidianUI reference.
>
> The visual target is **clean, white, high-contrast, minimal, restrained, typographic, and interaction-led**. Avoid the current blue/cyan glass-gradient treatment and avoid generic AI-product visuals.

---

## 1. Design Direction

### Core visual idea

Confluence should feel like a serious developer product rather than a flashy AI landing page.

The reference design relies on:

- Very large, heavy typography.
- Large areas of empty white space.
- A mostly monochrome palette.
- Thin borders and soft grey surfaces.
- A compact, carefully composed navigation bar.
- Small utility text contrasted against oversized headlines.
- Subtle depth instead of obvious gradients.
- Motion used for interaction, not decoration.
- Editorial / Swiss-style spacing.
- A strong desktop composition that collapses cleanly on mobile.

### Design keywords

`editorial` · `technical` · `quiet` · `premium` · `minimal` · `precise` · `developer-first` · `high-contrast` · `typography-led`

### Things to remove from the current Confluence page

The current page uses a large blue/cyan atmospheric gradient, centered hero copy, and generic CTA treatment. Replace that visual language.

Do **not** use:

- Blue/cyan hero backgrounds.
- Heavy glassmorphism.
- Large blurred blobs behind all content.
- Gradient text.
- Excessive rounded cards.
- Floating AI/chatbot-style ornaments.
- Generic robot, sparkle, brain, chip, or AI icons.
- Huge centered text with several competing effects.
- Excessive shadow.
- Decorative effects that compete with the ML visualizer itself.
- Random serif typography in the main navigation.
- Rounded-pill-everything UI.

The page should look expensive because of proportion, type, spacing, and interaction quality — not because of visual effects.

---

# 2. Verified Reference Font System

The public ObsidianUI implementation was inspected to determine the actual font stack behind the reference direction.

### Primary fonts

| Role | Font | Usage |
|---|---|---|
| Main display/headline | **Inter** | Hero headline, section headlines, important titles |
| UI / navigation | **Geist** | Navigation, controls, supporting interface text |
| General page baseline | **Inter Tight** | Global/default page typography |
| Monospace | System monospace | Dataset counts, algorithm metadata, technical labels |
| Optional display accent | **Playfair Display** | Avoid in the primary Confluence UI; reserve only for rare editorial moments |
| Optional decorative fonts | Pixelify Sans / Six Caps / Outfit / Satoshi | Not part of the core Confluence landing-page typography |

The inspected reference repository loads Inter, Geist and Inter Tight directly and establishes the design roles approximately as:

```css
html,
body,
#__next {
  font-family: var(--font-inter-tight);
}

--font-heading: var(--font-inter);
--font-body: var(--font-geist);
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Exact font recommendation for Confluence

Use this simplified production system:

```css
:root {
  --font-display: "Inter", sans-serif;
  --font-ui: "Geist", sans-serif;
  --font-body: "Geist", sans-serif;
  --font-base: "Inter Tight", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### Font loading

For Next.js:

```tsx
import { Geist, Inter, Inter_Tight } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
```

Then:

```tsx
<body
  className={`${inter.variable} ${geist.variable} ${interTight.variable}`}
>
```

Do not mix more than these three fonts in ordinary landing-page UI.

---

# 3. Typography System

Typography is the most important part of the redesign.

## Display headline

Use **Inter** with a very heavy weight.

```css
.hero-title {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.075em;
  line-height: 0.88;
  text-wrap: balance;
}
```

Desktop target:

```css
font-size: clamp(4.75rem, 8vw, 8.25rem);
```

Recommended starting value at a 1440–1920px viewport:

```css
font-size: 7.25rem;
```

Use two intentional lines.

Example structure:

```text
See how ML
actually works.
```

or, better for Confluence:

```text
See how
ML actually works.
```

The actual copy can change, but the **shape** should remain large, compact and editorial.

### Headline rules

- Do not center it on desktop.
- Keep it aligned to the content grid.
- Use almost-black.
- No gradient fill.
- No text shadow.
- No outline.
- No italic.
- No decorative font.
- Keep line-height tight.
- Keep letter spacing aggressively negative.

---

## Body copy

Use **Geist**.

```css
.hero-copy {
  font-family: var(--font-body);
  font-size: clamp(1.05rem, 1.45vw, 1.45rem);
  line-height: 1.55;
  letter-spacing: -0.015em;
  color: #6f6f6f;
}
```

Maximum text width:

```css
max-width: 38rem;
```

The copy should feel calm and secondary to the display headline.

---

## Navigation / controls

Use Geist:

```css
font-family: var(--font-ui);
font-size: 0.9rem;
font-weight: 450;
letter-spacing: -0.015em;
```

Do not use the current Confluence serif navigation.

---

## Technical metadata

Use the mono stack:

```css
font-family: var(--font-mono);
font-size: 0.68rem;
letter-spacing: 0.02em;
text-transform: uppercase;
```

Good for:

- `38 ALGORITHMS`
- `24 DATASETS`
- `LIVE`
- `SCIKIT-LEARN`
- algorithm family labels
- system status
- API / architecture annotations

---

# 4. Color System

The visual reference is overwhelmingly neutral.

## Light theme

```css
:root {
  --background: #ffffff;
  --surface: #fafafa;
  --surface-2: #f5f5f5;

  --foreground: #171719;
  --foreground-soft: #303035;

  --muted: #6f6f73;
  --muted-2: #929296;

  --border: #e8e8e8;
  --border-strong: #d8d8d8;

  --accent: #111111;
  --accent-foreground: #ffffff;
}
```

### Important rule

Do not introduce a permanent brand gradient into the main hero.

Confluence's identity should come from:

- typography,
- visualizer previews,
- diagrams,
- data,
- small color signals inside ML graphics.

The shell around those elements stays neutral.

---

## Optional data colors

Color is allowed **inside ML visualizations**, not as the page background.

Recommended visualization palette:

```css
--data-blue: #2563eb;
--data-cyan: #0891b2;
--data-green: #16a34a;
--data-amber: #d97706;
--data-red: #dc2626;
--data-purple: #7c3aed;
```

Use these only where they communicate model/data state.

---

# 5. Page Grid

The page needs a consistent editorial grid.

### Desktop

```css
.page-shell {
  width: min(100% - 3rem, 1500px);
  margin-inline: auto;
}
```

At very wide screens, use:

```css
padding-inline: max(1.5rem, calc((100vw - 1500px) / 2));
```

### Horizontal rhythm

Use a strict spacing scale:

```text
8
12
16
24
32
48
64
80
96
128
160
```

Avoid arbitrary spacing values.

### Main content width

Preferred:

```text
1200–1500px
```

Do not stretch paragraphs and UI to the full viewport.

---

# 6. Navigation Redesign

Replace the current Confluence navigation completely.

## Target structure

Left:

```text
CONFLUENCE
```

Center/right:

```text
Features
Algorithms
Resources
Architecture
```

Far right:

```text
Launch Tool
```

### Navigation dimensions

Desktop:

```css
height: 64px;
padding-inline: 28px;
```

### Navigation visual

- White background.
- Very light bottom divider.
- No large shadow.
- No gradient.
- No heavy blur.
- Brand text in Inter, 700–800.
- Links in Geist.
- Launch button uses a thin black border.
- Slightly rounded or nearly square corners.
- Hover transitions are quick and subtle.

Recommended button:

```css
.launch-button {
  min-height: 42px;
  padding-inline: 18px;
  border: 1px solid #1b1b1b;
  background: transparent;
  color: #111;
  border-radius: 3px;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
```

Hover:

```text
black background
white text
```

The reference intentionally avoids highly rounded SaaS-style buttons.

---

# 7. Hero — Complete Replacement

The current centered hero is replaced by a **split editorial hero**.

## Desktop composition

Approximate structure:

```text
┌───────────────────────────────────────────────────────────────┐
│ CONFLUENCE       Features Algorithms Resources Architecture  │
│                                                   Launch Tool │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [small metadata label]                     supporting copy   │
│                                                               │
│  See how                                    ┌───────────────┐ │
│  ML actually                               │ Launch /      │ │
│  works.                                    │ Search        │ │
│                                             └───────────────┘ │
│                                                               │
│  small stats / technologies                                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

The reference uses a strong asymmetry:

- **Left = identity + oversized headline**
- **Right = explanation + actions**
- Bottom = quiet metadata

This makes the page feel designed rather than centered like a marketing template.

---

# 8. Hero Background

Use a near-white background.

Preferred:

```css
.hero {
  position: relative;
  background: #fff;
  overflow: hidden;
}
```

Add extremely subtle decorative geometry at the bottom or edges:

- fine grey circles,
- cropped arcs,
- thin vertical blocks,
- tiny grid fragments,
- low-opacity lines.

Opacity:

```text
0.04–0.08
```

These shapes should barely register.

Never let them compete with the headline.

---

# 9. Hero Eyebrow / Status Label

Place a small neutral badge above the headline.

Example:

```text
● 38 ALGORITHMS · 24 DATASETS · REAL COMPUTATION
```

Visual:

- 12–13px Geist / mono.
- Grey border.
- Very light background.
- Small green status dot if the status is meaningful.
- Slightly rounded 999px is acceptable only for this small status element.

Do not turn every element into a pill.

---

# 10. Hero Copy

Replace the current centered paragraph with concise product language.

Example:

> Explore machine learning through interactive visualizations, real datasets, and step-by-step model behavior — without hiding the math behind a black box.

Keep it around 2–3 lines on desktop.

Recommended:

```css
max-width: 620px;
font-size: 1.35rem;
line-height: 1.5;
color: #717171;
```

Do not put a large paragraph underneath the main headline on the left.

---

# 11. Hero Actions

Use a two-part action row similar to the reference.

Primary:

```text
Launch Visualizer
```

Secondary / utility:

```text
Search algorithms...
```

The search field should visually feel like a developer tool rather than a generic website input.

### Search field

```css
height: 66px;
padding: 0 20px;
border: 1px solid #e4e4e4;
border-radius: 14px;
background: #fff;
box-shadow:
  0 1px 3px rgba(0,0,0,.04),
  0 8px 28px rgba(0,0,0,.045);
```

Add a keyboard hint:

```text
⌘ K
```

or on Windows:

```text
Ctrl K
```

The outer field may be rounded; the primary CTA should remain more restrained.

---

# 12. Hero Supporting Metadata

Under the main left-side content:

```text
React
Python
scikit-learn
FastAPI
PostgreSQL
```

Separate items with tiny circular markers.

Example:

```text
• React   • Python   • scikit-learn   • FastAPI
```

Typography:

```css
font-size: 0.85rem;
color: #777;
```

Do not use colorful technology logos.

---

# 13. Visualizer Preview Section

The current Confluence site should stop treating the hero as the only major visual.

Immediately after the hero, introduce a **large product preview**.

## Visual treatment

A single large browser/app frame:

```text
┌───────────────────────────────────────────────────────────┐
│ Confluence / Logistic Regression                ● ● ●     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                actual ML visualization                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Use:

- 1px border.
- 10–14px radius.
- White / almost-white surface.
- Soft shadow.
- Real product UI.
- No fake dashboard cards.
- No oversized gradient.

This section should prove that the product is real.

---

# 14. Features Section

Use an editorial section rather than a conventional 3-column SaaS card grid.

Structure:

```text
01  INTERACTIVE VISUALIZATION
    See decision boundaries, loss curves,
    classifications and model behavior.

02  REAL DATA
    Explore real datasets instead of toy-only examples.

03  FIRST-PRINCIPLES LEARNING
    Understand what the algorithm is actually doing.

04  EXPLANATIONS
    Turn model output into something readable.

05  ALGORITHM COMPARISON
    Compare models on the same data.

06  LEARNING NOTES
    Connect visual behavior with the math.
```

### Visual language

Use numbered rows with separators.

Avoid six floating cards.

Each row can have:

- number,
- title,
- one-sentence description,
- subtle hover reveal,
- optional miniature visual.

---

# 15. Algorithms Section

This becomes one of the main information sections.

## Heading

Large:

```text
Algorithms, without
the black box.
```

Then a searchable/filterable algorithm list.

Categories:

```text
Regression
Classification
Trees
Ensembles
Clustering
Dimensionality Reduction
```

Each algorithm row:

```text
01   Logistic Regression            Classification      →
02   Decision Tree                  Trees               →
03   Random Forest                  Ensemble            →
04   XGBoost                        Ensemble            →
```

Use a thin separator between rows.

Hover:

- background shifts to `#f8f8f8`,
- arrow moves a few pixels,
- preview thumbnail can appear near the cursor,
- no exaggerated magnetic effects.

---

# 16. Datasets Section

The current "24 real-world datasets" concept should become a visual section.

Layout:

Left:

```text
Real data.
Real behavior.
```

Right:

```text
dataset list
```

Each dataset item should show:

```text
Dataset Name
Rows
Features
Task
Target
```

Example:

```text
Breast Cancer
569 rows
30 features
Classification
target: diagnosis
```

Use mono for numbers and system fields.

---

# 17. Resources / Learning Notes

Use a quiet reading-oriented section.

Structure:

```text
Resources

Machine Learning
Linear Algebra
Probability
Statistics
Model Evaluation
Feature Engineering
```

Use large text links and thin dividers instead of cards.

Example:

```text
Understanding Logistic Regression                  →
Why Gradient Descent Works                        →
ROC-AUC, without the confusion                    →
Decision Trees from first principles               →
```

This matches the reference's editorial character.

---

# 18. Architecture Section

Confluence has a technical product story, so expose the architecture.

Use a large diagram on a neutral background:

```text
Dataset
   ↓
Preprocessing
   ↓
Model Engine
   ↓
Prediction / Metrics
   ↓
Visualization
   ↓
Explanation
```

Make it feel like documentation, not an enterprise architecture diagram.

Visual rules:

- thin 1px lines,
- tiny labels,
- monochrome nodes,
- sparse layout,
- subtle motion on hover,
- color only when showing real data flow.

---

# 19. Main CTA Section

Near the bottom:

```text
Understand the model.
Don't just run it.
```

Supporting sentence:

> Open the visualizer and see the computation happen step by step.

CTA:

```text
Launch Visualizer →
```

Keep this section mostly black/white.

Do not use the blue gradient from the current version.

---

# 20. Footer

Minimal footer.

Left:

```text
CONFLUENCE
```

Center/right:

```text
Features
Algorithms
Resources
Architecture
GitHub
```

Bottom:

```text
Built for learning how ML actually works.
```

Use a thin top border.

No huge dark footer unless the visual system requires it later.

---

# 21. Motion System

Motion must feel precise and physical.

## General timings

```css
--ease-standard: cubic-bezier(.2,.7,.2,1);
--ease-soft: cubic-bezier(.22,1,.36,1);
```

Typical:

```text
hover: 120–180ms
small transform: 180–260ms
section reveal: 500–800ms
page-scale effects: avoid
```

## Allowed effects

- fade + 8–16px translate on reveal,
- underline growth,
- arrow translation,
- border-color transitions,
- small image parallax,
- search focus expansion,
- subtle grid movement,
- smooth list hover preview,
- product-preview transitions.

## Avoid

- perpetual floating objects,
- huge zoom animations,
- spinning 3D elements,
- particle backgrounds,
- cursor trails everywhere,
- excessive spring animation,
- constant blur changes,
- random WebGL in the hero.

The page should feel **alive, not animated**.

---

# 22. Product Preview Motion

The actual ML visualizer is where richer motion belongs.

For example:

### Decision boundary

On model change:

```text
old boundary
      ↓
parameter update
      ↓
new boundary
```

Animate the boundary instead of replacing it instantly.

### Training curve

Animate points / line drawing when training begins.

### Dataset filtering

Use small fade/position transitions when rows change.

### Model comparison

Use synchronized transitions so the user can understand what changed.

The visualizer should carry the "wow" factor.

The marketing site itself remains quiet.

---

# 23. Button System

## Primary

```css
height: 48px;
padding-inline: 22px;
border: 1px solid #151515;
border-radius: 4px;
background: #151515;
color: #fff;
font-family: var(--font-ui);
font-weight: 550;
```

Hover:

```css
background: #2a2a2a;
```

## Secondary

```css
height: 48px;
padding-inline: 22px;
border: 1px solid #dcdcdc;
background: #fff;
color: #1a1a1a;
border-radius: 4px;
```

Do not use huge 999px pill buttons.

---

# 24. Borders, Radius and Shadows

### Border

Default:

```css
1px solid #e8e8e8
```

Strong:

```css
1px solid #d7d7d7
```

### Radius

Use a small radius vocabulary:

```text
2px
4px
8px
12px
14px
```

Use larger radii only for:

- search fields,
- large media preview,
- special visual surfaces.

### Shadows

Extremely soft:

```css
box-shadow:
  0 1px 2px rgba(0,0,0,.03),
  0 8px 30px rgba(0,0,0,.04);
```

Never use dramatic black shadows.

---

# 25. Icons

Use a single coherent icon set.

Recommended:

```text
Lucide
```

Rules:

- 16–20px standard size.
- 1.5px stroke.
- monochrome by default.
- no colorful AI icons.
- no emoji icons in primary navigation.
- icons should support labels, not become the visual itself.

---

# 26. Accessibility

The premium look must remain accessible.

Required:

- semantic headings,
- keyboard navigation,
- visible focus states,
- `prefers-reduced-motion` support,
- sufficient text contrast,
- buttons with real labels,
- input labels / accessible names,
- no hover-only essential information,
- responsive touch targets.

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 27. Responsive Design

## Desktop ≥ 1200px

Use the full split hero.

```text
left: 55–60%
right: 40–45%
```

Headline can reach 120–132px on very wide screens.

---

## Tablet 768–1199px

Stack the hero:

```text
eyebrow
headline
copy
actions
metadata
visual preview
```

Headline:

```text
72–100px
```

---

## Mobile < 768px

The experience becomes editorial rather than a shrunken desktop.

Recommended:

```css
.hero-title {
  font-size: clamp(3.25rem, 15vw, 5rem);
  line-height: 0.9;
  letter-spacing: -0.065em;
}
```

Navigation:

```text
CONFLUENCE                 menu
```

Hide secondary navigation behind the menu.

Actions stack vertically.

Search gets full width.

Do not allow large horizontal overflow.

---

# 28. Recommended Hero DOM Structure

```tsx
<main>
  <section className="hero">
    <div className="hero-inner">

      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="status-dot" />
          38 ALGORITHMS · 24 DATASETS · REAL COMPUTATION
        </div>

        <h1 className="hero-title">
          See how
          <br />
          ML actually works.
        </h1>

        <div className="hero-meta">
          React · Python · scikit-learn · FastAPI
        </div>
      </div>

      <div className="hero-right">
        <p className="hero-copy">
          Explore machine learning through interactive visualizations,
          real datasets, and step-by-step model behavior.
        </p>

        <div className="hero-actions">
          <a className="primary-button">
            Launch Visualizer
          </a>

          <button className="search-input">
            Search algorithms...
            <kbd>⌘ K</kbd>
          </button>
        </div>
      </div>

    </div>

    <div className="hero-decoration" />
  </section>

  <section className="product-preview" />
  <section className="features" />
  <section className="algorithms" />
  <section className="datasets" />
  <section className="resources" />
  <section className="architecture" />
  <section className="final-cta" />
</main>
```

---

# 29. CSS Architecture

Keep the design system centralized.

Recommended files:

```text
src/
  app/
    globals.css

  components/
    landing/
      SiteHeader.tsx
      Hero.tsx
      ProductPreview.tsx
      Features.tsx
      Algorithms.tsx
      Datasets.tsx
      Resources.tsx
      Architecture.tsx
      FinalCTA.tsx
      SiteFooter.tsx

      hero.css
      sections.css
      navigation.css
```

Do not put hundreds of one-off inline Tailwind values into every component.

Use design tokens.

---

# 30. Tailwind Theme Tokens

Map the design system:

```css
@theme inline {
  --font-sans: var(--font-inter-tight);
  --font-heading: var(--font-inter);
  --font-body: var(--font-geist);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --color-background: #ffffff;
  --color-foreground: #171719;
  --color-muted-foreground: #6f6f73;

  --color-border: #e8e8e8;
}
```

---

# 31. Visual Hierarchy

Every viewport should have a clear ranking:

```text
1. Hero headline
2. Product purpose
3. Launch action
4. Product preview
5. Feature explanation
6. Algorithms
7. Datasets
8. Learning resources
9. Architecture
10. Final CTA
```

Do not let every section use giant headlines.

Only the hero and major section introductions should have strong display typography.

---

# 32. Confluence-Specific Brand Treatment

The reference's brand language should be adapted rather than literally copied.

### Keep

- bold black display type,
- quiet UI,
- thin borders,
- white canvas,
- compact navigation,
- asymmetric hero,
- search utility,
- editorial spacing,
- understated motion,
- technical metadata.

### Change for Confluence

Instead of a generic UI component library, the visual story should revolve around **ML understanding**.

That means:

```text
visualization
↓
computation
↓
dataset
↓
model behavior
↓
explanation
```

Every major landing-page section should reinforce this loop.

---

# 33. Current Confluence → New Confluence Mapping

| Current | Replace with |
|---|---|
| Blue/cyan gradient hero | Pure white / near-white hero |
| Centered hero | Split editorial hero |
| Serif navigation | Geist |
| Gradient background glow | Subtle grey geometry |
| Large pill CTAs | Restrained rectangular CTAs |
| Decorative chatbot bubble | Remove |
| Generic centered feature cards | Numbered editorial rows |
| “Features / Algorithms / Resources” as only nav | Same information, but with stronger page architecture |
| Current generic hero buttons | Launch + searchable algorithm utility |
| Blue secondary button styling | Neutral black/white system |
| Heavy glassy look | Thin borders + soft depth |
| Large empty gradient space | Intentional whitespace around typography |
| Hero as marketing artwork | Real product preview after hero |
| Color everywhere | Neutral shell + color only inside visualizations |

---

# 34. Final Visual Acceptance Checklist

The redesign is complete only when all of these are true:

### Typography

- [ ] Inter is used for display headings.
- [ ] Geist is used for UI/body.
- [ ] Inter Tight is used as the global/base family where appropriate.
- [ ] No random serif font remains in the main navigation.
- [ ] Hero headline uses very tight tracking and a heavy weight.
- [ ] Type is the primary visual element.

### Layout

- [ ] Header is compact.
- [ ] Hero is left/right split on desktop.
- [ ] Hero is not vertically centered like the current version.
- [ ] Content uses a strict max-width grid.
- [ ] Large whitespace is intentional.
- [ ] Mobile layout stacks naturally.

### Color

- [ ] Main page background is white.
- [ ] No blue/cyan hero gradient.
- [ ] No rainbow gradient text.
- [ ] Neutral grey border system.
- [ ] Color is concentrated inside actual ML visualizations.

### Components

- [ ] Launch CTA is high contrast.
- [ ] Search field feels like a developer tool.
- [ ] Algorithm section uses rows/list instead of generic card grids.
- [ ] Dataset section exposes useful metadata.
- [ ] Architecture section is visual and technical.
- [ ] Product preview is a real interface preview.

### Motion

- [ ] Motion is subtle.
- [ ] Interactions have fast feedback.
- [ ] Product visualizations receive the richer motion.
- [ ] Landing page does not feel like a WebGL experiment.
- [ ] Reduced-motion behavior is implemented.

### Quality bar

The result should feel closer to:

```text
design studio × developer tool × technical editorial
```

and farther from:

```text
AI SaaS template × gradient landing page × generic dashboard
```

---

# 35. Reference Audit

The visual direction was cross-checked against the public ObsidianUI implementation.

The repository currently uses:

- **Inter** as the primary heading family.
- **Geist** for UI/body-oriented interfaces.
- **Inter Tight** as the default page font.
- A neutral black/white theme with restrained borders.
- Small-radius surfaces and subtle shadows.
- Smooth, accessible micro-interactions.
- Motion-based components rather than purely decorative visual effects.

Reference implementation:

- https://www.obsidianui.dev/
- https://github.com/Atharvsinh-codez/ObsidianUI

The public repository describes the design system as a sleek light/dark interface with smooth scrolling, micro-interactions, accessible motion controls, and a Tailwind-based component system.

---

# 36. Implementation Rule

**Do not rebuild the current Confluence page by tweaking individual colors. Rebuild the visual hierarchy.**

The correct order is:

```text
1. Replace typography
2. Replace global color system
3. Rebuild navigation
4. Rebuild hero composition
5. Remove blue/cyan effects
6. Add product preview
7. Rebuild features as editorial rows
8. Rebuild algorithms as searchable technical content
9. Rebuild datasets as data-driven content
10. Rebuild resources as reading links
11. Rebuild architecture as a technical visual
12. Add final CTA + minimal footer
13. Add restrained motion
14. Polish responsive behavior
15. Verify against the reference at 1440px, 1920px and mobile widths
```

The goal is not merely to make Confluence “look similar”.

The goal is to make it feel like the **same level of design craft**: typography-first, quiet, highly intentional, technically credible, and premium.
