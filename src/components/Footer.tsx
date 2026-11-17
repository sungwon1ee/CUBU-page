import { siInstagram, siX, siYoutube } from "simple-icons";
import { site, type SocialId } from "../site";

const ICONS: Record<SocialId, string> = { instagram: siInstagram.path, x: siX.path, youtube: siYoutube.path };

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <p className="footer__name">CUBU</p>
          <p>만든 사람 {site.maker}</p>
        </div>
        <ul className="footer__links">
          <li>
            <a href="/privacy/">개인정보 처리방침</a>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>문의 {site.email}</a>
          </li>
        </ul>
        <ul className="footer__social">
          {site.socials.map((s) => (
            <li key={s.id}>
              <a href={s.url || "#"} aria-label={s.label} {...(s.url ? { target: "_blank", rel: "noreferrer" } : {})}>
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
