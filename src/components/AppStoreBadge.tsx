import { siApple, siGoogleplay } from "simple-icons";
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

/**
 * Google Play 배지. App Store 배지와 같은 판, 같은 너비다. 주소가 없는 동안은
 * 누를 수 없고, 모서리에 "준비 중" 스티커가 붙는다.
 */
export function PlayBadge() {
  const t = useText(COMMON);
  const body = (
    <>
      {/* 세모가 칸을 꽉 채워 사과보다 커 보이므로 칸 안에서 조금 줄인다 */}
      <svg viewBox="-2.5 -2.5 29 29" aria-hidden="true">
        <path d={siGoogleplay.path} />
      </svg>
      <span>
        <small>GET IT ON</small>
        <strong>Google Play</strong>
      </span>
    </>
  );
  return site.playStoreUrl ? (
    <a className="badge badge--large badge--play" href={site.playStoreUrl}>
      {body}
    </a>
  ) : (
    <div className="badge badge--large badge--play badge--soon">
      {body}
      <em className="badge__soon">{t.soon}</em>
    </div>
  );
}

/** 큰 내려받기 자리: App Store 배지와 Google Play 배지. */
export function StoreBadges() {
  return (
    <div className="stores">
      <AppStoreBadge size="large" />
      <PlayBadge />
    </div>
  );
}
