/* @ds-bundle: {"format":4,"namespace":"Meridian","components":[{"name":"Button"},{"name":"Kbd"},{"name":"Avatar"},{"name":"StatusIcon"},{"name":"StatusChip"},{"name":"PriorityIcon"},{"name":"Field"},{"name":"Checkbox"},{"name":"SearchField"},{"name":"FilterChip"},{"name":"NavItem"},{"name":"PaneHeader"},{"name":"Tabs"},{"name":"Tray"},{"name":"RequestTable"},{"name":"EmptyState"},{"name":"Menu"},{"name":"Modal"},{"name":"WorkflowStepper"},{"name":"PropertyList"},{"name":"NextStep"},{"name":"Composer"},{"name":"Timeline"},{"name":"Icon"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var Fragment = React.Fragment;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }
  function omit(obj, keys) {
    var out = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) out[k] = obj[k];
    return out;
  }
  function root(className) { return cx("mr-root", className); }

  /* ---------- Icon: Lucide 1.48 node data, 1.75 stroke ---------- */
  var ICONS = {"search":[["path",{"d":"m21 21-4.34-4.34"}],["circle",{"cx":"11","cy":"11","r":"8"}]],"x":[["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],"check":[["path",{"d":"M20 6 9 17l-5-5"}]],"chevrons-up-down":[["path",{"d":"m7 15 5 5 5-5"}],["path",{"d":"m7 9 5-5 5 5"}]],"chevron-down":[["path",{"d":"m6 9 6 6 6-6"}]],"ban":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M4.929 4.929 19.07 19.071"}]],"inbox":[["polyline",{"points":"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{"d":"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]],"circle-user-round":[["path",{"d":"M17.925 20.056a6 6 0 0 0-11.851.001"}],["circle",{"cx":"12","cy":"11","r":"4"}],["circle",{"cx":"12","cy":"12","r":"10"}]],"stamp":[["path",{"d":"M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"}],["path",{"d":"M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"}],["path",{"d":"M5 22h14"}]],"calendar-days":[["path",{"d":"M8 2v3"}],["path",{"d":"M16 2v3"}],["rect",{"x":"3","y":"3","width":"18","height":"18","rx":"2"}],["path",{"d":"M3 9h18"}],["path",{"d":"M8 13h.01"}],["path",{"d":"M12 13h.01"}],["path",{"d":"M16 13h.01"}],["path",{"d":"M8 17h.01"}],["path",{"d":"M12 17h.01"}],["path",{"d":"M16 17h.01"}]],"calendar-clock":[["path",{"d":"M16 14v2.2l1.6 1"}],["path",{"d":"M16 2v3"}],["path",{"d":"M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"}],["path",{"d":"M3 9h5.859"}],["path",{"d":"M8 2v3"}],["circle",{"cx":"16","cy":"16","r":"6"}]],"layers":[["path",{"d":"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"}],["path",{"d":"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"}],["path",{"d":"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"}]],"arrow-down":[["path",{"d":"M12 5v14"}],["path",{"d":"m19 12-7 7-7-7"}]],"key-round":[["path",{"d":"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{"cx":"16.5","cy":"7.5","r":".5","fill":"currentColor"}]],"laptop":[["path",{"d":"M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"}],["path",{"d":"M20.054 15.987H3.946"}]],"receipt":[["path",{"d":"M12 17V7"}],["path",{"d":"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"}],["path",{"d":"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"}]],"building-complex":[["path",{"d":"M10 12h4"}],["path",{"d":"M10 8h4"}],["path",{"d":"M14 21v-3a2 2 0 0 0-4 0v3"}],["path",{"d":"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"}],["path",{"d":"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"}]],"file-pen-line":[["path",{"d":"M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z"}],["path",{"d":"M14.487 7.858A1 1 0 0 1 14 7V2"}],["path",{"d":"M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516"}],["path",{"d":"M8 18h1"}]],"landmark":[["path",{"d":"M10 18v-7"}],["path",{"d":"M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"}],["path",{"d":"M14 18v-7"}],["path",{"d":"M18 18v-7"}],["path",{"d":"M3 22h18"}],["path",{"d":"M6 18v-7"}]],"tag":[["path",{"d":"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{"cx":"7.5","cy":"7.5","r":".5","fill":"currentColor"}]],"plus":[["path",{"d":"M5 12h14"}],["path",{"d":"M12 5v14"}]],"panel-left-close":[["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2"}],["path",{"d":"M9 3v18"}],["path",{"d":"m16 15-3-3 3-3"}]],"archive":[["rect",{"width":"20","height":"5","x":"2","y":"3","rx":"1"}],["path",{"d":"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"}],["path",{"d":"M10 12h4"}]],"user-round":[["circle",{"cx":"12","cy":"8","r":"5"}],["path",{"d":"M20 21a8 8 0 0 0-16 0"}]],"user-round-check":[["path",{"d":"M2 21a8 8 0 0 1 13.292-6"}],["circle",{"cx":"10","cy":"8","r":"5"}],["path",{"d":"m16 19 2 2 4-4"}]],"corner-up-left":[["path",{"d":"M20 20v-7a4 4 0 0 0-4-4H4"}],["path",{"d":"M9 14 4 9l5-5"}]],"rotate-ccw":[["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]]};
  var ALIAS = { "building-2": "building-complex", "file-signature": "file-pen-line" };

  function Icon(props) {
    var name = ALIAS[props.name] || props.name;
    var node = ICONS[name] || ICONS["tag"];
    var size = props.size || 14;
    return h(
      "svg",
      {
        width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: props.strokeWidth || 1.75, strokeLinecap: "round", strokeLinejoin: "round",
        "aria-hidden": props.label ? undefined : true, role: props.label ? "img" : undefined,
        "aria-label": props.label, className: cx("mr-icon", props.className), style: props.style,
      },
      node.map(function (n, i) { return h(n[0], Object.assign({ key: i }, n[1])); })
    );
  }

  /* ---------- Button (src/components/ui/button.tsx) ---------- */
  function Button(props) {
    var variant = props.variant || "secondary";
    var size = props.size || "sm";
    var rest = omit(props, ["variant", "size", "className", "type"]);
    return h("button", Object.assign({ type: props.type || "button" }, rest, {
      className: cx("mr-btn", "text-ui", "mr-btn-" + variant, "mr-btn-" + size, props.className),
    }));
  }

  /* ---------- Kbd (src/components/ui/kbd.tsx) ---------- */
  function Kbd(props) {
    return h("kbd", { className: cx("mr-kbd", "text-micro", props.className) }, props.children);
  }

  /* ---------- Avatar (src/components/ui/avatar.tsx) ---------- */
  var TONES = [
    ["#1e2d4a", "#a3c0ff"], ["#2d2550", "#c4b7ff"], ["#153836", "#8fd8cf"], ["#3b2e17", "#efcb8c"],
    ["#43212b", "#f2abbd"], ["#1d3825", "#9fdcb0"], ["#2a2f38", "#bcc6d4"], ["#42291b", "#f3b892"],
  ];
  function toneFor(seed) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return TONES[Math.abs(hash) % TONES.length];
  }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : "";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  function Avatar(props) {
    var size = props.size || 20;
    var decorative = props.decorative !== false;
    var dim = { width: size, height: size };
    if (!props.name) {
      return h("span", {
        "aria-hidden": decorative || undefined, role: decorative ? undefined : "img",
        "aria-label": decorative ? undefined : "Unassigned",
        className: cx("mr-avatar-empty", props.className), style: dim,
      });
    }
    var tone = toneFor(props.name);
    var text = size <= 18 ? initials(props.name).slice(0, 1) : initials(props.name);
    var fontSize = size <= 18 ? 9 : size <= 20 ? 8.5 : size <= 24 ? 10 : size <= 28 ? 11 : 12;
    return h("span", {
      "aria-hidden": decorative || undefined, role: decorative ? undefined : "img",
      "aria-label": decorative ? undefined : props.name,
      className: cx("mr-avatar", props.className),
      style: Object.assign({}, dim, { background: tone[0], color: tone[1], fontSize: fontSize }),
    }, text);
  }
  function AvatarStack(props) {
    return h("span", { className: "mr-avatar-stack" }, (props.names || []).map(function (n) {
      return h(Avatar, { key: n, name: n, size: props.size || 20 });
    }));
  }

  /* ---------- Status and priority glyphs (src/components/request/glyphs.tsx) ---------- */
  var STATUS_META = {
    triage: { label: "Triage", color: "var(--color-st-triage)", verb: "Needs triage" },
    todo: { label: "To do", color: "var(--color-st-todo)", verb: "To do" },
    in_progress: { label: "In progress", color: "var(--color-st-progress)", verb: "In progress" },
    in_review: { label: "In review", color: "var(--color-st-review)", verb: "Awaiting approval" },
    done: { label: "Done", color: "var(--color-st-done)", verb: "Done" },
    declined: { label: "Declined", color: "var(--color-st-declined)", verb: "Declined" },
  };
  var PRIORITY_META = {
    urgent: { label: "Urgent", rank: 0 }, high: { label: "High", rank: 1 },
    medium: { label: "Medium", rank: 2 }, low: { label: "Low", rank: 3 }, none: { label: "No priority", rank: 4 },
  };

  function StatusIcon(props) {
    var status = props.status || "todo";
    var size = props.size || 14;
    var color = STATUS_META[status].color;
    var common = { width: size, height: size, viewBox: "0 0 14 14", fill: "none", "aria-hidden": true, className: cx("mr-icon", props.className) };
    var ring = h("circle", { key: "r", cx: 7, cy: 7, r: 5.5, stroke: color, strokeWidth: 1.5 });
    switch (status) {
      case "triage":
        return h("svg", common, h("circle", { cx: 7, cy: 7, r: 5.5, stroke: color, strokeWidth: 1.5, strokeDasharray: "2.1 1.9" }));
      case "todo":
        return h("svg", common, ring);
      case "in_progress":
        return h("svg", common, ring, h("path", { key: "p", d: "M7 3.75a3.25 3.25 0 0 1 0 6.5z", fill: color }));
      case "in_review":
        return h("svg", common, ring, h("path", { key: "p", d: "M7 3.75a3.25 3.25 0 1 1-3.25 3.25H7z", fill: color }));
      case "done":
        return h("svg", common,
          h("circle", { key: "c", cx: 7, cy: 7, r: 6.25, fill: color }),
          h("path", { key: "p", d: "m4.4 7.1 1.75 1.75L9.6 5.4", stroke: "#121212", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));
      case "declined":
        return h("svg", common,
          h("circle", { key: "c", cx: 7, cy: 7, r: 6.25, fill: color }),
          h("path", { key: "p", d: "m5 5 4 4m0-4-4 4", stroke: "#121212", strokeWidth: 1.5, strokeLinecap: "round" }));
    }
    return null;
  }

  function StatusChip(props) {
    var status = props.status || "todo";
    return h("span", {
      className: cx("mr-root", "mr-chip", "text-meta", props.className),
      style: { "--st": STATUS_META[status].color },
    }, h(StatusIcon, { status: status, size: 12 }), h("span", { className: "mr-truncate" }, props.label || STATUS_META[status].label));
  }

  function BlockedChip(props) {
    return h("span", { className: cx("mr-root", "mr-blocked", "text-meta", props.className) },
      h(Icon, { name: "ban", size: 12 }), props.label || "Blocked");
  }

  function PriorityIcon(props) {
    var priority = props.priority || "none";
    var size = props.size || 14;
    var common = {
      width: size, height: size, viewBox: "0 0 14 14", fill: "none", role: "img",
      "aria-label": "Priority: " + PRIORITY_META[priority].label, className: cx("mr-icon", props.className),
    };
    if (priority === "urgent") {
      return h("svg", common,
        h("rect", { key: "r", x: 1, y: 1, width: 12, height: 12, rx: 3, fill: "var(--color-danger)" }),
        h("path", { key: "p", d: "M7 3.75v4", stroke: "#fff", strokeWidth: 1.6, strokeLinecap: "round" }),
        h("circle", { key: "c", cx: 7, cy: 10.1, r: 0.95, fill: "#fff" }));
    }
    if (priority === "none") {
      return h("svg", common, h("path", { d: "M2.5 7h1.5M6.25 7h1.5M10 7h1.5", stroke: "var(--color-fg-3)", strokeWidth: 1.5, strokeLinecap: "round" }));
    }
    var filled = priority === "high" ? 3 : priority === "medium" ? 2 : 1;
    var bars = [{ x: 1.5, h: 4 }, { x: 5.75, h: 7 }, { x: 10, h: 10 }];
    return h("svg", common, bars.map(function (b, i) {
      return h("rect", { key: b.x, x: b.x, y: 12 - b.h, width: 2.5, height: b.h, rx: 0.75, fill: i < filled ? "var(--color-fg-2)" : "var(--color-line-strong)" });
    }));
  }

  /* ---------- Field and checkbox (globals.css .field, .checkbox) ---------- */
  function Field(props) {
    var multiline = !!props.multiline;
    var rest = omit(props, ["multiline", "label", "error", "invalid", "className", "id"]);
    var id = props.id || (props.label ? "f-" + String(props.label).replace(/\W+/g, "-").toLowerCase() : undefined);
    var control = h(multiline ? "textarea" : "input", Object.assign({}, rest, {
      id: id, className: cx("mr-field", "text-ui", props.className),
      "aria-invalid": props.invalid || props.error ? "true" : undefined,
    }));
    return h("div", { className: "mr-root" },
      props.label ? h("label", { className: "mr-label text-meta", htmlFor: id }, props.label) : null,
      control,
      props.error ? h("p", { role: "alert", className: "mr-error text-meta" }, props.error) : null);
  }

  function Checkbox(props) {
    var rest = omit(props, ["label", "indeterminate", "className"]);
    var ref = React.useRef(null);
    React.useEffect(function () { if (ref.current) ref.current.indeterminate = !!props.indeterminate; }, [props.indeterminate]);
    var box = h("input", Object.assign({ type: "checkbox", ref: ref }, rest, { className: cx("mr-checkbox", props.className) }));
    if (!props.label) return h("span", { className: "mr-root" }, box);
    return h("label", { className: "mr-root mr-check-label text-ui" }, box, props.label);
  }

  /* ---------- Search and filter chip (src/prototypes/unified/table-view.tsx) ---------- */
  function SearchField(props) {
    var controlled = props.value !== undefined;
    var st = React.useState(props.defaultValue || "");
    var value = controlled ? props.value : st[0];
    function set(v) { if (!controlled) st[1](v); if (props.onChange) props.onChange(v); }
    return h("label", { className: cx("mr-root", "mr-search", "text-ui", props.className) },
      h(Icon, { name: "search", size: 14 }),
      h("span", { className: "mr-sr" }, props.label || "Search requests"),
      h("input", { value: value, placeholder: props.placeholder || "Search requests", onChange: function (e) { set(e.target.value); } }),
      value ? h("button", { type: "button", "aria-label": "Clear search", className: "mr-search-clear", onClick: function () { set(""); } }, h(Icon, { name: "x", size: 14 })) : null,
      props.shortcut === null ? null : h(Kbd, null, props.shortcut || "/"));
  }

  function FilterChip(props) {
    var set = props.value != null && props.value !== "";
    return h("button", {
      type: "button", "data-set": set ? "true" : "false", onClick: props.onClick,
      className: cx("mr-root", "mr-filter", "text-ui", props.className),
    },
      props.icon ? h("span", { className: "mr-fg-3" }, typeof props.icon === "string" ? h(Icon, { name: props.icon, size: 14 }) : props.icon) : null,
      set ? h("span", { className: "mr-filter-value mr-truncate" }, h("span", { className: "mr-fg-3" }, props.label + ": "), props.value) : props.label,
      h(Icon, { name: "chevrons-up-down", size: 12, className: "mr-fg-3" }));
  }

  /* ---------- Navigation (src/prototypes/unified/sidebar.tsx) ---------- */
  function NavItem(props) {
    var trailing = props.trailing;
    if (trailing == null && props.unread != null) trailing = h("span", { className: "mr-nav-unread text-micro mr-num" }, props.unread);
    if (trailing == null && props.count != null) trailing = h("span", { className: "text-meta mr-fg-3 mr-num" }, props.count);
    return h("button", {
      type: "button", "aria-current": props.active ? "page" : undefined, onClick: props.onClick,
      className: cx("mr-root", "mr-nav-item", "text-ui", props.className),
    },
      h("span", { className: "mr-nav-icon" }, typeof props.icon === "string" ? h(Icon, { name: props.icon, size: 15 }) : props.icon),
      h("span", { className: "mr-nav-text mr-truncate" }, props.label),
      trailing ? h("span", null, trailing) : null);
  }

  /* ---------- Pane header (src/prototypes/unified/view-header.tsx) ---------- */
  function PaneHeader(props) {
    return h("header", { className: cx("mr-root", "mr-pane-header", props.className) },
      props.icon ? h("span", { className: "mr-pane-icon" }, typeof props.icon === "string" ? h(Icon, { name: props.icon, size: 14 }) : props.icon) : null,
      h("h1", { className: "mr-pane-title" },
        h("span", { className: "mr-truncate text-title mr-fg" }, props.title),
        props.count != null ? h("span", { className: "text-ui mr-fg-3 mr-num" }, props.count) : null),
      props.description ? h("p", { className: "mr-truncate text-meta mr-fg-3", style: { margin: 0 } }, props.description) : null,
      props.children ? h("div", { className: "mr-pane-actions" }, props.children) : null);
  }

  /* ---------- Tabs and tray (src/prototypes/unified/table-view.tsx) ---------- */
  function Tabs(props) {
    var tabs = props.tabs || [];
    var st = React.useState(props.defaultValue || (tabs[0] && tabs[0].id));
    var active = props.value !== undefined ? props.value : st[0];
    return h("div", { role: "tablist", "aria-label": props.label || "Status", className: cx("mr-root", "mr-tabs", props.className) },
      tabs.map(function (t) {
        var on = t.id === active;
        return h("button", {
          key: t.id, role: "tab", type: "button", "aria-selected": on, className: "mr-tab text-ui",
          onClick: function () { st[1](t.id); if (props.onChange) props.onChange(t.id); },
        },
          t.status ? h(StatusIcon, { status: t.status, size: 12 }) : null,
          t.label || (t.status ? STATUS_META[t.status].label : t.id),
          t.count != null ? h("span", { className: "mr-tab-count text-meta mr-num" }, t.count) : null);
      }));
  }

  function Tray(props) {
    return h("section", { "aria-label": props.label, className: cx("mr-root", "mr-tray", props.className), style: props.style },
      props.tabs ? h(Tabs, { tabs: props.tabs, value: props.tab, defaultValue: props.defaultTab, onChange: props.onTabChange }) : null,
      h("div", { className: "mr-tray-panel" },
        props.toolbar ? h("div", { className: "mr-toolbar" }, props.toolbar) : null,
        props.children));
  }

  /* ---------- Request table (src/prototypes/unified/request-table.tsx) ---------- */
  function RequestTable(props) {
    var rows = props.rows || [];
    var st = React.useState(props.defaultSelected || null);
    var selected = props.selected !== undefined ? props.selected : st[0];
    return h("table", { className: cx("mr-root", "mr-table", props.className) },
      h("thead", null, h("tr", { className: "text-meta" },
        h("th", { scope: "col", style: { width: 40, paddingLeft: 12 } }, h(Checkbox, { "aria-label": "Select all" })),
        h("th", { scope: "col", style: { width: 28, padding: 0 } }, h("span", { className: "mr-sr" }, "Priority")),
        h("th", { scope: "col", style: { width: 78 } }, "ID"),
        h("th", { scope: "col" }, "Request"),
        h("th", { scope: "col", style: { width: 136 } }, "Status"),
        h("th", { scope: "col", style: { width: 148 } }, "Owner"),
        h("th", { scope: "col", style: { width: 96, textAlign: "right", paddingRight: 16 } }, "Due"))),
      h("tbody", null, rows.map(function (r) {
        var isSel = selected === r.key;
        var closed = r.status === "done" || r.status === "declined";
        return h("tr", {
          key: r.key, "aria-selected": isSel, className: "mr-row text-ui",
          onClick: function () { st[1](r.key); if (props.onOpen) props.onOpen(r.key); },
        },
          h("td", { style: { position: "relative", paddingLeft: 12 }, onClick: function (e) { e.stopPropagation(); } },
            r.checked ? h("span", { className: "mr-row-marker", "aria-hidden": true }) : null,
            h(Checkbox, { "aria-label": "Select " + r.key, defaultChecked: !!r.checked })),
          h("td", { style: { padding: 0 } }, h("span", { style: { display: "flex", justifyContent: "center" } }, h(PriorityIcon, { priority: r.priority || "none" }))),
          h("td", { className: "mr-truncate text-meta mr-fg-3 mr-num", style: { paddingRight: 4 }, title: r.key }, r.key),
          h("td", { style: { paddingRight: 16 } }, h("div", { className: "mr-cell" },
            h("span", { className: cx("mr-truncate", closed ? "mr-fg-2" : "mr-fg") }, r.title),
            r.comments ? h("span", { className: "text-meta mr-fg-3 mr-num", style: { flexShrink: 0 } }, r.comments + " comments") : null)),
          h("td", null, h("div", { className: "mr-cell", style: { gap: 6 } },
            h(StatusChip, { status: r.status }),
            r.blocked ? h(Icon, { name: "ban", size: 14, className: "mr-danger-text", label: "Blocked" }) : null)),
          h("td", null, h("div", { className: "mr-cell" },
            h(Avatar, { name: r.owner, size: 20 }),
            h("span", { className: cx("mr-truncate", !r.owner && "mr-fg-3") }, r.owner || "Unassigned"))),
          h("td", { className: cx("mr-num", r.overdue && "mr-danger-text"), style: { textAlign: "right", paddingRight: 16 } }, r.due || ""));
      })));
  }

  /* ---------- Empty state (src/prototypes/unified/table-view.tsx) ---------- */
  function EmptyState(props) {
    return h("div", { className: cx("mr-root", "mr-empty", props.className) },
      h("p", { className: "mr-empty-title text-ui" }, props.title),
      h("p", { className: "mr-empty-body text-meta" }, props.body),
      props.action ? h("div", { className: "mr-empty-action" }, props.action) : null);
  }

  /* ---------- Menu: the picker list on the popover surface (src/components/ui/picker.tsx, popover.tsx) ---------- */
  function Menu(props) {
    var options = props.options || [];
    var q = React.useState("");
    var activeSt = React.useState(props.activeIndex != null ? props.activeIndex : 0);
    var valSt = React.useState(props.defaultValue);
    var value = props.value !== undefined ? props.value : valSt[0];
    var shown = options.filter(function (o) { return !q[0] || String(o.label).toLowerCase().indexOf(q[0].toLowerCase()) >= 0; });
    return h("div", { className: cx("mr-root", "mr-popover", props.className), style: { width: props.width || 240 } },
      props.title ? h("div", { className: "mr-menu-title text-micro" }, props.title) : null,
      props.searchable ? h("div", { className: "mr-menu-search" },
        h(Icon, { name: "search", size: 14 }),
        h("input", { className: "text-ui", placeholder: props.placeholder || "Search…", value: q[0], onChange: function (e) { q[1](e.target.value); activeSt[1](0); }, "aria-label": "Filter options" })) : null,
      h("ul", { role: "listbox", className: "mr-menu-list" },
        shown.length === 0 ? h("li", { className: "text-ui mr-fg-3", style: { padding: 8 } }, "No matches") :
        shown.map(function (o, i) {
          var sel = o.value === value;
          return h("li", {
            key: o.value, role: "option", "aria-selected": sel, className: "mr-option text-ui",
            "data-active": i === activeSt[0] ? "true" : "false", "data-separated": o.separated ? "true" : "false",
            onPointerMove: function () { activeSt[1](i); },
            onClick: function () { valSt[1](o.value); if (props.onChange) props.onChange(o.value); },
          },
            o.icon ? h("span", { className: "mr-option-icon" }, typeof o.icon === "string" ? h(Icon, { name: o.icon, size: 14 }) : o.icon) : null,
            h("span", { className: "mr-truncate", style: { flex: 1 } }, o.label),
            o.hint ? h("span", { className: "mr-option-hint text-meta" }, o.hint) : null,
            h("span", { className: "mr-option-check", "data-hidden": sel ? "false" : "true" }, h(Icon, { name: "check", size: 14 })));
        })));
  }

  /* ---------- Modal surface (src/components/ui/modal.tsx) ---------- */
  function Modal(props) {
    return h("div", { role: "dialog", "aria-label": props.title, className: cx("mr-root", "mr-modal", props.className) },
      h("div", { className: "mr-modal-head" },
        h("h2", { className: "text-ui" }, props.title),
        h(Button, { variant: "ghost", size: "icon-sm", "aria-label": "Close", onClick: props.onClose }, h(Icon, { name: "x", size: 16 }))),
      h("div", { className: "mr-modal-body" }, props.children),
      props.footer ? h("div", { className: "mr-modal-foot" }, props.footer) : null);
  }

  /* ---------- Workflow stepper (src/components/request/stepper.tsx) ---------- */
  var STAGES = ["triage", "todo", "in_progress", "in_review", "done"];
  var STAGE_LABEL = { triage: "Triage", todo: "To do", in_progress: "In progress", in_review: "Approval", done: "Done" };
  function smallCheck() {
    return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true, className: "mr-icon" },
      h("circle", { cx: 6, cy: 6, r: 5.5, fill: "var(--color-fg-4)" }),
      h("path", { d: "m3.6 6.1 1.6 1.6 3.2-3.3", stroke: "#121212", strokeWidth: 1.4, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }));
  }
  function smallRing(dashed) {
    return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true, className: "mr-icon" },
      h("circle", { cx: 6, cy: 6, r: 5, fill: "none", stroke: "var(--color-fg-4)", strokeWidth: 1.25, strokeDasharray: dashed ? "1.6 1.6" : undefined }));
  }
  function WorkflowStepper(props) {
    var status = props.status || "triage";
    var needsApproval = props.needsApproval !== false;
    if (status === "declined") {
      return h("ol", { "aria-label": "Progress", className: cx("mr-root", "mr-stepper", "text-meta", props.className), style: { gap: 8 } },
        h("li", { className: "mr-step-label" }, h(StatusIcon, { status: "triage", size: 12 }), "Triage"),
        h("li", { "aria-hidden": true, style: { height: 1, width: 32, background: "var(--color-line-strong)" } }),
        h("li", { "aria-current": "step", className: "mr-step-label", style: { fontWeight: 500, color: "var(--color-fg)" } }, h(StatusIcon, { status: "declined", size: 14 }), "Declined"));
    }
    var current = STAGES.indexOf(status);
    var reached = status === "done" ? STAGES.length - 1 : current;
    return h("ol", {
      "aria-label": "Progress: " + STATUS_META[status].label + (props.blocked ? ", blocked" : ""),
      className: cx("mr-root", "mr-stepper", "text-meta", props.className),
    }, STAGES.map(function (stage, i) {
      var skipped = stage === "in_review" && !needsApproval && status !== "triage";
      var complete = i < current || status === "done";
      var isCurrent = i === current && status !== "done";
      var last = i === STAGES.length - 1;
      var isEnd = last && status === "done";
      var glyph = isEnd ? h(StatusIcon, { status: "done", size: 14 })
        : isCurrent && props.blocked ? h(Icon, { name: "ban", size: 14, className: "mr-danger-text" })
        : isCurrent ? h(StatusIcon, { status: status, size: 14 })
        : complete && !skipped ? smallCheck() : smallRing(skipped);
      return h("li", { key: stage, className: "mr-step", "aria-current": isCurrent || isEnd ? "step" : undefined, "data-skipped": skipped ? "true" : undefined },
        h("span", { className: "mr-step-label" }, glyph,
          h("span", null, skipped ? "No approval" : STAGE_LABEL[stage],
            isCurrent && props.blocked ? h("span", { className: "mr-danger-text" }, " · Blocked") : null)),
        last ? null : h("span", { "aria-hidden": true, className: "mr-step-line", "data-done": i < current || (status === "done" && i < reached) ? "true" : "false" }));
    }));
  }

  /* ---------- Property list (src/components/request/properties.tsx) ---------- */
  function PropertyList(props) {
    var layout = props.layout || "list";
    return h("dl", { className: cx("mr-root", "mr-props", props.className), "data-layout": layout },
      (props.rows || []).map(function (r) {
        var value = r.value;
        if (r.editable) value = h("button", { type: "button", className: "mr-value-btn text-ui mr-fg" }, value);
        return h("div", { key: r.label, className: "mr-prop" },
          h("dt", { className: "text-meta" }, r.label),
          h("dd", { className: "text-ui" }, value));
      }));
  }

  /* ---------- Next step card (src/components/request/next-step.tsx) ---------- */
  function NextStep(props) {
    var tinted = props.tone === "danger" || !!props.emphasis;
    var stColor = props.tone === "danger" ? "var(--color-danger)" : props.status ? STATUS_META[props.status].color : undefined;
    var glyph = props.icon != null ? (typeof props.icon === "string" ? h(Icon, { name: props.icon, size: 14, className: cx("mr-next-glyph", props.tone === "danger" && "mr-danger-text") }) : props.icon)
      : props.status ? h(StatusIcon, { status: props.status, className: "mr-next-glyph" }) : null;
    return h("section", {
      "aria-label": "Next step", className: cx("mr-root", "mr-next", props.className),
      "data-tinted": tinted ? "true" : "false", style: stColor ? { "--st": stColor } : undefined,
    },
      h("div", { className: "mr-next-row" }, glyph,
        h("div", { className: "mr-next-main" },
          h("div", { className: "mr-next-head" },
            h("h3", { className: "text-ui" }, props.title),
            props.meta ? h("p", { className: "text-meta mr-fg-3", style: { margin: 0 } }, props.meta) : null),
          props.body ? h("div", { className: "mr-next-body text-meta" }, props.body) : null,
          props.actions ? h("div", { className: "mr-next-actions" }, props.actions) : null,
          props.children)));
  }

  /* ---------- Composer (src/components/request/composer.tsx) ---------- */
  function Composer(props) {
    var st = React.useState(props.defaultValue || "");
    var body = st[0];
    var empty = !body.trim();
    function submit() { if (empty) return; if (props.onSubmit) props.onSubmit(body.trim()); st[1](""); }
    return h("form", {
      className: cx("mr-root", "mr-composer", props.className),
      onSubmit: function (e) { e.preventDefault(); submit(); },
    },
      h("label", { className: "mr-sr", htmlFor: "mr-composer" }, "Comment"),
      h("textarea", {
        id: "mr-composer", rows: 1, value: body, placeholder: props.placeholder || "Leave a comment…", className: "text-ui",
        onChange: function (e) { st[1](e.target.value); },
        onKeyDown: function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } },
      }),
      h("div", { className: "mr-composer-foot" },
        h("span", { className: "mr-composer-hint text-micro" }, h(Kbd, null, "⌘"), h(Kbd, null, "↵"), h("span", { style: { marginLeft: 2 } }, "to send")),
        h(Button, { type: "submit", variant: empty ? "secondary" : "primary", disabled: empty, style: { marginLeft: "auto" } }, props.submitLabel || "Comment")));
  }

  /* ---------- Timeline (src/components/request/timeline.tsx) ---------- */
  function renderBody(text) {
    return String(text).split(/(@[A-Z][a-zà-ÿ]+)/g).map(function (part, i) {
      return /^@[A-Z][a-zà-ÿ]+$/.test(part) ? h("span", { key: i, className: "mr-mention" }, part) : part;
    });
  }
  function Timeline(props) {
    var items = props.items || [];
    return h("ol", { className: cx("mr-root", "mr-timeline", props.className), style: props.background ? { "--timeline-bg": props.background } : undefined },
      h("span", { "aria-hidden": true, className: "mr-timeline-spine" }),
      items.map(function (it, i) {
        if (it.kind === "comment") {
          return h("li", { key: i, className: "mr-tl-item" },
            h("span", { className: "mr-tl-avatar" }, h(Avatar, { name: it.author, size: 24 })),
            h("div", { className: "mr-tl-comment" },
              h("div", { className: "mr-tl-head" },
                h("span", { className: "mr-truncate text-ui mr-medium mr-fg" }, it.author),
                h("time", { className: "text-meta mr-fg-3 mr-num" }, it.at)),
              h("p", { className: "mr-tl-body text-read" }, renderBody(it.body))));
        }
        return h("li", { key: i, className: "mr-tl-item mr-tl-event-row" },
          h("span", { className: "mr-tl-dot" }, h("span", { className: "mr-tl-dot-inner" },
            typeof it.icon === "string" ? h(Icon, { name: it.icon, size: 12, className: "mr-fg-2", style: it.iconColor ? { color: it.iconColor } : undefined }) : it.icon)),
          h("div", { className: "mr-tl-event text-meta" },
            h("span", null, h("span", { className: "mr-medium mr-fg" }, it.actor), " " + it.text),
            h("span", { className: "mr-fg-3" }, " · "),
            h("time", { className: "mr-fg-3 mr-num" }, it.at),
            it.note ? h("blockquote", { className: "mr-tl-note text-ui" }, it.note) : null));
      }));
  }

  var api = {
    Button: Button, Kbd: Kbd, Avatar: Avatar, AvatarStack: AvatarStack, StatusIcon: StatusIcon, StatusChip: StatusChip,
    BlockedChip: BlockedChip, PriorityIcon: PriorityIcon, Field: Field, Checkbox: Checkbox, SearchField: SearchField,
    FilterChip: FilterChip, NavItem: NavItem, PaneHeader: PaneHeader, Tabs: Tabs, Tray: Tray, RequestTable: RequestTable,
    EmptyState: EmptyState, Menu: Menu, Modal: Modal, WorkflowStepper: WorkflowStepper, PropertyList: PropertyList,
    NextStep: NextStep, Composer: Composer, Timeline: Timeline, Icon: Icon,
    STATUS_META: STATUS_META, PRIORITY_META: PRIORITY_META, Fragment: Fragment,
  };
  window.Meridian = Object.assign(window.Meridian || {}, api);
})();
