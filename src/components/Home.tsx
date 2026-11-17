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
import { AppStoreBadge } from "./AppStoreBadge";
import { Footer } from "./Footer";
import { Grain } from "./Grain";

export function Home() {
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
      <a className="nav__brand" href="/">
        <img src="/apple-touch-icon.png" alt="" width={36} height={36} />
        <span>CUBU</span>
      </a>
      <div className="nav__badge">
        <AppStoreBadge size="small" />
      </div>
    </nav>
  );
}

function Hero() {
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
          <span>사람, 동물, 인형, 물건.</span>
          <span>뭐든 찍으면 <strong>블록</strong>이 되어 내 방에 놓을 수 있어요.</span>
        </p>
        <AppStoreBadge size="large" />
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

const STEPS = [
  { title: "찍기", body: "동물, 사람, 인형, 물건. 한 장이면 돼요." },
  { title: "만들기", body: "사진이 칸칸이 블록으로 바뀌어 다시 쌓여요." },
  { title: "놓기", body: "방에 놓아요. 동물은 알아서 돌아다녀요." },
];

function Scan() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const stand = useRef<HTMLDivElement>(null);
  const mosaic = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountScan(canvas.current!, host.current!, photo.current!, stand.current!, mosaic.current!, "/olli-cutout.png"), []);
  return (
    <section className="scan" id="scan">
      <h2 className="title">만드는 법</h2>
      <div className="scan__stage" ref={host}>
        <figure className="snap scan__photo">
          <span className="tape" />
          <div className="scan__frame" ref={photo}>
            <img className="snap__photo" src="/olli.jpg" alt="혀를 내밀고 올려다보는 크림색 강아지" width={923} height={1086} style={{ aspectRatio: "923 / 1086" }} />
            <canvas className="scan__mosaic" ref={mosaic} aria-hidden="true" />
          </div>
        </figure>
        <div className="scan__stand" ref={stand} aria-hidden="true" />
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
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
const DEX: { name: string; kind: string; model: DexModel }[] = [
  { name: "강아지", kind: "강아지", model: { rig: kong() } },
  { name: "고양이", kind: "고양이", model: { rig: nabi() } },
  { name: "오토바이", kind: "물건", model: { voxels: motorcycle } },
  { name: "감자튀김", kind: "과자", model: { voxels: fries } },
  { name: "우롱차 페트병", kind: "물병", model: { voxels: oolong } },
  { name: "스탠드 조명", kind: "스탠드", model: { voxels: lamp } },
  { name: "빨간 컵", kind: "컵", model: { voxels: cup } },
  { name: "우체통", kind: "물건", model: { voxels: mailbox } },
  { name: "선풍기", kind: "선풍기", model: { voxels: fan } },
  { name: "주전자", kind: "주전자", model: { voxels: kettle } },
  { name: "카메라", kind: "카메라", model: { voxels: camera } },
];
const FOUND = new Set(DEX.map((d) => d.kind));

function Dex() {
  const host = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const cards = [...host.current!.querySelectorAll("canvas")];
    return mountDex(host.current!, cards, DEX.map((d) => d.model));
  }, []);
  return (
    <section className="dex">
      <h2 className="title">도감</h2>
      <ul className="dex__cards" ref={host}>
        {DEX.map((d, i) => (
          <li key={d.name} className="card">
            <span className="tape" />
            <div className="card__photo">
              <canvas aria-hidden="true" />
            </div>
            <p className="card__meta">
              <span>No.{String(i + 1).padStart(3, "0")}</span>
              <span>{d.kind}</span>
            </p>
            <p className="card__name">{d.name}</p>
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
      <h3 className="dex__count">물건 종류 {ITEM_TYPES.length}가지</h3>
      <ul className="types" aria-label="물건 종류">
        {ITEM_TYPES.map((t) => (
          <li key={t} className={FOUND.has(t) ? "types__found" : undefined}>
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

// 같은 방을 꾸미기만 바꿔 찍은 것들(앱 화면 그대로)
const LOOKS = [
  { src: "/deco-cabin.webp", alt: "나무 벽과 헤링본 바닥" },
  { src: "/deco-kitchen.webp", alt: "흰 타일 벽과 체크 바닥, 민트 아랫벽" },
  { src: "/deco-night.webp", alt: "별 무늬 벽과 붉은 카펫, 밤하늘" },
  { src: "/deco-berry.webp", alt: "딸기 무늬 벽과 대리석 바닥, 분홍 아랫벽" },
  { src: "/deco-tatami.webp", alt: "크림색 벽과 다다미 바닥, 둥근 창" },
  { src: "/deco-beach.webp", alt: "구름 무늬 벽과 모래 바닥, 파란 줄무늬 커튼" },
];
const CHOICES = ["바닥 24가지", "벽지 22가지", "아랫벽 10가지", "커튼 10색 / 8무늬", "창틀 8가지", "창 3가지", "진열장 6가지"];

// 앱 화면을 그대로 찍은 것들
const SHOTS = [
  { src: "/shot-dex.webp", w: 804, h: 1648, term: "도감", body: "만든 것은 카드로 남아요." },
  { src: "/shot-card.webp", w: 804, h: 1273, term: "카드", body: "돌려 보고, AR로 보고, 영상으로 만들어요." },
  { src: "/shot-types.webp", w: 804, h: 1500, term: "수집 노트", body: "종류별 칸을 하나씩 채워요." },
];

function Room() {
  return (
    <section className="room">
      <h2 className="title">방</h2>
      <figure className="snap snap--wide">
        <span className="tape" />
        <img
          className="snap__photo"
          src="/room.webp"
          alt="두 칸짜리 방. 찻상 위 감자튀김, 진열장의 우롱차, 창가의 오토바이, 볕 드는 바닥에 엎드려 자는 강아지"
          width={1206}
          height={880}
          style={{ aspectRatio: "1206 / 880" }}
        />
      </figure>

      <h2 className="title room__sub">꾸미기</h2>
      <div className="decor">
        <figure className="snap decor__tray">
          <span className="tape" />
          <img className="snap__photo" src="/shot-decor.webp" alt="꾸미기 화면" width={804} height={1607} loading="lazy" style={{ aspectRatio: "804 / 1607" }} />
        </figure>
        <ul className="decor__looks">
          {LOOKS.map((look) => (
            <li key={look.src} className="snap">
              <img className="snap__photo" src={look.src} alt={look.alt} width={804} height={587} loading="lazy" style={{ aspectRatio: "804 / 587" }} />
            </li>
          ))}
        </ul>
      </div>
      <ul className="decor__choices">
        {CHOICES.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <ul className="shots">
        {SHOTS.map((shot) => (
          <li key={shot.term}>
            <figure className="snap">
              <span className="tape" />
              <img className="snap__photo" src={shot.src} alt={`${shot.term} 화면`} width={shot.w} height={shot.h} loading="lazy" style={{ aspectRatio: `${shot.w} / ${shot.h}` }} />
            </figure>
            <h3>{shot.term}</h3>
            <p>{shot.body}</p>
          </li>
        ))}
        <li>
          <figure className="snap">
            <span className="tape" />
            {/* 앱에서 녹화한 놀러 가기 장면: 하늘을 날아 다른 집에 도착한다 */}
            <video className="snap__photo" src="/visit.mp4" poster="/visit-poster.webp" width={540} height={1030} autoPlay muted loop playsInline style={{ aspectRatio: "540 / 1030" }} />
          </figure>
          <h3>놀러 가기</h3>
          <p>코드나 링크를 넣으면 하늘을 날아 다른 사람 집에 도착해요.</p>
        </li>
        <li>
          <figure className="snap">
            <span className="tape" />
            {/* 실제 기기에서 찍은 AR 화면이 들어갈 자리 */}
            <div className="snap__photo snap__photo--empty shots__slot">AR 사진 자리</div>
          </figure>
          <h3>AR</h3>
          <p>바닥을 비추고 탭하면 실제 방에 놓여요. 그대로 녹화도 돼요.</p>
        </li>
      </ul>
    </section>
  );
}

function Download() {
  return (
    <section className="download">
      <img src="/icon-512.png" alt="CUBU 앱 아이콘" width={112} height={112} />
      <h2 className="title">CUBU</h2>
      <AppStoreBadge size="large" />
    </section>
  );
}
