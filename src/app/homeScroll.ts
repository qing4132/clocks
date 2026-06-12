const DETAIL_FROM_HOME_KEY = "qclocks:detail-from-home";
const HOME_SCROLL_Y_KEY = "qclocks:home-scroll-y";
const RESTORE_HOME_SCROLL_KEY = "qclocks:restore-home-scroll";

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function rememberHomeClockNavigation(pathname: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DETAIL_FROM_HOME_KEY, normalizePath(pathname));
  sessionStorage.setItem(HOME_SCROLL_Y_KEY, String(window.scrollY));
  sessionStorage.removeItem(RESTORE_HOME_SCROLL_KEY);
}

export function prepareHomeReturn(pathname: string) {
  if (typeof window === "undefined") return false;

  const expectedPath = sessionStorage.getItem(DETAIL_FROM_HOME_KEY);
  const cameFromHome = expectedPath === normalizePath(pathname);

  sessionStorage.removeItem(DETAIL_FROM_HOME_KEY);
  if (cameFromHome) {
    sessionStorage.setItem(RESTORE_HOME_SCROLL_KEY, "1");
  } else {
    sessionStorage.removeItem(HOME_SCROLL_Y_KEY);
    sessionStorage.removeItem(RESTORE_HOME_SCROLL_KEY);
  }
  return cameFromHome;
}

export function forgetHomeClockNavigation() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(RESTORE_HOME_SCROLL_KEY) === "1") return;

  sessionStorage.removeItem(DETAIL_FROM_HOME_KEY);
  sessionStorage.removeItem(HOME_SCROLL_Y_KEY);
}

export function restoreHomeScrollIfRequested() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(RESTORE_HOME_SCROLL_KEY) !== "1") return;

  const scrollY = Number(sessionStorage.getItem(HOME_SCROLL_Y_KEY) ?? 0);
  sessionStorage.removeItem(HOME_SCROLL_Y_KEY);
  sessionStorage.removeItem(RESTORE_HOME_SCROLL_KEY);

  const restore = () => window.scrollTo(0, scrollY);
  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
  window.setTimeout(restore, 100);
}