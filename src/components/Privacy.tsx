import { site } from "../site";
import { Footer } from "./Footer";
import { Grain } from "./Grain";

// 앱 설정의 '개인정보 처리방침'(중계 서버의 privacy.html)과 같은 내용이다. 한쪽을 고치면 다른 쪽도 고친다.
export function Privacy() {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
  return (
    <>
      <Grain />
      <nav className="nav nav--scrolled nav--plain">
        <a className="nav__brand" href="/">
          <img src="/apple-touch-icon.png" alt="" width={36} height={36} />
          <span>CUBU</span>
        </a>
      </nav>
      <main className="doc">
        <h1 className="title">개인정보 처리방침</h1>
        <p>CUBU는 별도 회원가입 없이 사용합니다. 정보는 스캔 제작, 저장, 구매 처리, 서비스 운영과 선택적 사용 통계에 사용됩니다.</p>
        <p>구매, 스캔 또는 개인정보에 관해 문의하려면 {mail}로 연락해 주세요.</p>

        <h2>사진과 위치</h2>
        <p>
          사진을 찍거나 보관함에서 선택하면 기기에서 대상을 분리합니다. 외부 AI 사진 전송에 동의하면 일반 스캔에서 대상 이미지가 CUBU 중계
          서버를 거쳐 OpenAI로 전달되어 이름과 특징을 읽습니다. 고품질 스캔에서는 대상 이미지와 마스크가 fal에도 전달되어 3D 모델을 만듭니다.
          중계 서버 데이터베이스에 원본 사진이나 전송 이미지가 저장되지 않습니다. 고품질 작업 ID와 처리 상태는 약 2일간 남으며, AI 제공업체의
          처리와 보관에는 <a href="https://platform.openai.com/docs/guides/your-data">OpenAI API의 데이터 처리 정책</a>과{" "}
          <a href="https://fal.ai/privacy">fal의 개인정보 처리방침</a>이 적용됩니다.
        </p>
        <p>
          사진과 도감은 기기에 저장합니다. 위치 권한을 허용하면 촬영 위치 표시와 방의 날씨에 사용하며, 일기예보 조회에 위치를{" "}
          <a href="https://open-meteo.com/">Open-Meteo</a>로 전달합니다. 스캔을 사용하기 위해 위치 권한을 켤 필요는 없습니다.
        </p>

        <h2>구매, 저장, 광고</h2>
        <p>
          Apple이 결제를 처리합니다. 거래 검증과 집계에 거래 ID, 상품, 가격, 통화, 구매 시각 및 무작위 설치 ID를 사용합니다. CUBU는 카드 번호를
          받지 않습니다. Apple iCloud를 사용할 수 있는 경우 지갑과 방 상태가 같은 Apple 계정의 기기 사이에 동기화됩니다. 보상형 광고에는{" "}
          <a href="https://policies.google.com/privacy">Google AdMob</a>을 사용합니다. Google은 광고 제공, 측정, 부정 사용 방지를 위해 IP 주소,
          기기 및 광고 상호작용 정보를 처리할 수 있습니다.
        </p>

        <h2>놀러 가기</h2>
        <p>
          초대 링크를 만들면 방의 모습(집 구조, 꾸밈, 방에 둔 블록과 이름), 집 이름, 그리고 ‘지역 보여 주기’를 켜 두었다면 나라와 도시 이름이
          중계 서버에 올라가고, 코드나 링크를 가진 사람이 볼 수 있습니다. 코드 없이 찾아볼 수 있는 목록은 없습니다. ‘그만 보여 주기’를 누르면
          서버에서 지웁니다. 운영을 위해 날짜별 방문 수, 방문한 집 수와 방문한 설치 ID를 집계하며, 여러 번 신고된 집은 운영자가 확인할 때까지
          숨깁니다.
        </p>

        <h2>사용 통계와 운영 기록</h2>
        <p>
          동의한 경우 튜토리얼 단계, 스캔 시도와 결과, 티켓 잔액이 0이 된 시점, 상점 방문과 구매 결과, 놀러 가기 사용(창 열기, 방문 방식과 실패
          이유, 구경한 시간, 초대 링크 만들기·보내기)을 별도의 무작위 분석 ID로 수집합니다. 통계에 사진, 위치, Apple 계정 정보가 포함되지
          않습니다. 운영상 중계 서버는 요청 제한과 비용 관리를 위해 설치 ID, IP 주소 및 서비스 처리 기록을 사용합니다. 사용량 제한용 읽기 기록과
          작업 기록은 짧은 기간 보관하며, 비용 및 거래 기록은 운영과 정산에 필요한 기간 동안 보관합니다. 사용 통계는 최대 90일 동안 집계에
          사용합니다.
        </p>

        <h2>동의 철회와 삭제 요청</h2>
        <p>
          설정의 ‘지원 및 개인정보’에서 외부 AI 사진 전송과 사용 통계 공유를 끌 수 있습니다. 위치와 사진 접근 권한은 iOS 설정에서 바꿀 수
          있습니다. 이미 전송된 데이터의 삭제 또는 처리에 관한 문의는 {mail}로 보내 주세요.
        </p>
        <p>
          <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">이용약관</a>
        </p>
      </main>
      <Footer />
    </>
  );
}
