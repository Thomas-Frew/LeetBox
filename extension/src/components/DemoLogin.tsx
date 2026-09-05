import DemoSignInButton from "./buttons/DemoLoginButton";
import browser from "webextension-polyfill";
import logo from "../assets/logo.png";

const logoSrc = browser.runtime.getURL(logo);

export function DemoLogin() {
  return (
    <div class="flex h-full flex-col items-center justify-center gap-4 overflow-auto p-4">
      <div class="flex items-center gap-4">
        <img src={logoSrc} class="h-16 w-16" alt="" />
        <h1 class="text-5xl font-bold leading-none">LeetBox</h1>
      </div>
      <DemoSignInButton />
    </div>
  );
}
