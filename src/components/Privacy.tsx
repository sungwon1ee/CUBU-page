import type { ReactNode } from "react";
import { LangPicker, useDocumentMeta, useLang, type Lang } from "../i18n";
import { site } from "../site";
import { COMMON } from "../strings";
import { Footer } from "./Footer";
import { Grain } from "./Grain";

// 앱 설정의 '개인정보 처리방침'(중계 서버의 privacy.html)과 같은 내용이다. 한쪽을 고치면 다른 쪽도 고친다.
// 한국어가 원문이고 English·日本語·Español은 그 번역이다. 원문을 고치면 세 번역도 함께 고친다.
export function Privacy() {
  const { lang } = useLang();
  const title = COMMON[lang].privacy;
  useDocumentMeta(`CUBU ${title}`);
  return (
    <>
      <Grain />
      <nav className="nav nav--scrolled nav--plain">
        <a className="nav__brand" href="/" aria-label={COMMON[lang].home}>
          <img src="/apple-touch-icon.png" alt="" width={36} height={36} />
          <span>CUBU</span>
        </a>
        <div className="nav__end">
          <LangPicker />
        </div>
      </nav>
      <main className="doc">
        <h1 className="title">{title}</h1>
        {BODY[lang]}
      </main>
      <Footer />
    </>
  );
}

const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
const a = (href: string, text: string) => <a href={href}>{text}</a>;
const OPENAI = "https://platform.openai.com/docs/guides/your-data";
const FAL = "https://fal.ai/privacy";
const METEO = "https://open-meteo.com/";
const ADMOB = "https://policies.google.com/privacy";
const EULA = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

const BODY: Record<Lang, ReactNode> = {
  ko: (
    <>
      <p>CUBU는 별도 회원가입 없이 사용합니다. 정보는 스캔 제작, 저장, 구매 처리, 서비스 운영과 선택적 사용 통계에 사용됩니다.</p>
      <p>구매, 스캔 또는 개인정보에 관해 문의하려면 {mail}로 연락해 주세요.</p>

      <h2>사진과 위치</h2>
      <p>
        사진을 찍거나 보관함에서 선택하면 기기에서 대상을 분리합니다. 외부 AI 사진 전송에 동의하면 일반 스캔에서 대상 이미지가 CUBU 중계 서버를
        거쳐 OpenAI로 전달되어 이름과 특징을 읽습니다. 고품질 스캔에서는 대상 이미지와 마스크가 fal에도 전달되어 3D 모델을 만듭니다. 중계 서버
        데이터베이스에 원본 사진이나 전송 이미지가 저장되지 않습니다. 고품질 작업 ID와 처리 상태는 약 2일간 남으며, AI 제공업체의 처리와 보관에는{" "}
        {a(OPENAI, "OpenAI API의 데이터 처리 정책")}과 {a(FAL, "fal의 개인정보 처리방침")}이 적용됩니다.
      </p>
      <p>
        사진과 도감은 기기에 저장합니다. 위치 권한을 허용하면 촬영 위치 표시와 방의 날씨에 사용하며, 일기예보 조회에 위치를 {a(METEO, "Open-Meteo")}로
        전달합니다. 스캔을 사용하기 위해 위치 권한을 켤 필요는 없습니다.
      </p>

      <h2>얼굴 데이터</h2>
      <p>
        셀카를 찍을 때 CUBU는 전면 카메라를 켜기 위해 ARKit 얼굴 추적(TrueDepth 카메라)을 사용하지만, 얼굴 메시, 표정 값, 깊이 지도처럼 TrueDepth가
        만드는 얼굴 정보는 읽거나 저장하거나 전송하지 않습니다. 앱이 쓰는 것은 화면에 보이는 일반 카메라 사진뿐입니다. 사람이 찍히면 기기 안에서
        Apple Vision으로 얼굴과 눈, 입, 얼굴 윤곽의 위치를 찾아 캐릭터 얼굴의 비율과 색을 정하며, 이 값은 캐릭터 모양으로만 쓰이고 기기에 남습니다.
        외부 AI 사진 전송에 동의한 경우에는 배경을 지운 사진과 얼굴 부분을 확대한 사진이 CUBU 중계 서버를 거쳐 OpenAI로 전달되어 머리 모양, 옷, 안경
        같은 겉모습을 읽습니다. 중계 서버는 이 사진을 저장하지 않고, OpenAI에는 저장 기능을 끈 채로 보내며, OpenAI의 처리에는{" "}
        {a(OPENAI, "OpenAI API의 데이터 처리 정책")}이 적용됩니다. 사람 사진은 고품질 스캔(fal)에 쓰이지 않습니다. 얼굴 데이터는 사람을 식별하거나
        인증하는 데, 광고나 마케팅에 쓰지 않으며, 판매하지 않고 여기 적은 경우 외에는 제3자와 공유하지 않습니다. 촬영 원본은 기기에만 저장되고
        iCloud나 놀러 가기로 올라가지 않으며(방문자에게는 블록 캐릭터만 보입니다), 캐릭터를 삭제하거나 앱을 지우면 함께 지워집니다.
      </p>

      <h2>구매, 저장, 광고</h2>
      <p>
        Apple이 결제를 처리합니다. 거래 검증과 집계에 거래 ID, 상품, 가격, 통화, 구매 시각 및 무작위 설치 ID를 사용합니다. CUBU는 카드 번호를 받지
        않습니다. Apple iCloud를 사용할 수 있는 경우 지갑과 방 상태가 같은 Apple 계정의 기기 사이에 동기화됩니다. 보상형 광고에는{" "}
        {a(ADMOB, "Google AdMob")}을 사용합니다. Google은 광고 제공, 측정, 부정 사용 방지를 위해 IP 주소, 기기 및 광고 상호작용 정보를 처리할 수
        있습니다.
      </p>

      <h2>놀러 가기</h2>
      <p>초대 링크를 만들거나 ‘집 공개하기’를 켜면 방의 모습(집 구조, 꾸밈, 방에 둔 블록과 이름), 집 이름, 그리고 ‘지역 보여 주기’를 켜 두었다면 나라와 도시 이름이 중계 서버에 올라가고, 코드나 링크를 가진 사람이 볼 수 있습니다. 초대 링크를 만들면 ‘집 공개하기’가 함께 켜지고, 그 전에 올려 둔 집도 공개됩니다. 공개된 집은 다른 사용자에게 몇 채씩 무작위로 소개되어 코드 없이도 구경할 수 있고, 집 그림 한 장이 함께 올라갑니다. ‘집 공개하기’는 언제든 끌 수 있습니다. 끈 집은 어떤 목록에도 나오지 않고, 직접 다시 켜기 전에는 켜지지 않습니다. 이 단추가 없는 버전의 앱에서는 앱을 업데이트해 끄거나 ‘그만 보여 주기’로 집을 내릴 수 있습니다. ‘그만 보여 주기’를 누르면 집과 집 그림을 서버에서 지웁니다. 남의 집에 놀러 가면 다녀간 사실과, 그 집의 사람·동물·물건에 준 하트가 무작위 설치 ID와 함께 그 집에 기록됩니다. 방명록에는 직접 쓴 글이 없습니다. 무엇에 하트를 주었는지와, 내 집을 올려 두었다면 내 집 이름과 나라가 서명으로 남아 그 집에 놀러 온 사람 모두에게 보이며, 내 집이 공개되어 있는 동안에는 서명을 눌러 내 집으로 놀러 올 수 있습니다. 집 주인은 방명록의 줄을 지우거나 그 손님의 하트를 더 받지 않도록 막을 수 있고, 집을 내리면 그 집에 남은 하트와 방명록, 손님 기록도 함께 지웁니다. 하트와 방명록은 실제 앱이 보낸 요청인지 Apple의 App Attest로 확인한 뒤에 받습니다. 운영을 위해 날짜별 방문 수, 방문한 집 수와 방문한 설치 ID를 집계하며, 여러 번 신고된 집과 방명록은 운영자가 확인할 때까지 숨깁니다.</p>

      <h2>알림과 선물</h2>
      <p>알림을 허용하면, 운영자가 선물을 보냈을 때와 누가 내 집에 놀러 왔을 때(하루 한 번까지)와 내 집의 무언가에 하트를 남겼을 때(하루 세 번까지) 알리기 위해 기기의 Apple 푸시 알림 토큰과 앱 화면 언어를 설치 ID와 함께 중계 서버에 보관합니다. 이 알림은 Apple의 푸시 알림 서비스(APNs)를 거쳐 전달됩니다. iOS 설정에서 알림을 끄면 표시되지 않으며, 앱을 지우는 등으로 토큰이 무효가 되면 서버에서 지웁니다. 운영자가 보내는 선물(티켓·코인)은 설치 ID로 전달하고, 보낸 내용과 받은 시각을 기록합니다.</p>

      <h2>웹사이트</h2>
      <p>cubu.page는 쿠키를 쓰지 않고 브라우저에 아무것도 저장하지 않습니다. 방문 수를 세기 위해 페이지를 열 때 페이지 주소, 언어, 들어온 사이트 이름을 중계 서버로 보내고, 브라우저 정보로 기기 종류(휴대폰, 컴퓨터, 앱 안 브라우저)를 셉니다. 그날의 방문자 수는 IP 주소와 브라우저 정보를 하루마다 바뀌는 무작위 값과 섞은 해시로 세며, 이 해시는 2일 뒤 지웁니다. IP 주소 자체는 저장하지 않고, 남는 것은 날짜별 방문 수뿐입니다.</p>

      <h2>사용 통계와 운영 기록</h2>
      <p>
        동의한 경우 튜토리얼 단계, 스캔 시도와 결과, 티켓 잔액이 0이 된 시점, 상점 방문과 구매 결과, 놀러 가기 사용(창 열기, 방문 방식과 실패 이유,
        구경한 시간, 초대 링크 만들기·보내기, 하트와 방명록 남기기)을 별도의 무작위 분석 ID로 수집합니다. 통계에 사진, 위치, Apple 계정 정보가 포함되지 않습니다. 운영상
        중계 서버는 요청 제한과 비용 관리를 위해 설치 ID, IP 주소 및 서비스 처리 기록을 사용합니다. 사용량 제한용 읽기 기록과 작업 기록은 짧은 기간
        보관하며, 비용 및 거래 기록은 운영과 정산에 필요한 기간 동안 보관합니다. 사용 통계는 최대 90일 동안 집계에 사용합니다.
      </p>

      <h2>동의 철회와 삭제 요청</h2>
      <p>
        설정의 ‘지원 및 개인정보’에서 외부 AI 사진 전송과 사용 통계 공유를 끌 수 있습니다. 위치와 사진 접근 권한은 iOS 설정에서 바꿀 수 있습니다.
        이미 전송된 데이터의 삭제 또는 처리에 관한 문의는 {mail}로 보내 주세요.
      </p>
      <p>{a(EULA, "이용약관")}</p>
    </>
  ),
  en: (
    <>
      <p>
        This is a translation of the Korean policy. If the two differ, the Korean version applies.
      </p>
      <p>
        CUBU works without creating an account. Information is used to make scans, save your data, process purchases, run the service and, if you
        agree, for usage statistics.
      </p>
      <p>For questions about purchases, scans or your personal information, contact {mail}.</p>

      <h2>Photos and location</h2>
      <p>
        When you take a photo or pick one from your library, the subject is cut out on your device. If you agree to sending photos to an external AI,
        a normal scan sends the subject image through the CUBU relay server to OpenAI, which reads its name and features. A high-quality scan also
        sends the subject image and its mask to fal, which builds a 3D model. Original photos and sent images are not stored in the relay server's
        database. High-quality job IDs and their status are kept for about 2 days. Processing and retention by the AI providers are covered by{" "}
        {a(OPENAI, "OpenAI's API data usage policy")} and {a(FAL, "fal's privacy policy")}.
      </p>
      <p>
        Photos and your album are stored on your device. If you allow location access, it is used to show where a photo was taken and for the weather
        in your room, and your location is sent to {a(METEO, "Open-Meteo")} to look up the forecast. You do not need location access to scan.
      </p>

      <h2>Face data</h2>
      <p>
        When you take a selfie, CUBU turns on the front camera through ARKit face tracking (the TrueDepth camera), but it does not read, store or
        send any face information that TrueDepth produces, such as face meshes, expression values or depth maps. The app uses only the ordinary
        camera picture shown on screen. When a person is in the photo, Apple's Vision framework finds the face and the positions of the eyes, mouth
        and face outline on your device to set the proportions and colors of the character's face; these values are used only for the character's
        shape and stay on your device. If you agree to sending photos to an external AI, the cut-out photo and a close-up of the face are sent through
        the CUBU relay server to OpenAI, which reads the person's look (hairstyle, clothes, glasses and so on). The relay server does not store these
        images, they are sent to OpenAI with storage turned off, and processing by OpenAI is covered by{" "}
        {a(OPENAI, "OpenAI's API data usage policy")}. Photos of people are never used for high-quality scans (fal). Face data is not used to
        identify or authenticate anyone or for advertising or marketing, is not sold, and is not shared with third parties except as described here.
        Original photos are stored only on your device and are never uploaded to iCloud or Visit (visitors see only the block character), and they
        are deleted when you delete the character or the app.
      </p>

      <h2>Purchases, sync and ads</h2>
      <p>
        Apple processes payments. The transaction ID, product, price, currency, purchase time and a random install ID are used to verify and count
        transactions. CUBU never receives card numbers. When Apple iCloud is available, your wallet and room are synced between devices on the same
        Apple Account. Rewarded ads use {a(ADMOB, "Google AdMob")}. Google may process your IP address, device information and ad interactions to
        serve and measure ads and to prevent fraud.
      </p>

      <h2>Visit</h2>
      <p>When you create an invite link or turn on "Make my house public", your room (house layout, decoration, the blocks in it and their names), your house name and, if "Show my region" is on, your country and city are uploaded to the relay server and can be seen by anyone with the code or link. Creating an invite link turns "Make my house public" on as well, and houses uploaded before that are public too. A public house is shown to other users a few at a time, picked at random, so they can visit it without a code, and a picture of the house is uploaded with it. You can turn "Make my house public" off at any time. A house with it off appears in no list, and it stays off until you turn it on yourself. In a version of the app without this switch, update the app to turn it off, or tap "Stop sharing" to take the house down. Tapping "Stop sharing" deletes the house and its picture from the server. When you visit someone's house, the visit and the hearts you give to the people, animals and things there are recorded at that house with your random install ID. The guestbook holds no written text. It keeps which things you gave hearts to and, if you have uploaded your own house, your house name and country as a signature that everyone who visits that house can see; while your house is public, they can tap the signature to visit it. The owner can remove guestbook lines or block a guest from giving more hearts, and taking a house down also deletes its hearts, guestbook and guest records. Hearts and guestbook lines are accepted only after Apple's App Attest confirms that the request came from the real app. To run the service, daily visit counts, the number of houses visited and the install IDs that visited are counted, and houses and guestbook lines reported several times are hidden until the operator reviews them.</p>

      <h2>Notifications and gifts</h2>
      <p>If you allow notifications, CUBU keeps your device's Apple push notification token and the app's display language with the install ID on the relay server, so it can tell you when the operator sends you a gift, when someone visits your house (at most once a day) and when someone leaves a heart on something in your house (at most three times a day). These notifications are delivered through Apple's push notification service (APNs). If you turn notifications off in iOS Settings they are no longer shown, and when the token stops working (for example after the app is deleted) it is removed from the server. Gifts from the operator (tickets and coins) are delivered by install ID, and what was sent and when it was received are recorded.</p>

      <h2>Website</h2>
      <p>cubu.page uses no cookies and stores nothing in your browser. To count visits, opening a page sends the page address, the language and the name of the site you came from to the relay server, and the browser string is used to count the kind of device (phone, computer, in-app browser). Daily visitors are counted with a hash of your IP address and browser string mixed with a random value that changes every day; the hash is deleted after 2 days. The IP address itself is never stored, and only daily visit counts remain.</p>

      <h2>Usage statistics and service records</h2>
      <p>
        If you agree, tutorial steps, scan attempts and results, the moment your ticket balance reaches 0, shop visits and purchase results, and use of
        Visit (opening it, how you visited and why it failed, time spent looking around, creating and sending invite links, leaving hearts and guestbook lines) are collected under a
        separate random analytics ID. Statistics never include photos, location or Apple Account information. To run the service, the relay server
        uses install IDs, IP addresses and processing records for rate limiting and cost control. Read records for rate limits and job records are
        kept for a short time; cost and transaction records are kept as long as needed for operations and accounting. Usage statistics are used in
        aggregates for up to 90 days.
      </p>

      <h2>Withdrawing consent and deletion requests</h2>
      <p>
        In Settings, under "Support &amp; Privacy", you can turn off "Send photos to outside AI" and "Share usage stats". Location and photo
        access can be changed in iOS Settings. For deletion or handling of data that has already been sent, write to {mail}.
      </p>
      <p>{a(EULA, "Terms of use")}</p>
    </>
  ),
  ja: (
    <>
      <p>これは韓国語の方針の翻訳です。内容に違いがある場合は韓国語版が優先されます。</p>
      <p>
        CUBUは会員登録なしで使えます。情報はスキャンの作成、保存、購入の処理、サービスの運営、そして同意した場合の利用統計に使われます。
      </p>
      <p>購入、スキャン、個人情報についてのお問い合わせは {mail} までご連絡ください。</p>

      <h2>写真と位置情報</h2>
      <p>
        写真を撮るかライブラリから選ぶと、端末上で被写体を切り抜きます。外部AIへの写真送信に同意している場合、通常のスキャンでは被写体の画像がCUBU中継サーバーを経由してOpenAIに送られ、名前と特徴を読み取ります。高品質スキャンでは被写体の画像とマスクがfalにも送られ、3Dモデルを作ります。元の写真や送信した画像は中継サーバーのデータベースに保存されません。高品質処理のジョブIDと処理状態は約2日間残ります。AI提供会社での処理と保管には
        {a(OPENAI, "OpenAI APIのデータ利用ポリシー")}と{a(FAL, "falのプライバシーポリシー")}が適用されます。
      </p>
      <p>
        写真と図鑑は端末に保存されます。位置情報を許可すると、撮影場所の表示と部屋の天気に使い、天気予報の取得のために位置を
        {a(METEO, "Open-Meteo")}に送ります。スキャンを使うために位置情報を許可する必要はありません。
      </p>

      <h2>顔のデータ</h2>
      <p>
        セルフィーを撮るとき、CUBUは前面カメラをオンにするためにARKitの顔トラッキング（TrueDepthカメラ）を使いますが、顔のメッシュ、表情の値、深度マップなど、TrueDepthが作る顔の情報を読み取ったり、保存したり、送信したりすることはありません。アプリが使うのは画面に映る通常のカメラ写真だけです。人が写っている場合は、端末上でApple
        Visionが顔と目、口、顔の輪郭の位置を見つけ、キャラクターの顔の比率と色を決めます。この値はキャラクターの形にだけ使われ、端末に残ります。外部AIへの写真送信に同意している場合は、背景を消した写真と顔を拡大した写真がCUBU中継サーバーを経由してOpenAIに送られ、髪型、服、メガネなどの見た目を読み取ります。中継サーバーはこれらの写真を保存せず、OpenAIには保存機能をオフにして送ります。OpenAIでの処理には
        {a(OPENAI, "OpenAI APIのデータ利用ポリシー")}が適用されます。人の写真は高品質スキャン（fal）には使われません。顔のデータを人の識別や認証、広告やマーケティングに使うことはなく、販売せず、ここに書いた場合を除いて第三者と共有しません。元の写真は端末にだけ保存され、iCloudや遊びに行くにアップロードされることはなく（訪問者に見えるのはブロックのキャラクターだけです）、キャラクターを削除するかアプリを削除すると一緒に消えます。
      </p>

      <h2>購入、同期、広告</h2>
      <p>
        決済はAppleが処理します。取引の確認と集計に、取引ID、商品、価格、通貨、購入日時、ランダムなインストールIDを使います。CUBUがカード番号を受け取ることはありません。Apple
        iCloudが使える場合、ウォレットと部屋の状態は同じApple Accountの端末間で同期されます。リワード広告には{a(ADMOB, "Google AdMob")}
        を使います。Googleは広告の配信、測定、不正利用の防止のために、IPアドレス、端末情報、広告とのやり取りを処理することがあります。
      </p>

      <h2>遊びに行く</h2>
      <p>招待リンクを作るか「家を公開する」をオンにすると、部屋の様子（家の間取り、もようがえ、部屋に置いたブロックとその名前）、家の名前、そして「地域を表示」をオンにしている場合は国と都市の名前が中継サーバーにアップロードされ、コードかリンクを持っている人が見られるようになります。招待リンクを作ると「家を公開する」もいっしょにオンになり、それより前にアップロードした家も公開されます。公開された家はほかのユーザーに数軒ずつランダムに紹介されて、コードなしでも遊びに行けるようになり、家の絵が1枚いっしょにアップロードされます。「家を公開する」はいつでもオフにできます。オフにした家はどの一覧にも出ず、自分でオンに戻すまでオフのままです。このスイッチがないバージョンのアプリでは、アプリをアップデートしてオフにするか、「公開をやめる」で家を取り下げられます。「公開をやめる」を押すと家と家の絵をサーバーから削除します。ほかの人の家に遊びに行くと、訪れたことと、その家の人・動物・ものにあげたハートが、ランダムなインストールIDとともにその家に記録されます。ゲストブックに自分で書く文章はありません。どれにハートをあげたかと、自分の家をアップロードしている場合は家の名前と国が署名として残り、その家を訪れた人みんなに表示されます。自分の家を公開している間は、署名をタップして自分の家に遊びに来られます。家の持ち主はゲストブックの行を消したり、そのゲストからのハートをこれ以上受け取らないようにしたりできます。家を取り下げると、その家に残ったハート、ゲストブック、ゲストの記録もいっしょに削除します。ハートとゲストブックは、実際のアプリからのリクエストかどうかをAppleのApp Attestで確認してから受け付けます。運営のために日ごとの訪問数、訪問された家の数、訪問したインストールIDを集計し、何度も通報された家とゲストブックは運営者が確認するまで非表示にします。</p>

      <h2>通知とプレゼント</h2>
      <p>通知を許可すると、運営からプレゼントが届いたとき、だれかが家に遊びに来たとき（1日1回まで）、家のなにかにハートが残されたとき（1日3回まで）にお知らせするために、端末のAppleプッシュ通知トークンとアプリの表示言語をインストールIDとともに中継サーバーに保管します。この通知はAppleのプッシュ通知サービス(APNs)を通じて届きます。iOSの設定で通知をオフにすると表示されなくなり、アプリの削除などでトークンが無効になるとサーバーから削除します。運営からのプレゼント(チケット・コイン)はインストールIDあてに届け、送った内容と受け取った時刻を記録します。</p>

      <h2>ウェブサイト</h2>
      <p>cubu.pageはクッキーを使わず、ブラウザに何も保存しません。訪問数を数えるため、ページを開くとページのアドレス、言語、どのサイトから来たかを中継サーバーに送り、ブラウザ情報から端末の種類（スマートフォン、パソコン、アプリ内ブラウザ）を数えます。その日の訪問者数は、IPアドレスとブラウザ情報を毎日変わるランダムな値と混ぜたハッシュで数え、このハッシュは2日後に削除します。IPアドレスそのものは保存せず、残るのは日ごとの訪問数だけです。</p>

      <h2>利用統計と運営記録</h2>
      <p>
        同意した場合、チュートリアルの段階、スキャンの試行と結果、チケット残高が0になった時点、ショップの訪問と購入結果、遊びに行くの利用（画面を開く、訪問の方法と失敗の理由、見て回った時間、招待リンクの作成・送信、ハートとゲストブックを残すこと）を、別のランダムな分析IDで収集します。統計に写真、位置情報、Apple
        Accountの情報は含まれません。運営上、中継サーバーはリクエスト制限と費用管理のためにインストールID、IPアドレス、処理記録を使います。利用制限のための読み取り記録とジョブ記録は短期間保管し、費用と取引の記録は運営と精算に必要な期間保管します。利用統計は最大90日間集計に使います。
      </p>

      <h2>同意の撤回と削除の依頼</h2>
      <p>
        設定の「サポートとプライバシー」で、「外部AIへの写真送信」と「利用統計の共有」をオフにできます。位置情報と写真へのアクセスはiOSの設定で変更できます。すでに送信されたデータの削除や取り扱いについては
        {mail} までお問い合わせください。
      </p>
      <p>{a(EULA, "利用規約")}</p>
    </>
  ),
  es: (
    <>
      <p>Esta es una traducción de la política en coreano. Si hay diferencias, prevalece la versión en coreano.</p>
      <p>
        CUBU se usa sin crear una cuenta. La información se usa para crear escaneos, guardar tus datos, procesar compras, operar el servicio y, si lo
        aceptas, para estadísticas de uso.
      </p>
      <p>Para preguntas sobre compras, escaneos o tus datos personales, escribe a {mail}.</p>

      <h2>Fotos y ubicación</h2>
      <p>
        Cuando haces una foto o eliges una de tu fototeca, el sujeto se recorta en tu dispositivo. Si aceptas enviar fotos a una IA externa, en un
        escaneo normal la imagen del sujeto pasa por el servidor intermediario de CUBU hasta OpenAI, que lee su nombre y sus rasgos. En un escaneo de
        alta calidad, la imagen del sujeto y su máscara también se envían a fal, que crea un modelo 3D. Las fotos originales y las imágenes enviadas no
        se guardan en la base de datos del servidor intermediario. Los ID de los trabajos de alta calidad y su estado se conservan unos 2 días. El
        tratamiento y la conservación por parte de los proveedores de IA se rigen por {a(OPENAI, "la política de datos de la API de OpenAI")} y{" "}
        {a(FAL, "la política de privacidad de fal")}.
      </p>
      <p>
        Las fotos y el álbum se guardan en tu dispositivo. Si permites el acceso a la ubicación, se usa para mostrar dónde se hizo la foto y para el
        tiempo de tu habitación, y la ubicación se envía a {a(METEO, "Open-Meteo")} para consultar el pronóstico. No necesitas activar la ubicación para
        escanear.
      </p>

      <h2>Datos faciales</h2>
      <p>
        Al hacer un selfi, CUBU activa la cámara frontal mediante el seguimiento facial de ARKit (la cámara TrueDepth), pero no lee, guarda ni envía
        ninguna información facial que genere TrueDepth, como mallas faciales, valores de expresión o mapas de profundidad. La app solo usa la foto
        normal de la cámara que se ve en pantalla. Si en la foto aparece una persona, el framework Vision de Apple localiza en tu dispositivo la cara y
        la posición de los ojos, la boca y el contorno de la cara para fijar las proporciones y los colores de la cara del personaje; esos valores solo
        se usan para la forma del personaje y se quedan en tu dispositivo. Si aceptas enviar fotos a una IA externa, la foto recortada y un primer plano
        de la cara pasan por el servidor intermediario de CUBU hasta OpenAI, que lee el aspecto de la persona (peinado, ropa, gafas, etc.). El
        servidor intermediario no guarda estas imágenes, se envían a OpenAI con el almacenamiento desactivado, y su tratamiento por OpenAI se rige por{" "}
        {a(OPENAI, "la política de datos de la API de OpenAI")}. Las fotos de personas nunca se usan en escaneos de alta calidad (fal). Los datos
        faciales no se usan para identificar ni autenticar a nadie ni para publicidad o marketing, no se venden y no se comparten con terceros salvo
        como se describe aquí. Las fotos originales se guardan solo en tu dispositivo, nunca se suben a iCloud ni a Visitar (los visitantes solo ven el
        personaje de bloques) y se borran al eliminar el personaje o la app.
      </p>

      <h2>Compras, sincronización y anuncios</h2>
      <p>
        Apple procesa los pagos. Para verificar y contabilizar las transacciones se usan el ID de transacción, el producto, el precio, la moneda, la
        hora de compra y un ID de instalación aleatorio. CUBU nunca recibe números de tarjeta. Si Apple iCloud está disponible, tu monedero y tu
        habitación se sincronizan entre los dispositivos de la misma cuenta de Apple. Los anuncios con recompensa usan {a(ADMOB, "Google AdMob")}.
        Google puede tratar tu dirección IP, información del dispositivo y tus interacciones con anuncios para mostrarlos, medirlos y evitar fraudes.
      </p>

      <h2>Visitar</h2>
      <p>Al crear un enlace de invitación o activar «Hacer pública mi casa», tu habitación (la distribución de la casa, la decoración, los bloques que hay en ella y sus nombres), el nombre de tu casa y, si tienes activado «Mostrar mi región», tu país y ciudad se suben al servidor intermediario y cualquiera con el código o el enlace puede verlos. Al crear un enlace de invitación también se activa «Hacer pública mi casa», y las casas subidas antes también son públicas. Una casa pública se muestra a otros usuarios de unas pocas en unas pocas, elegidas al azar, para que puedan visitarla sin código, y con ella se sube una imagen de la casa. Puedes desactivar «Hacer pública mi casa» cuando quieras. Una casa con la opción desactivada no aparece en ninguna lista y sigue así hasta que la actives tú. En una versión de la app sin esta opción, actualiza la app para desactivarla o toca «Dejar de compartir» para retirar la casa. Al tocar «Dejar de compartir» se borran del servidor la casa y su imagen. Cuando visitas la casa de otra persona, la visita y los corazones que das a las personas, animales y cosas de esa casa quedan registrados en ella junto con tu ID de instalación aleatorio. El libro de visitas no contiene texto escrito. Guarda a qué cosas diste un corazón y, si has subido tu propia casa, el nombre y el país de tu casa como firma, que ve todo el que visita esa casa; mientras tu casa es pública, pueden tocar la firma para visitarla. El dueño puede borrar líneas del libro de visitas o bloquear a un visitante para no recibir más corazones suyos, y al retirar una casa se borran también sus corazones, su libro de visitas y sus registros de visitantes. Los corazones y el libro de visitas solo se aceptan después de comprobar con App Attest de Apple que la petición viene de la app real. Para operar el servicio se cuentan las visitas diarias, el número de casas visitadas y los ID de instalación que visitaron, y las casas y líneas del libro de visitas denunciadas varias veces se ocultan hasta que las revise el operador.</p>

      <h2>Notificaciones y regalos</h2>
      <p>Si permites las notificaciones, CUBU guarda en el servidor intermediario el token de notificaciones push de Apple de tu dispositivo y el idioma de la app junto con el ID de instalación, para avisarte cuando el operador te envía un regalo, cuando alguien visita tu casa (como mucho una vez al día) y cuando alguien deja un corazón en algo de tu casa (como mucho tres veces al día). Estas notificaciones se entregan a través del servicio de notificaciones push de Apple (APNs). Si desactivas las notificaciones en Ajustes de iOS dejan de mostrarse, y cuando el token deja de funcionar (por ejemplo, al borrar la app) se elimina del servidor. Los regalos del operador (tickets y monedas) se entregan por ID de instalación, y se registra qué se envió y cuándo se recibió.</p>

      <h2>Sitio web</h2>
      <p>cubu.page no usa cookies ni guarda nada en tu navegador. Para contar las visitas, al abrir una página se envían al servidor intermediario la dirección de la página, el idioma y el nombre del sitio desde el que llegaste, y con los datos del navegador se cuenta el tipo de dispositivo (móvil, ordenador, navegador dentro de una app). Los visitantes de cada día se cuentan con un hash de tu dirección IP y los datos del navegador mezclados con un valor aleatorio que cambia cada día; ese hash se borra a los 2 días. La dirección IP no se guarda nunca y solo quedan los recuentos diarios de visitas.</p>

      <h2>Estadísticas de uso y registros del servicio</h2>
      <p>
        Si lo aceptas, se recogen con un ID de análisis aleatorio aparte los pasos del tutorial, los intentos y resultados de escaneo, el momento en
        que tu saldo de tickets llega a 0, las visitas a la tienda y los resultados de compra, y el uso de Visitar (abrirlo, cómo visitaste y por qué
        falló, el tiempo que pasaste mirando, crear y enviar enlaces de invitación, dejar corazones y líneas en el libro de visitas). Las estadísticas nunca incluyen fotos, ubicación ni datos de tu
        cuenta de Apple. Para operar el servicio, el servidor intermediario usa ID de instalación, direcciones IP y registros de procesamiento para
        limitar peticiones y controlar costes. Los registros de lectura para los límites de uso y los registros de trabajos se guardan poco tiempo; los
        registros de costes y transacciones se guardan el tiempo necesario para la operación y la contabilidad. Las estadísticas de uso se agregan
        durante un máximo de 90 días.
      </p>

      <h2>Retirar el consentimiento y pedir el borrado</h2>
      <p>
        En Ajustes, en «Ayuda y privacidad», puedes desactivar «Enviar fotos a IA externa» y «Compartir estadísticas». El acceso a la
        ubicación y a las fotos se cambia en los Ajustes de iOS. Para borrar o consultar el tratamiento de datos ya enviados, escribe a {mail}.
      </p>
      <p>{a(EULA, "Términos de uso")}</p>
    </>
  ),
};
