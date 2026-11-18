// 사이트 전체에서 쓰는 주소와 이름. 출시·계정이 정해지면 여기만 채운다.
export const site = {
  name: "CUBU",
  maker: "LEE SUNGWON",
  email: "malang.laboratory@gmail.com",
  /** 앱이 쓰는 중계 서버. 웹사이트 방문 수도 여기에 센다 */
  relayUrl: "https://43.202.127.57",
  year: 2026,
  /** App Store 주소. 출시 전에는 비워 둔다 */
  appStoreUrl: "",
  socials: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/malang.lab/" },
    { id: "github", label: "GitHub", url: "https://github.com/sungwon1ee" },
  ],
} as const;

export type SocialId = (typeof site.socials)[number]["id"];
