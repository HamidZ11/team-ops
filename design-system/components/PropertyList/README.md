# PropertyList

Label / value rows for a request's details: 12px `color-fg-3` labels in an 88px column, 13px values in 32px rows; editable values are buttons whose hover fill extends 8px past the text.

Hand-written from `src/components/request/properties.tsx`.

**Use** `layout: "list"` in the 288px inspector beside the reading column: Status, Priority, Owner, Approver, Due date, Type, Requester, Created. Under 840px of request width use `layout: "facts"`: a compact strip, label above value, columns sized to content. Empty values read in `color-fg-3` ("Not required", "Set due date"). Editing opens a `Menu` or the date picker in place.

**Consumer provides** `rows` (`{label, value, editable?}`) and `layout`.
