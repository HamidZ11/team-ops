# SearchField

The 32px search box at the head of tables and queues: a search icon, the input, a clear button once there is text, and a `/` key hint.

Hand-written from `SearchInput` in `src/prototypes/unified/table-view.tsx`.

**Use** once per list, left of the filters, at most 300px wide. `/` focuses it from anywhere. Searching filters in place; no results shows `EmptyState` with "No matches".

**Consumer provides** `value`/`onChange` (or `defaultValue`), `placeholder` (default "Search requests"), and `shortcut` (`null` hides the key hint). Its border goes `color-line-strong` while focused.
