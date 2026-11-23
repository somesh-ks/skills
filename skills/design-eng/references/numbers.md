# Money and number mechanics

Load when: formatting money or currency amounts, or converting stored minor units for display.
Support lines verified against MDN on 2026-11-23. Tabular numbers are in `typography.md`.

Contents:
- Currency decimals come from the currency

## Currency decimals come from the currency

Not every currency has two decimals: JPY has 0, KWD and BHD have 3. `toFixed(2)` prints yen with cents and drops a fils digit. Store amounts as integers in the currency's minor unit, and read the digit count from the formatter instead of hard-coding it.

```js
const fmt = (currency, locale) =>
  new Intl.NumberFormat(locale, { style: "currency", currency });

fmt("JPY", "en-US").format(1234.5);   // "¥1,235"
fmt("KWD", "en-US").format(1234.5);   // "KWD 1,234.500"

// minor units → major units
const digits = fmt(currency, locale).resolvedOptions().maximumFractionDigits;
const major = minorUnits / 10 ** digits;
```

**Support:** Baseline widely available (`Intl.NumberFormat` currency style in all engines; `resolvedOptions()` likewise).
**Source:** [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat), [ISO 4217 currency codes and minor units](https://www.iso.org/iso-4217-currency-codes.html)
