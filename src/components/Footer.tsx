import { siInstagram } from "simple-icons";
import { useText } from "../i18n";
import { site, type SocialId } from "../site";
import { COMMON } from "../strings";

// 계정을 늘리면 site.ts의 socials와 여기(simple-icons 그림)에 함께 넣는다
const ICONS: Record<SocialId, string> = { instagram: siInstagram.path };

export function Footer() {
  const t = useText(COMMON);
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <p className="footer__name">CUBU</p>
          <p>
            {t.madeBy} {site.maker}
          </p>
        </div>
        <ul className="footer__links">
          <li>
            <a href="/privacy/">{t.privacy}</a>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>
              {t.contact} {site.email}
            </a>
          </li>
        </ul>
        <ul className="footer__social">
          {site.socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} aria-label={s.label} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS[s.id]} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="footer__rights">
        © {site.year} {site.maker}. All rights reserved.
      </p>
    </footer>
  );
}
