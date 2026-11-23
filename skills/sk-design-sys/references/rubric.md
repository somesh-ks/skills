# Design system rubric

Load when: running `/sk-design-sys` in audit or build mode. Work through the domains in order. Each check is something a reviewer can confirm from tokens, styles, components or docs. "Fix" names the section that holds the value; checks with no fix pointer are judged against the project's own docs.

Contents:
- Color
- Type
- Space
- Shape and radius
- Elevation and surfaces
- Motion
- Icons
- Layout
- Components and states
- Accessibility
- Content
- Themes and modes
- Tokens and naming
- Density
- Platform conventions
- Data visualization
- Internationalization
- Governance

## Color

- Each hue has one meaning; the accent is not reused for decoration. Semantic colors are used only in their role. Fix: `color-values.md` › Use a color only in its role.
- Ramps raise saturation at the light and dark ends. Fix: `color-values.md` › Ramp ends need more saturation.
- Light and dark steps shift hue toward brighter or darker neighbours, not only lightness. Fix: `color-values.md` › Shift hue to lighten or darken.
- Status badges use dark text on a pale tint. Fix: `color-values.md` › Status pills flip contrast.
- Small text on brand colors reaches 7:1. Fix: `color-values.md` › Small text on custom colors aims for 7:1.

## Type

- Body and minimum sizes match each platform. Fix: `type.md` › Default and minimum text per platform.
- Tracking changes with size; caps are tracked out. Fix: `type.md` › Tracking depends on size.
- No weight under 400 below about 28px. Fix: `type.md` › Light weights need size.
- Text that wraps to three or more lines has line height of at least 1.4. Fix: `type.md` › Wrapped text never gets tight leading.
- Emphasis inside a role changes weight, not size. Fix: `type.md` › Emphasis is a weight step, not a size step.

## Space

- One spacing scale; no off-scale values in components.
- Controls have about 12pt around bezeled and 24pt around borderless ones. Fix: `space.md` › Space around bezeled and borderless controls.
- Text buttons pad about 2:1. Fix: `space.md` › Text button padding is about 2 to 1.
- Edge buttons are inset by the margin plus the safe area. Fix: `space.md` › Inset edge buttons from the screen edge.

## Shape and radius

- One radius family; nested corners are concentric. Fix (CSS): `css-visual.md` › Concentric radius as tokens.
- Round and pointed marks are optically sized against square ones. Fix: `pixels.md` › Optical overshoot for round and pointed shapes.

## Elevation and surfaces

- Elevation levels are tied to z-role (control, dropdown, dialog), not picked per screen.
- Dark mode elevates with lighter surfaces, at least 0.02 L apart. Fix: `depth.md` › Dark mode elevates with lighter surfaces; `depth.md` › Dark surface steps.
- Raised and inset elements follow one light direction. Fix: `depth.md` › Light comes from above.
- Separators and borders are hairlines on dense screens. Fix: `pixels.md` › Hairline is one device pixel.

## Motion

- Durations and easings are tokens; none is set per component. Defaults: the Default tokens section of the `design-eng` SKILL.md.
- Reduced motion keeps fades and drops movement. Fix (CSS): `accessibility.md` › Reduced motion without breaking transition events.

## Icons

- One icon library, one stroke per text weight. Fix: `pixels.md` › Icon weight matches the text weight.
- Icons beside labels sit one contrast step quieter. Fix: `pixels.md` › Icons look heavier than the text beside them.
- Glyphs under 20px are drawn for that size. Fix: `pixels.md` › Simplify glyphs below 20px.

## Layout

- Breakpoints follow available width, not device names. Fix: `layout.md` › Break on available width, not device.
- No feature disappears at a smaller size. Fix: `layout.md` › Same features at every size.

## Components and states

- One or two prominent actions per view. Fix: `components.md` › One or two prominent actions per view.
- Controls in a row share one height scale. Fix: `components.md` › Controls in a row share one height.
- Busy states show progress in the button and keep its size. Fix: `components.md` › Progress inside the button that started it.
- Disabled controls still read as controls. Fix: `components.md` › Disabled controls are exempt, not invisible.
- Every interactive component defines rest, hover, focus, pressed, selected, disabled, and where it applies loading and error.
- Hover, focus and pressed come from one rule (for example a content-colored overlay at fixed opacities), not per-variant colors.

## Accessibility

- Targets meet the platform size. Fix: `space.md` › Target sizes per platform.
- The focus indicator is at least 2px and 3:1. Fix: `space.md` › Focus indicator size and contrast.
- Large-text thresholds use the stricter standard. Fix: `type.md` › Large text starts at different sizes.
- Layouts survive the largest text sizes. Fix: `type.md` › Layouts at accessibility text sizes.

## Content

- Button labels are verbs; case is consistent (sentence case by default).
- Error messages say what happened and what to do next.
- Each truncating component states how the full text is reached.

## Themes and modes

- Components consume semantic tokens only, so modes swap without component changes.
- Dark is tuned, not inverted: accents desaturated, body text dimmer. Fix: `depth.md` › Dark accents and dark body text.
- Increased contrast has a value per appearance. Fix: `color-values.md` › Increased contrast is a variant per appearance.
- White images are softened in dark mode. Fix: `depth.md` › Soften white images in dark mode.

## Tokens and naming

- Three tiers, and components read only semantic or component tokens. Fix: `tokens.md` › Three tiers, and components read only the middle one.
- Names describe the role, never the value. Fix: `tokens.md` › Name by role, never by value.
- Modes change values under one name. Fix: `tokens.md` › Modes change values, not names.
- Token files follow the format rules (names, references, dimension objects). Fix: `tokens.md` › DTCG names and references.

## Density

- Density modes change padding and gaps only; type size and target floors stay.

## Platform conventions

- Units follow the platform: pt on Apple, dp on Android, CSS px on the web.
- Hairlines resolve per screen density. Fix: `pixels.md` › Hairline is one device pixel; on the web, `pixels.md` › Web hairlines: borders snap, shadows do not.
- visionOS spacing, where shipped. Fix: `space.md` › visionOS buttons sit 60pt apart.

## Data visualization

- Series colors are a separate categorical set, not the UI accent ramp.
- No series is told apart by hue alone: add labels, markers or patterns.
- Sequential ramps change lightness steadily from one end to the other.

## Internationalization

- Short labels have room to grow two to three times. Fix: `layout.md` › Short labels grow most in translation.
- Direction icons mirror in right-to-left; universal marks do not. Fix: `layout.md` › Mirror direction, not meaning.
- No text is baked into images.

## Governance

- Every token and component has an owner and a status (draft, stable, deprecated).
- Deprecations name the replacement and a removal version.
- Changes are versioned with a changelog.
- There is a written path for contributing a new component or token.
