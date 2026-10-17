/**
 * Shared by the server-rendered page (inline script) and the client store.
 * Kept free of "use client" so the server receives the plain string.
 */
export const SIDEBAR_STORAGE_KEY = "meridian:sidebar";

export const SIDEBAR_BOOTSTRAP = `try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_STORAGE_KEY)})==="collapsed")document.documentElement.dataset.sidebar="collapsed"}catch(e){}`;
