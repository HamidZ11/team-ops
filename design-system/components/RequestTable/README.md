# RequestTable

The dense request table: checkbox, priority glyph, ID, request title, status, owner and due date, 40px rows under a 36px sticky header.

Hand-written from `src/prototypes/unified/request-table.tsx` (a subset of its columns: Type, Approval and Updated are omitted here).

**Use** inside a `Tray` panel. Headers are 12px regular `color-fg-3` with an inset bottom line. Rows are 13px `color-fg-2` with the title in `color-fg` (`color-fg-2` once closed); hover is `color-raised` at 60%, the opened row `color-selected`, a ticked row gets a 2px accent marker. Blocked is a `Ban` icon in the Status cell, never a chip in the title. Overdue dates are `color-danger-fg`. In the app, fixed columns are sized to their longest value (ID 78, Status 136, Owner 148, Due 96) and drop by container width, least important first.

**Consumer provides** `rows` (`{key, title, status, priority, owner, due, blocked?, overdue?, checked?, comments?}`), `selected`/`onOpen` (or `defaultSelected`). `Enter` opens, `j`/`k` move.
