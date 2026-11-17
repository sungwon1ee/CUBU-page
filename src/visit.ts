import { site } from "./site";

let sent = false;

/**
 * 페이지를 열었다고 중계 서버에 한 번 알린다(운영 화면의 웹사이트 방문 수).
 * 쿠키도 저장도 없고, 보내는 것은 페이지 주소, 언어, 들어온 사이트 이름뿐이다. 실제 사이트에서만 보낸다.
 */
export function reportVisit(lang: string) {
  if (sent || location.hostname !== "cubu.page" || !navigator.sendBeacon) return;
  sent = true;
  let ref = "";
  try {
    ref = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    /* 이상한 referrer */
  }
  // text/plain이라 브라우저가 미리 묻는 요청(CORS preflight) 없이 바로 보낸다
  const body = new Blob([JSON.stringify({ path: location.pathname, lang, ref })], { type: "text/plain" });
  navigator.sendBeacon(`${site.relayUrl}/v1/site/open`, body);
}
