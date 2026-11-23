# Tokens

Load when: naming tokens, structuring primitive, semantic and component tiers, adding modes such as dark or increased contrast, or writing tokens in the DTCG format.
Values verified against the Design Tokens Format Module 2025.10 on 2026-11-22.

Contents:
- Three tiers, and components read only the middle one
- Name by role, never by value
- Modes change values, not names
- DTCG names and references

## Three tiers, and components read only the middle one

Primitives hold the raw scales (`blue-600`, `space-4`). Semantic tokens name a job and point at a primitive (`text-link` → `blue-600`). Component tokens exist only where a component must differ from the semantic default (`button-primary-bg` → `accent-solid`). Components read semantic or component tokens, never primitives, so a retheme changes one mapping instead of every component. Add a component token only when a second value is genuinely needed; each extra token is another decision in every theme and mode.

**Support:** Any platform and token pipeline.
**Source:** Mechanism: indirection localizes change; a component wired to a primitive must be edited in every theme.

## Name by role, never by value

`text-secondary` survives a redesign; `gray-500` in a component does not, because the next theme may want gray-400 there and the name then lies. Values belong in primitive names only. A role name says what the token is for and where it sits (`surface-raised`, `border-subtle`, `text-on-accent`), so a reader can pick the right one without seeing its value.

**Support:** Any platform.
**Source:** [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (dynamic system colors are defined by purpose, not appearance).

## Modes change values, not names

Light, dark, increased contrast and density are modes of the same tokens: `surface-raised` has one name and a value per mode. A separate `surface-raised-dark` forces every component to branch on the theme, and the branch is missed somewhere. Put all modes of a token in one place, and keep increased contrast as its own value per appearance.

**Support:** Any platform. On the web, one custom property redefined under each mode selector; DTCG tools express modes as sets or themes over the same names.
**Source:** Mechanism: components that read one name never need to know the mode. [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (each system color has light, dark and increased-contrast values under one name).

## DTCG names and references

The shared token format has rules that hand-written files often break:

- A name must not start with `$` and must not contain `{`, `}` or `.`. So `space.1.5` cannot be a token name; use `space-1-5` or `space-150`.
- A reference is the path in braces: `"$value": "{color.blue.600}"`.
- A dimension is an object with a number and a unit, `px` or `rem`: `{ "value": 16, "unit": "px" }`, not the string `"16px"`.
- Files use `.tokens` or `.tokens.json`.

```json
{
  "space": {
    "$type": "dimension",
    "4": { "$value": { "value": 16, "unit": "px" } }
  },
  "gap": {
    "card": { "$type": "dimension", "$value": "{space.4}" }
  }
}
```

**Support:** Tools that read the DTCG format (Style Dictionary 4 and later, Tokens Studio, and others); check what your pipeline supports.
**Source:** [Design Tokens Format Module](https://www.designtokens.org/tr/drafts/format/) (2025.10: name rules, references, dimension values, file extensions).
