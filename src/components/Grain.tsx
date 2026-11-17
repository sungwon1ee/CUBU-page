import { useEffect, useState } from "react";

/** 앱의 NostalgiaOverlay와 같은 굵은 필름 그레인(3px 칸). 한 장을 만들어 화면 전체에 깐다. */
export function Grain() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const cell = 3, n = 64;
    const c = document.createElement("canvas");
    c.width = c.height = cell * n;
    const ctx = c.getContext("2d")!;
    for (let i = 0; i < (n * n) / 9; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.04)";
      ctx.fillRect(Math.floor(Math.random() * n) * cell, Math.floor(Math.random() * n) * cell, cell, cell);
    }
    setUrl(c.toDataURL());
  }, []);
  return <div className="grain" aria-hidden="true" style={url ? { backgroundImage: `url(${url})` } : undefined} />;
}
