import { render } from "preact";
import browser from "webextension-polyfill";
import { App } from "./App";

const MIN_WIDTH = 350;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 525;
const COLLAPSE_THRESHOLD = 80; // drag this far past MIN_WIDTH to snap closed

const dragHandlebarSVG = `<svg class="handlebar-svg" id="drag-handlebar-svg" width="2" height="20" viewBox="0 0 2 20" xmlns="http://www.w3.org/2000/svg"><rect width="2" height="20"/></svg>`;

const openHandlebarSVG = `<svg class="handlebar-svg" id="open-handlebar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M7.913 19.071l7.057-7.078-7.057-7.064a1 1 0 011.414-1.414l7.764 7.77a1 1 0 010 1.415l-7.764 7.785a1 1 0 01-1.414-1.414z" clip-rule="evenodd"></path></svg>`;

function throttle<T extends (...args: never[]) => void>(fn: T, limit: number) {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => (inThrottle = false), limit);
  };
}

function waitForElement(selectors: string[]): Promise<Element> {
  return new Promise((resolve) => {
    for (const selector of selectors) {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);
    }
    const observer = new MutationObserver(() => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          return resolve(element);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

async function main() {
  const panel = document.createElement("div");
  panel.id = "leetbox-panel";
  panel.style.flexShrink = "0";
  panel.style.overflow = "auto";

  const handlebar = document.createElement("div");
  handlebar.id = "leetbox-handlebar";
  handlebar.style.minWidth = "8px";
  handlebar.style.userSelect = "none";
  handlebar.style.position = "relative";

  // Shown only while dragging, so the pointer can't fall through to
  // anything that would swallow mousemove.
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "none";
  overlay.style.zIndex = "100";
  overlay.style.cursor = "ew-resize";

  let isResizing = false;
  let isOpen = true;
  let width = DEFAULT_WIDTH;

  function setToggleState(toggleState: boolean, persist = true) {
    if (toggleState) {
      panel.style.display = "block";
      handlebar.innerHTML = `<div id="handlebar-highlight">${dragHandlebarSVG}</div>`;
      handlebar.style.cursor = "ew-resize";
      handlebar.style.zIndex = "10";
      isOpen = true;
    } else {
      panel.style.display = "none";
      handlebar.innerHTML = openHandlebarSVG;
      handlebar.style.cursor = "pointer";
      handlebar.style.zIndex = "0";
      isOpen = false;
    }
    if (persist) browser.storage.local.set({ leetboxToggleState: toggleState });
  }

  function setWidth(next: number, persist = true) {
    width = next;
    panel.style.width = `${next}px`;
    if (persist) browser.storage.local.set({ leetboxWidth: next });
  }

  handlebar.addEventListener("mousedown", (event) => {
    if (!isOpen) {
      setToggleState(true);
      return;
    }
    isResizing = true;
    overlay.style.display = "block";
    event.preventDefault();
  });

  handlebar.addEventListener("dragstart", (event) => event.preventDefault());

  handlebar.addEventListener("dblclick", () => {
    if (isOpen) setToggleState(false);
  });

  const onMouseMove = throttle((event: MouseEvent) => {
    if (!isResizing) return;

    const desired = window.innerWidth - event.clientX;

    if (desired < MIN_WIDTH - COLLAPSE_THRESHOLD) {
      setToggleState(false);
      isResizing = false;
      overlay.style.display = "none";
      return;
    }

    setWidth(Math.max(MIN_WIDTH, Math.min(desired, MAX_WIDTH)), false);
  }, 16);

  window.addEventListener("mousemove", onMouseMove as (e: MouseEvent) => void);

  window.addEventListener("mouseup", () => {
    if (!isResizing) return;
    isResizing = false;
    overlay.style.display = "none";
    browser.storage.local.set({ leetboxWidth: width });
  });

  // Restore persisted state before mounting.
  const stored = await browser.storage.local.get([
    "leetboxToggleState",
    "leetboxWidth",
  ]);
  setWidth((stored.leetboxWidth as number) ?? DEFAULT_WIDTH, false);
  setToggleState((stored.leetboxToggleState as boolean) ?? true, false);

  browser.storage.onChanged.addListener((changes) => {
    if (changes.leetboxToggleState) {
      setToggleState(changes.leetboxToggleState.newValue === true, false);
    }
    if (changes.leetboxWidth) {
      setWidth(changes.leetboxWidth.newValue as number, false);
    }
  });

  const mainContentContainer = await waitForElement(["#qd-content"]);
  mainContentContainer.insertAdjacentElement("afterend", overlay);
  mainContentContainer.insertAdjacentElement("afterend", panel);
  mainContentContainer.insertAdjacentElement("afterend", handlebar);

  const shadow = panel.attachShadow({ mode: "open" });
  const mount = document.createElement("div");
  shadow.appendChild(mount);
  render(<App />, mount);
}

main();
