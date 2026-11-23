# Layout across sizes and languages

Load when: choosing breakpoints, adapting a layout between phone, tablet and desktop, budgeting space for translated labels, or deciding which icons mirror in right-to-left languages.
Values verified on 2026-11-22. The CSS for container queries and logical properties is in `interface-mechanics` and the project's layout skill.

Contents:
- Break on available width, not device
- Same features at every size
- Short labels grow most in translation
- Mirror direction, not meaning

## Break on available width, not device

Layout decisions follow the space the window has, not what device it runs on: an iPad app can run in a phone-sized window, and a phone in landscape is wider than a small tablet. Material 3 names the bands by window width:

| Class | Width | Panes |
| --- | --- | --- |
| Compact | under 600dp | 1 |
| Medium | 600–839dp | 1, sometimes 2 |
| Expanded | 840–1199dp | 2 recommended |
| Large and up | 1200dp and wider | 2 or 3 |

Apple's size classes do the same with two values per axis (compact and regular), set by the window, not the hardware. Inside a page, a component should break on its own container's width.

**Support:** Any platform. Android window size classes, iOS and iPadOS size classes, CSS container and media queries.
**Source:** [Material 3: Panes](https://m3.material.io/foundations/layout/scaffold/panes) (window widths 600dp, 840dp, 1200dp), [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) (determine layout from size classes, not device type or orientation).

## Same features at every size

Resizing a window must not remove what people can do; it changes how much is visible at once. A tab bar can become a sidebar, and an overflow menu can open up into a toolbar, but an action available in the wide layout stays reachable in the narrow one.

**Support:** Any platform.
**Source:** [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) (keep functionality the same as size classes change).

## Short labels grow most in translation

Translated text usually grows, and the shorter the English, the more it grows: a button label of up to 10 characters can double or triple, while a paragraph over 70 characters grows by about 30%. So budget space per string length, not one flat percentage: let buttons, tabs and badges size to their label and wrap or stack, and keep fixed widths only for long text that already wraps.

| English length | Average expansion |
| --- | --- |
| Up to 10 characters | 200–300% |
| 11–20 | 180–200% |
| 21–30 | 160–180% |
| 31–50 | 140–160% |
| 51–70 | 151–170% |
| Over 70 | about 130% |

**Support:** Any platform; figures are for English to European languages.
**Source:** [W3C Internationalization: Text size in translation](https://www.w3.org/International/articles/article-text-size) (IBM expansion figures).

## Mirror direction, not meaning

In a right-to-left language, forward is to the left. Flip icons that show reading direction or movement through content: back and forward arrows, chevrons in lists, progress that fills, text alignment icons. Do not flip universal marks and real objects: a checkmark, a clock, and tools held in the right hand.

**Support:** Any platform. SF Symbols and Material Symbols mark which glyphs auto-mirror; check custom icons by hand.
**Source:** [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left) (flip icons that represent text or reading direction; keep checkmarks, clocks and right-handed tools).
