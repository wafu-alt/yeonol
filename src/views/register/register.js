import * as Api from "/api.js";
import { validateEmail } from "/useful-functions.js";

// 요소(element), input 혹은 상수
const fullNameInput = document.querySelector("#fullNameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const passwordConfirmInput = document.querySelector("#passwordConfirmInput");
const submitButton = document.querySelector("#submitButton");
const kakaoRegisterButton = document.querySelector("#kakaoRegisterButton");


addAllElements();
addAllEvents();
initializeKakaoButton();

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
async function addAllElements() {}

// 여러 개의 addEventListener들을 묶어주어서 코드를 깔끔하게 하는 역할임.
function addAllEvents() {
  submitButton.addEventListener("click", handleSubmit);
}

// 회원가입 진행
async function handleSubmit(e) {
  e.preventDefault();

  const fullName = fullNameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // 잘 입력했는지 확인
  const isFullNameValid = fullName.length >= 2;
  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length >= 4;
  const isPasswordSame = password === passwordConfirm;

  if (!isFullNameValid || !isPasswordValid) {
    return alert("이름은 2글자 이상, 비밀번호는 4글자 이상이어야 합니다.");
  }

  if (!isEmailValid) {
    return alert("이메일 형식이 맞지 않습니다.");
  }

  if (!isPasswordSame) {
    return alert("비밀번호가 일치하지 않습니다.");
  }

  // 회원가입 api 요청
  try {
    const data = { fullName, email, password };

    await Api.post("/api/register", data);

    alert(`정상적으로 회원가입되었습니다.`);

    // 로그인 페이지 이동
    window.location.href = "/login";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// 카카오 로그인 api를 회원가입에 사용
// init 관련 문서: https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js
// 팝업 관련 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/js#advanced-guide
function initializeKakaoButton() {
  Kakao.init("2da72af02ec112615d67ee3f96804b55");

  kakaoRegisterButton.addEventListener('click', (e) => {
    e.preventDefault();

    Kakao.Auth.login({
      success: handleKakaoLogin,
      fail: (err) => console.log(err),
    });
  });
}

// "카카오로 시작하기" 버튼 누르고 동의 진행한 사용자의 정보를 가져옴
// 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/js#req-user-info
function handleKakaoLogin() {
  console.log(Kakao.API.request({
    url: '/v2/user/me',
    data: {
      property_keys: ['kakao_account.email', 'kakao_account.profile'],
    },
    success: handleKakaoData,
    // success : alert("성공"),
    fail: (err) => console.log(err),
  }));
  
}

async function handleKakaoData(data) {
  // 사용자 데이터 추출
  const { email, profile } = data.kakao_account;
  const { nickname } = profile;

  // 회원가입 api 요청
  try {
    const data = { nickname, email };

    await Api.post('/api/register/kakao', data);

    alert(`정상적으로 회원가입되었습니다.`);

    // 로그인 페이지 이동
    window.location.href = '/login';
  } catch (err) {
    console.error(err);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}
