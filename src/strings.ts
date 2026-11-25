import type { Lang } from "./i18n";

// 첫 페이지의 글. 한국어가 원문이고, 앱에 같은 말이 있으면 앱의 번역(Localizable.xcstrings)을 그대로 쓴다.
// 꾸민 말 없이 앱이 하는 일만 적는다.

type Home = {
  title: string;
  description: string;
  hero: [line1: string, before: string, block: string, after: string];
  scanTitle: string;
  olliAlt: string;
  steps: { title: string; body: string }[];
  dexTitle: string;
  kinds: { dog: string; cat: string; object: string };
  /** 도감 카드 이름. 순서는 Home.tsx의 DEX와 같다 */
  names: string[];
  typeCount: (n: number) => string;
  typesLabel: string;
  roomTitle: string;
  roomAlt: string;
  decorTitle: string;
  /** 같은 방을 다르게 꾸민 사진들. 순서는 Home.tsx의 LOOKS와 같다 */
  looks: string[];
  choices: string[];
  screenAlt: (term: string) => string;
  shots: { term: string; body: string }[];
  visit: { term: string; body: string };
  ar: { term: string; body: string };
  iconAlt: string;
};

export const HOME: Record<Lang, Home> = {
  ko: {
    title: "CUBU",
    description: "사람, 동물, 인형, 물건. 뭐든 찍으면 블록이 되어 내 방에 놓을 수 있어요.",
    hero: ["사람, 동물, 인형, 물건.", "뭐든 찍으면 ", "블록", "이 되어 내 방에 놓을 수 있어요."],
    scanTitle: "만드는 법",
    olliAlt: "혀를 내밀고 올려다보는 크림색 강아지",
    steps: [
      { title: "찍기", body: "동물, 사람, 인형, 물건. 한 장이면 돼요." },
      { title: "만들기", body: "사진이 칸칸이 블록으로 바뀌어 다시 쌓여요." },
      { title: "놓기", body: "방에 놓아요. 동물은 알아서 돌아다녀요." },
    ],
    dexTitle: "도감",
    kinds: { dog: "강아지", cat: "고양이", object: "물건" },
    names: ["강아지", "고양이", "오토바이", "감자튀김", "우롱차 페트병", "스탠드 조명", "빨간 컵", "우체통", "선풍기", "주전자", "카메라"],
    typeCount: (n) => `물건 종류 ${n}가지`,
    typesLabel: "물건 종류",
    roomTitle: "방",
    roomAlt: "두 칸짜리 방. 찻상 위 감자튀김, 진열장의 우롱차, 창가의 오토바이, 볕 드는 바닥에 엎드려 자는 강아지",
    decorTitle: "꾸미기",
    looks: [
      "나무 벽과 헤링본 바닥",
      "흰 타일 벽과 체크 바닥, 민트 아랫벽",
      "별 무늬 벽과 붉은 카펫, 밤하늘",
      "딸기 무늬 벽과 대리석 바닥, 분홍 아랫벽",
      "크림색 벽과 다다미 바닥, 둥근 창",
      "구름 무늬 벽과 모래 바닥, 파란 줄무늬 커튼",
    ],
    choices: ["바닥 24가지", "벽지 22가지", "아랫벽 10가지", "커튼 10색 / 8무늬", "창틀 8가지", "창 3가지", "진열장 6가지"],
    screenAlt: (term) => `${term} 화면`,
    shots: [
      { term: "도감", body: "만든 것은 카드로 남아요." },
      { term: "카드", body: "돌려 보고, AR로 보고, 영상으로 만들어요." },
      { term: "수집 노트", body: "종류별 칸을 하나씩 채워요." },
    ],
    visit: { term: "놀러 가기", body: "코드나 링크를 넣으면 하늘을 날아 다른 사람 집에 도착해요." },
    ar: { term: "AR", body: "바닥을 비추고 탭하면 실제 방에 놓여요. 그대로 녹화도 돼요." },
    iconAlt: "CUBU 앱 아이콘",
  },
  en: {
    title: "CUBU",
    description: "People, animals, plushies, things. Take a photo of anything and it becomes blocks you can place in your room.",
    hero: ["People, animals, plushies, things.", "Snap anything and it turns into ", "blocks", " for your room."],
    scanTitle: "How it works",
    olliAlt: "A cream-coloured puppy looking up with its tongue out",
    steps: [
      { title: "Snap", body: "Animals, people, plushies, things. One photo is enough." },
      { title: "Make", body: "The photo turns into blocks, square by square, and stacks back up." },
      { title: "Place", body: "Put it in your room. Animals walk around on their own." },
    ],
    dexTitle: "Album",
    kinds: { dog: "Dog", cat: "Cat", object: "Object" },
    names: ["Dog", "Cat", "Motorcycle", "Fries", "Oolong tea", "Desk lamp", "Red cup", "Mailbox", "Fan", "Kettle", "Camera"],
    typeCount: (n) => `${n} object types`,
    typesLabel: "Object types",
    roomTitle: "Room",
    roomAlt: "A two-part room: fries on the tea table, oolong tea on the shelf, a motorcycle by the window and a dog asleep in a patch of sun",
    decorTitle: "Decorate",
    looks: [
      "Wood walls and a herringbone floor",
      "White tile walls, a checkered floor and mint wainscot",
      "Star wallpaper, a red carpet and the night sky",
      "Strawberry wallpaper, a marble floor and pink wainscot",
      "Cream walls, a tatami floor and a round window",
      "Cloud wallpaper, a sand floor and blue striped curtains",
    ],
    choices: ["24 floors", "22 wallpapers", "10 wainscots", "Curtains: 10 colours / 8 patterns", "8 window frames", "3 windows", "6 shelves"],
    screenAlt: (term) => `${term} screen`,
    shots: [
      { term: "Album", body: "Everything you make is kept as a card." },
      { term: "Card", body: "Turn it around, view it in AR, make a video." },
      { term: "Notebook", body: "Fill in a box for each type, one at a time." },
    ],
    visit: { term: "Visit", body: "Enter a code or a link and you fly across the sky to someone else's house." },
    ar: { term: "AR", body: "Point at the floor and tap to put it in your real room. You can record it too." },
    iconAlt: "CUBU app icon",
  },
  ja: {
    title: "CUBU",
    description: "人、動物、ぬいぐるみ、もの。なんでも撮るとブロックになって、自分の部屋に置けます。",
    hero: ["人、動物、ぬいぐるみ、もの。", "なんでも撮ると", "ブロック", "になって、自分の部屋に置けます。"],
    scanTitle: "作り方",
    olliAlt: "舌を出して見上げるクリーム色の子犬",
    steps: [
      { title: "撮る", body: "動物、人、ぬいぐるみ、もの。1枚でできます。" },
      { title: "作る", body: "写真がマスごとにブロックになって、もう一度積み上がります。" },
      { title: "置く", body: "部屋に置きます。動物は自分で歩き回ります。" },
    ],
    dexTitle: "図鑑",
    kinds: { dog: "犬", cat: "猫", object: "もの" },
    names: ["犬", "猫", "バイク", "フライドポテト", "ウーロン茶", "スタンドライト", "赤いコップ", "ポスト", "扇風機", "やかん", "カメラ"],
    typeCount: (n) => `ものの種類 ${n}`,
    typesLabel: "ものの種類",
    roomTitle: "部屋",
    roomAlt: "2つつながった部屋。ちゃぶ台の上のフライドポテト、棚のウーロン茶、窓辺のバイク、日なたの床で寝ている犬",
    decorTitle: "もようがえ",
    looks: [
      "木の壁とヘリンボーンの床",
      "白いタイルの壁、チェックの床、ミントの腰壁",
      "星柄の壁、赤いカーペット、夜空",
      "いちご柄の壁、大理石の床、ピンクの腰壁",
      "クリーム色の壁、畳の床、丸窓",
      "雲柄の壁、砂の床、青いストライプのカーテン",
    ],
    choices: ["床 24種類", "壁紙 22種類", "腰壁 10種類", "カーテン 10色 / 8柄", "窓枠 8種類", "窓 3種類", "棚 6種類"],
    screenAlt: (term) => `${term}の画面`,
    shots: [
      { term: "図鑑", body: "作ったものはカードになって残ります。" },
      { term: "カード", body: "回して見たり、ARで見たり、動画にしたりできます。" },
      { term: "収集ノート", body: "種類ごとのマスをひとつずつ埋めていきます。" },
    ],
    visit: { term: "遊びに行く", body: "コードかリンクを入れると、空を飛んでほかの人の家に着きます。" },
    ar: { term: "AR", body: "床を映してタップすると、本物の部屋に置けます。そのまま録画もできます。" },
    iconAlt: "CUBUのアプリアイコン",
  },
  es: {
    title: "CUBU",
    description: "Personas, animales, peluches, objetos. Haz una foto de lo que sea y se convierte en bloques que puedes poner en tu habitación.",
    hero: ["Personas, animales, peluches, objetos.", "Haz una foto y se convierte en ", "bloques", " para tu habitación."],
    scanTitle: "Cómo funciona",
    olliAlt: "Un cachorro color crema que mira hacia arriba con la lengua fuera",
    steps: [
      { title: "Hacer foto", body: "Animales, personas, peluches, objetos. Basta con una foto." },
      { title: "Crear", body: "La foto se convierte en bloques, casilla a casilla, y se vuelve a montar." },
      { title: "Colocar", body: "Ponlo en tu habitación. Los animales se pasean solos." },
    ],
    dexTitle: "Álbum",
    kinds: { dog: "Perro", cat: "Gato", object: "Objeto" },
    names: ["Perro", "Gato", "Moto", "Patatas fritas", "Té oolong", "Lámpara", "Taza roja", "Buzón", "Ventilador", "Hervidor", "Cámara"],
    typeCount: (n) => `${n} tipos de objetos`,
    typesLabel: "Tipos de objetos",
    roomTitle: "Habitación",
    roomAlt: "Una habitación de dos partes: patatas fritas en la mesita, té oolong en el estante, una moto junto a la ventana y un perro dormido al sol",
    decorTitle: "Decorar",
    looks: [
      "Paredes de madera y suelo en espiga",
      "Azulejo blanco, suelo de cuadros y zócalo menta",
      "Papel de estrellas, alfombra roja y cielo nocturno",
      "Papel de fresas, suelo de mármol y zócalo rosa",
      "Paredes crema, suelo de tatami y ventana redonda",
      "Papel de nubes, suelo de arena y cortinas de rayas azules",
    ],
    choices: ["24 suelos", "22 papeles", "10 zócalos", "Cortinas: 10 colores / 8 estampados", "8 marcos de ventana", "3 ventanas", "6 estantes"],
    screenAlt: (term) => `Pantalla de ${term}`,
    shots: [
      { term: "Álbum", body: "Todo lo que creas se guarda como una tarjeta." },
      { term: "Tarjeta", body: "Gírala, mírala en RA y conviértela en vídeo." },
      { term: "Cuaderno", body: "Rellena una casilla por cada tipo, una a una." },
    ],
    visit: { term: "Visitar", body: "Escribe un código o abre un enlace y vuelas por el cielo hasta la casa de otra persona." },
    ar: { term: "RA", body: "Apunta al suelo y toca para ponerlo en tu habitación de verdad. También puedes grabarlo." },
    iconAlt: "Icono de la app CUBU",
  },
};

type Common = { madeBy: string; privacy: string; contact: string; badge: string; home: string };

export const COMMON: Record<Lang, Common> = {
  ko: { madeBy: "만든 사람", privacy: "개인정보 처리방침", contact: "문의", badge: "App Store에서 다운로드", home: "처음으로" },
  en: { madeBy: "Made by", privacy: "Privacy policy", contact: "Contact", badge: "Download on the App Store", home: "Home" },
  ja: { madeBy: "制作", privacy: "プライバシーポリシー", contact: "お問い合わせ", badge: "App Storeからダウンロード", home: "ホーム" },
  es: { madeBy: "Hecho por", privacy: "Política de privacidad", contact: "Contacto", badge: "Descargar en el App Store", home: "Inicio" },
};
