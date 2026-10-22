# PriorityIcon

Priority as a 14px glyph: three rising bars for High, Medium and Low, three dashes for No priority, and a filled `color-danger` square with an exclamation mark for Urgent.

Hand-written from `src/components/request/glyphs.tsx`.

**Use** in the narrow priority column of the request table (centred, no header label), and before the value in the Priority property. Filled bars are `color-fg-2`, empty bars `color-line-strong`. Only Urgent is red. The glyph has its own `aria-label` ("Priority: High").
