// 사이트 전체에서 쓰는 주소와 이름. 출시·계정이 정해지면 여기만 채운다.
export const site = {
  name: "CUBU",
  maker: "LEE SUNGWON",
  email: "malang.laboratory@gmail.com",
  year: 2026,
  /** App Store 주소. 출시 전에는 비워 둔다 */
  appStoreUrl: "",
  socials: [{ id: "instagram", label: "Instagram", url: "https://www.instagram.com/malang.lab/" }],
} as const;

export type SocialId = (typeof site.socials)[number]["id"];
