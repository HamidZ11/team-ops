"use client";

import { useSyncExternalStore } from "react";
import { SIDEBAR_STORAGE_KEY } from "./sidebar-bootstrap";

/*
 * The sidebar preference lives on <html data-sidebar>, set before first paint
 * by SIDEBAR_BOOTSTRAP so a collapsed sidebar never flashes open on load.
 * CSS animates the width from that attribute; React only mirrors it.
 */
const EVENT = "meridian:sidebar-change";

function isOpen() {
  return document.documentElement.dataset.sidebar !== "collapsed";
}

export function setSidebarOpen(open: boolean) {
  if (open) delete document.documentElement.dataset.sidebar;
  else document.documentElement.dataset.sidebar = "collapsed";
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "expanded" : "collapsed");
  } catch {
    // Private mode or blocked storage: the toggle still works for this session.
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * The bootstrap script only runs on a full page load. After a client-side
 * navigation into the app, apply the saved preference from storage instead.
 */
export function restoreSidebarPreference() {
  let collapsed = false;
  try {
    collapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
  } catch {
    return;
  }
  if (collapsed === !isOpen()) return;
  if (collapsed) document.documentElement.dataset.sidebar = "collapsed";
  else delete document.documentElement.dataset.sidebar;
  window.dispatchEvent(new Event(EVENT));
}

export function useSidebarOpen() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(EVENT, onChange);
      return () => window.removeEventListener(EVENT, onChange);
    },
    isOpen,
    () => true,
  );
}
