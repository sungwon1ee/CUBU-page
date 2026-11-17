import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// 앱과 같은 네 언어(갈무리 글꼴에 글자가 있는 언어만). 순서는 고르는 목록의 순서다.
export const LANGS = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "es", label: "Español" },
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

/** 지구본 단추. 누르면 기기의 기본 선택 목록이 뜬다 */
export function LangPicker() {
  const { lang, setLang } = useLang();
  return (
    <label className="lang">
      <svg viewBox="0 0 11 11" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M3 0h5v1h-5zM1 1h2v1h-2zM5 1h1v1h-1zM8 1h2v1h-2zM1 2h1v1h-1zM4 2h1v1h-1zM6 2h1v1h-1zM9 2h1v1h-1zM0 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM10 3h1v1h-1zM0 4h1v1h-1zM3 4h1v1h-1zM7 4h1v1h-1zM10 4h1v1h-1zM0 5h11v1h-11zM0 6h1v1h-1zM3 6h1v1h-1zM7 6h1v1h-1zM10 6h1v1h-1zM0 7h1v1h-1zM4 7h1v1h-1zM6 7h1v1h-1zM10 7h1v1h-1zM1 8h1v1h-1zM4 8h1v1h-1zM6 8h1v1h-1zM9 8h1v1h-1zM1 9h2v1h-2zM5 9h1v1h-1zM8 9h2v1h-2zM3 10h5v1h-5z" />
      </svg>
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
