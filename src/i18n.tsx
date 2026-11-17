import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// 앱과 같은 네 언어(갈무리 글꼴에 글자가 있는 언어만). 순서는 고르는 목록의 순서다.
export const LANGS = [
  { id: "ko", label: "한국어", short: "KO" },
  { id: "en", label: "English", short: "EN" },
  { id: "ja", label: "日本語", short: "JA" },
  { id: "es", label: "Español", short: "ES" },
] as const;
export type Lang = (typeof LANGS)[number]["id"];

const KEY = "cubu.lang";
const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.id === v);

/** 주소의 ?lang= → 전에 고른 언어 → 브라우저 언어 → 영어 */
function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* 저장소를 못 쓰는 브라우저 */
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "ko", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* 저장소를 못 쓰는 브라우저 */
    }
    // 공유한 주소에 ?lang=이 있었다면 지금 고른 언어로 맞춘다
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", l);
      history.replaceState(null, "", url);
    }
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** 언어별 값 묶음에서 지금 언어의 것을 고른다 */
export function useText<T>(table: Record<Lang, T>): T {
  return table[useLang().lang];
}

/** 문서 제목과 설명을 지금 언어로 바꾼다 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      for (const sel of ['meta[name="description"]', 'meta[property="og:description"]']) {
        document.querySelector(sel)?.setAttribute("content", description);
      }
    }
  }, [title, description]);
}

const PICKER_LABEL: Record<Lang, string> = { ko: "언어", en: "Language", ja: "言語", es: "Idioma" };

/** 지구 그림과 언어 약자. 누르면 기기의 기본 선택 목록이 뜬다 */
export function LangPicker() {
  const { lang, setLang } = useLang();
  const current = LANGS.find((l) => l.id === lang)!;
  return (
    <label className="lang">
      <svg viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M3 0h3v1H3zM2 1h1v1H2zM6 1h1v1H6zM1 2h1v1H1zM7 2h1v1H7zM0 3h1v3H0zM8 3h1v3H8zM1 6h1v1H1zM7 6h1v1H7zM2 7h1v1H2zM6 7h1v1H6zM3 8h3v1H3zM4 1h1v7H4zM1 4h7v1H1z" />
      </svg>
      <span>{current.short}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label={PICKER_LABEL[lang]}>
        {LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
