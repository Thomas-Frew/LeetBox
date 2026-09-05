import { render } from "preact";
import { App } from "./components/App";

// @ts-ignore
import panelCss from "./public/panel.css?inline";

const MIN_WIDTH = 360;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 360;

function waitForElement(selector: string): Promise<Element> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

async function main() {
  const panel = document.createElement("div");
  panel.id = "leetbox-panel";
  panel.tabIndex = -1;
  panel.style.width = `${DEFAULT_WIDTH}px`;

  const handlebar = document.createElement("div");
  handlebar.id = "leetbox-handlebar";

  const overlay = document.createElement("div");
  overlay.id = "leetbox-overlay";

  panel.addEventListener("focusin", () => panel.classList.add("focused"));
  panel.addEventListener("focusout", () => panel.classList.remove("focused"));

  let isResizing = false;

  handlebar.addEventListener("mousedown", (event) => {
    isResizing = true;
    handlebar.classList.add("dragging");
    overlay.classList.add("active");
    event.preventDefault();
  });

  window.addEventListener("mousemove", (event) => {
    if (!isResizing) return;
    const desired = window.innerWidth - event.clientX;
    panel.style.width = `${Math.max(MIN_WIDTH, Math.min(desired, MAX_WIDTH))}px`;
  });

  window.addEventListener("mouseup", () => {
    if (!isResizing) return;
    isResizing = false;
    handlebar.classList.remove("dragging");
    overlay.classList.remove("active");
  });

  const anchor = await waitForElement("#qd-content");
  anchor.insertAdjacentElement("afterend", overlay);
  anchor.insertAdjacentElement("afterend", panel);
  anchor.insertAdjacentElement("afterend", handlebar);

  const shadow = panel.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = panelCss;
  shadow.appendChild(style);

  const mount = document.createElement("div");
  mount.style.height = "100%";
  shadow.appendChild(mount);

  render(<App />, mount);
}

main();
