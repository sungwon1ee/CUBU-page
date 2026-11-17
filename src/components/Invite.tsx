import { LangPicker, useDocumentMeta, useLang, useText, type Lang } from "../i18n";
import { COMMON } from "../strings";
import { AppStoreBadge } from "./AppStoreBadge";
import { Footer } from "./Footer";
import { Grain } from "./Grain";

// 놀러 가기 초대 링크(https://cubu.page/r/코드)가 여는 페이지. 앱이 깔려 있으면 Universal Link로 앱이 바로 열리고,
// 여기까지 오는 건 앱이 없거나 링크를 앱 밖(메신저 안 브라우저 등)에서 연 경우다.
// 코드 글자는 앱의 RoomShare / relay의 ALPHABET과 같다(0/O, 1/I 없음).
const CODE = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

/** 주소 끝의 코드. 개발 서버에서는 ?code=로도 받는다 */
function codeFromUrl(): string | null {
  const last = location.pathname.split("/").filter(Boolean).pop() ?? "";
  const raw = (new URLSearchParams(location.search).get("code") ?? last).toUpperCase();
  return CODE.test(raw) ? raw : null;
}

const TEXT: Record<Lang, { title: string; body: string; open: string; hint: string; noApp: string; bad: string }> = {
  ko: {
    title: "CUBU 집에 초대받았어요",
    body: "CUBU에서 이 집에 놀러 갈 수 있어요.",
    open: "CUBU에서 열기",
    hint: "앱이 열리지 않으면 CUBU의 놀러 가기에 위 코드를 넣어 주세요.",
    noApp: "CUBU가 아직 없다면",
    bad: "초대 코드를 읽지 못했어요. 받은 링크를 다시 확인해 주세요.",
  },
  en: {
    title: "You're invited to a CUBU house",
    body: "You can visit this house in CUBU.",
    open: "Open in CUBU",
    hint: "If the app doesn't open, enter the code above in Visit in CUBU.",
    noApp: "Don't have CUBU yet?",
    bad: "This invite code couldn't be read. Please check the link you got.",
  },
  ja: {
    title: "CUBUの家に招待されました",
    body: "CUBUでこの家に遊びに行けます。",
    open: "CUBUで開く",
    hint: "アプリが開かないときは、CUBUの「遊びに行く」に上のコードを入れてください。",
    noApp: "CUBUをまだ持っていなければ",
    bad: "招待コードを読み取れませんでした。受け取ったリンクをもう一度確認してください。",
  },
  es: {
    title: "Te han invitado a una casa de CUBU",
    body: "Puedes visitar esta casa en CUBU.",
    open: "Abrir en CUBU",
    hint: "Si la app no se abre, escribe el código de arriba en Visitar, dentro de CUBU.",
    noApp: "¿Aún no tienes CUBU?",
    bad: "No se pudo leer el código de invitación. Revisa el enlace que te enviaron.",
  },
};

export function Invite() {
  const { lang } = useLang();
  const t = useText(TEXT);
  const code = codeFromUrl();
  useDocumentMeta(t.title, t.body);
  return (
    <>
      <Grain />
      <nav className="nav nav--scrolled nav--plain">
        <a className="nav__brand" href="/" aria-label={COMMON[lang].home}>
          <img src="/apple-touch-icon.png" alt="" width={36} height={36} />
          <span>CUBU</span>
        </a>
        <div className="nav__end">
          <LangPicker />
        </div>
      </nav>
      <main className="invite">
        <div className="snap invite__card">
          <span className="tape" />
          <h1 className="invite__title">{t.title}</h1>
          {code ? (
            <>
              <p>{t.body}</p>
              <p className="invite__code" aria-label={code.split("").join(" ")}>
                {code}
              </p>
              <a className="invite__open" href={`cubu://r/${code}`}>
                {t.open}
              </a>
              <p className="invite__hint">{t.hint}</p>
            </>
          ) : (
            <p>{t.bad}</p>
          )}
        </div>
        <div className="invite__get">
          <p>{t.noApp}</p>
          <AppStoreBadge size="large" />
        </div>
      </main>
      <Footer />
    </>
  );
}
