import { siApple } from "simple-icons";
import { site } from "../site";

/**
 * App Store 배지. 출시 전에 Apple이 주는 공식 배지 그림으로 바꿔 끼운다
 * (https://developer.apple.com/app-store/marketing/guidelines/).
 */
export function AppStoreBadge({ size }: { size: "large" | "small" }) {
  return (
    <a className={`badge badge--${size}`} href={site.appStoreUrl || "#"} aria-label="App Store에서 다운로드">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={siApple.path} />
      </svg>
      <span>
        <small>Download on the</small>
        <strong>App Store</strong>
      </span>
    </a>
  );
}
