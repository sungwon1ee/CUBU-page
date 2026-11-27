import { useEffect, useRef, useState } from "react";
import { mountHero } from "../cubu/heroStage";
import { mountScan } from "../cubu/scanStage";
import { mountDex, type DexModel } from "../cubu/dexStage";
import { kong, nabi } from "../cubu/rig";
import { ITEM_TYPES } from "../cubu/itemTypes";
import camera from "../cubu/objects/camera.json";
import cup from "../cubu/objects/cup.json";
import fan from "../cubu/objects/fan.json";
import fries from "../cubu/objects/fries.json";
import kettle from "../cubu/objects/kettle.json";
import lamp from "../cubu/objects/lamp.json";
import mailbox from "../cubu/objects/mailbox.json";
import motorcycle from "../cubu/objects/motorcycle.json";
import oolong from "../cubu/objects/oolong.json";
import { useDocumentMeta, useText, LangPicker } from "../i18n";
import { HOME, COMMON } from "../strings";
import { AppStoreBadge, StoreBadges } from "./AppStoreBadge";
import { Footer } from "./Footer";
import { Grain } from "./Grain";

export function Home() {
  const t = useText(HOME);
  useDocumentMeta(t.title, t.description);
  return (
    <>
      <Grain />
      <Nav />
      <Hero />
      <main>
        <Scan />
        <Dex />
        <Room />
        <Download />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <nav className={scrolled ? "nav nav--scrolled" : "nav"}>
      <a className="nav__brand" href="/" aria-label={useText(COMMON).home}>
        <img src="/apple-touch-icon.png" alt="" width={36} height={36} />
        <span>CUBU</span>
      </a>
      <div className="nav__end">
        <div className="nav__badge">
          <AppStoreBadge size="small" />
        </div>
        <LangPicker />
      </div>
    </nav>
  );
}

function Hero() {
  const t = useText(HOME);
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountHero(canvas.current!, host.current!), []);
  return (
    <header className="hero" ref={host}>
      <Clouds />
      <canvas className="hero__stage" ref={canvas} aria-hidden="true" />
      <div className="hero__copy">
        <h1 className="wordmark">CUBU</h1>
        <p className="hero__sub">
          <span>{t.hero[0]}</span>
          <span>
            {t.hero[1]}
            <strong>{t.hero[2]}</strong>
            {t.hero[3]}
          </span>
        </p>
        <StoreBadges />
      </div>
    </header>
  );
}

/** 앱 아이콘 하늘에 떠 있는 도트 구름. */
function Clouds() {
  return (
    <div className="clouds" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg key={i} className={`cloud cloud--${i}`} viewBox="0 0 22 8" shapeRendering="crispEdges">
          <rect x="5" y="0" width="8" height="2" />
          <rect x="2" y="2" width="15" height="2" />
          <rect x="0" y="4" width="22" height="2" />
          <rect x="3" y="6" width="14" height="2" opacity="0.55" />
        </svg>
      ))}
    </div>
  );
}

function Scan() {
  const t = useText(HOME);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const stand = useRef<HTMLDivElement>(null);
  const mosaic = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountScan(canvas.current!, host.current!, photo.current!, stand.current!, mosaic.current!, "/olli-cutout.png"), []);
  return (
    <section className="scan" id="scan">
      <h2 className="title">{t.scanTitle}</h2>
      <div className="scan__stage" ref={host}>
        <figure className="snap scan__photo">
          <span className="tape" />
          <div className="scan__frame" ref={photo}>
            <img className="snap__photo" src="/olli.jpg" alt={t.olliAlt} width={923} height={1086} style={{ aspectRatio: "923 / 1086" }} />
            <canvas className="scan__mosaic" ref={mosaic} aria-hidden="true" />
          </div>
        </figure>
        <div className="scan__stand" ref={stand} aria-hidden="true" />
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <ol className="steps">
        {t.steps.map((s, i) => (
          <li key={i}>
            <span className="steps__n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// 도감 카드. 물건들은 실제 사진을 앱의 제작 경로로 돌려 만든 블록이고, 강아지와 고양이는 앱에 처음부터 있는 친구다.
// 카드 위 분류는 앱의 도감 카드와 같다(강아지·고양이·물건). `type`은 수집 노트의 종류 칸으로, 맞는 칸이 없으면 비운다.
// 이름은 strings.ts의 names에 같은 순서로 있다.
const DEX: { kind: "dog" | "cat" | "object"; type?: string; model: DexModel }[] = [
  { kind: "dog", model: { rig: kong() } },
  { kind: "cat", model: { rig: nabi() } },
  { kind: "object", model: { voxels: motorcycle } },
  { kind: "object", model: { voxels: fries } },
  { kind: "object", type: "물병", model: { voxels: oolong } },
  { kind: "object", type: "스탠드", model: { voxels: lamp } },
  { kind: "object", type: "컵", model: { voxels: cup } },
  { kind: "object", model: { voxels: mailbox } },
  { kind: "object", type: "선풍기", model: { voxels: fan } },
  { kind: "object", type: "주전자", model: { voxels: kettle } },
  { kind: "object", type: "카메라", model: { voxels: camera } },
];
const FOUND = new Set(DEX.map((d) => d.type));
const LANG_COLUMN = { ko: 0, en: 1, ja: 2, es: 3 } as const;

function Dex() {
  const t = useText(HOME);
  const col = useText(LANG_COLUMN);
  const host = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const cards = [...host.current!.querySelectorAll("canvas")];
    return mountDex(host.current!, cards, DEX.map((d) => d.model));
  }, []);
  return (
    <section className="dex">
      <h2 className="title">{t.dexTitle}</h2>
      <ul className="dex__cards" ref={host}>
        {DEX.map((d, i) => (
          <li key={i} className="card">
            <span className="tape" />
            <div className="card__photo">
              <canvas aria-hidden="true" />
            </div>
            <p className="card__meta">
              <span>No.{String(i + 1).padStart(3, "0")}</span>
              <span>{t.kinds[d.kind]}</span>
            </p>
            <p className="card__name">{t.names[i]}</p>
          </li>
        ))}
        <li className="card card--empty" aria-hidden="true">
          <div className="card__photo">?</div>
          <p className="card__meta">
            <span>No.{String(DEX.length + 1).padStart(3, "0")}</span>
          </p>
          <p className="card__name">&nbsp;</p>
        </li>
      </ul>
      <h3 className="dex__count">{t.typeCount(ITEM_TYPES.length)}</h3>
      <ul className="types" aria-label={t.typesLabel}>
        {ITEM_TYPES.map((names) => (
          <li key={names[0]} className={FOUND.has(names[0]) ? "types__found" : undefined}>
            {names[col]}
          </li>
        ))}
      </ul>
    </section>
  );
}

// 같은 방을 꾸미기만 바꿔 찍은 것들(앱 화면 그대로). 설명은 strings.ts의 looks에 같은 순서로 있다.
const LOOKS = ["/deco-cabin.webp", "/deco-kitchen.webp", "/deco-night.webp", "/deco-berry.webp", "/deco-tatami.webp", "/deco-beach.webp"];

// 앱 화면을 그대로 찍은 것들. 이름과 설명은 strings.ts의 shots에 같은 순서로 있다.
const SHOTS = [
  { src: "/shot-dex.webp", w: 804, h: 1648 },
  { src: "/shot-card.webp", w: 804, h: 1273 },
  { src: "/shot-types.webp", w: 804, h: 1500 },
];

function Room() {
  const t = useText(HOME);
  return (
    <section className="room">
      <h2 className="title">{t.roomTitle}</h2>
      <figure className="snap snap--wide">
        <span className="tape" />
        <img
          className="snap__photo"
          src="/room.webp"
          alt={t.roomAlt}
          width={1206}
          height={880}
          style={{ aspectRatio: "1206 / 880" }}
        />
      </figure>

      <h2 className="title room__sub">{t.decorTitle}</h2>
      <div className="decor">
        <figure className="snap decor__tray">
          <span className="tape" />
          <img className="snap__photo" src="/shot-decor.webp" alt={t.screenAlt(t.decorTitle)} width={804} height={1607} loading="lazy" style={{ aspectRatio: "804 / 1607" }} />
        </figure>
        <ul className="decor__looks">
          {LOOKS.map((src, i) => (
            <li key={src} className="snap">
              <img className="snap__photo" src={src} alt={t.looks[i]} width={804} height={587} loading="lazy" style={{ aspectRatio: "804 / 587" }} />
            </li>
          ))}
        </ul>
      </div>
      <ul className="decor__choices">
        {t.choices.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <ul className="shots">
        {SHOTS.map((shot, i) => (
          <li key={shot.src}>
            <figure className="snap">
              <span className="tape" />
              <img className="snap__photo" src={shot.src} alt={t.screenAlt(t.shots[i].term)} width={shot.w} height={shot.h} loading="lazy" style={{ aspectRatio: `${shot.w} / ${shot.h}` }} />
            </figure>
            <h3>{t.shots[i].term}</h3>
            <p>{t.shots[i].body}</p>
          </li>
        ))}
        <li>
          <figure className="snap">
            <span className="tape" />
            {/* 앱에서 녹화한 놀러 가기 장면: 하늘을 날아 다른 집에 도착한다 */}
            <video className="snap__photo" src="/visit.mp4" poster="/visit-poster.webp" width={540} height={1030} autoPlay muted loop playsInline style={{ aspectRatio: "540 / 1030" }} />
          </figure>
          <h3>{t.visit.term}</h3>
          <p>{t.visit.body}</p>
        </li>
        <li>
          <figure className="snap">
            <span className="tape" />
            {/* 실제 기기에서 찍은 AR 화면: 길고양이 앞에 그 고양이로 만든 블록 고양이가 놓여 있다 */}
            <img className="snap__photo" src="/shot-ar.webp" alt={t.screenAlt(t.ar.term)} width={1066} height={1896} loading="lazy" style={{ aspectRatio: "1066 / 1896" }} />
          </figure>
          <h3>{t.ar.term}</h3>
          <p>{t.ar.body}</p>
        </li>
      </ul>
    </section>
  );
}

function Download() {
  const t = useText(HOME);
  return (
    <section className="download">
      <img src="/icon-512.png" alt={t.iconAlt} width={112} height={112} />
      <h2 className="title">CUBU</h2>
      <StoreBadges />
    </section>
  );
}
