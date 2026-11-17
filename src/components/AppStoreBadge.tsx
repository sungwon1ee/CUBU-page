import { siApple } from "simple-icons";
import { useText } from "../i18n";
import { site } from "../site";
import { COMMON } from "../strings";

/**
 * App Store 배지. 출시 전에 Apple이 주는 공식 배지 그림으로 바꿔 끼운다
 * (https://developer.apple.com/app-store/marketing/guidelines/).
 */
export function AppStoreBadge({ size }: { size: "large" | "small" }) {
  return (
    <a className={`badge badge--${size}`} href={site.appStoreUrl || "#"} aria-label={useText(COMMON).badge}>
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
