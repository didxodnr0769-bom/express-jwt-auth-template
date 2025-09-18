const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

// 테스트 결과를 저장할 변수
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

// 테스트 헬퍼 함수
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 테스트: ${testName}`);

  try {
    await testFunction();
    console.log(`✅ 통과: ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ 실패: ${testName}`);
    console.log(`   오류: ${error.message}`);
    testResults.failed++;
  }
}

// 토큰 발급 테스트 함수들
async function testValidLogin() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "test",
      password: "test",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }

  if (!data.success) {
    throw new Error(`로그인 실패: ${data.message}`);
  }

  if (!data.data.accessToken || !data.data.refreshToken) {
    throw new Error("토큰이 발급되지 않았습니다.");
  }

  if (data.data.user.id !== "test" || data.data.user.name !== "Test User") {
    throw new Error("사용자 정보가 올바르지 않습니다.");
  }

  console.log(
    `   - Access Token: ${data.data.accessToken.substring(0, 20)}...`
  );
  console.log(
    `   - Refresh Token: ${data.data.refreshToken.substring(0, 20)}...`
  );
  console.log(`   - 사용자: ${data.data.user.name} (${data.data.user.id})`);
  console.log(`   - 만료시간: ${data.data.expiresIn}`);

  return data.data;
}

async function testInvalidCredentials() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "wrong",
      password: "wrong",
    }),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("잘못된 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("잘못된 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.code !== "INVALID_CREDENTIALS") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testMissingCredentials() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "test",
      // password 누락
    }),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("누락된 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("누락된 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.code !== "MISSING_CREDENTIALS") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testEmptyCredentials() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("빈 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("빈 인증 정보로 로그인이 성공했습니다.");
  }

  if (data.code !== "MISSING_CREDENTIALS") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testTokenVerification(accessToken) {
  const response = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }

  if (!data.success) {
    throw new Error(`토큰 검증 실패: ${data.message}`);
  }

  if (data.data.user.id !== "test" || data.data.user.type !== "access") {
    throw new Error("토큰에서 추출된 사용자 정보가 올바르지 않습니다.");
  }

  console.log(`   - 사용자 ID: ${data.data.user.id}`);
  console.log(`   - 토큰 타입: ${data.data.user.type}`);
  console.log(`   - 만료시간: ${data.data.tokenInfo.expiresIn}`);
}

async function testInvalidToken() {
  const response = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: {
      Authorization: "Bearer invalid-token-12345",
    },
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("유효하지 않은 토큰으로 검증이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("유효하지 않은 토큰으로 검증이 성공했습니다.");
  }

  if (data.code !== "INVALID_TOKEN") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testMissingToken() {
  const response = await fetch(`${BASE_URL}/api/auth/verify`);

  const data = await response.json();

  if (response.ok) {
    throw new Error("토큰 없이 검증이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("토큰 없이 검증이 성공했습니다.");
  }

  if (data.code !== "MISSING_TOKEN") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

// 메인 테스트 실행 함수
async function runTokenTests() {
  console.log("🚀 JWT 토큰 발급 테스트 시작\n");
  console.log("=" * 50);

  let accessToken = null;
  let refreshToken = null;

  // 1. 유효한 로그인 테스트
  await runTest("유효한 로그인", async () => {
    const result = await testValidLogin();
    accessToken = result.accessToken;
    refreshToken = result.refreshToken;

    console.log(accessToken);
    console.log(refreshToken);
  });

  //   // 2. 잘못된 인증 정보 테스트
  //   await runTest("잘못된 인증 정보", testInvalidCredentials);

  //   // 3. 누락된 인증 정보 테스트
  //   await runTest("누락된 인증 정보", testMissingCredentials);

  //   // 4. 빈 인증 정보 테스트
  //   await runTest("빈 인증 정보", testEmptyCredentials);

  //   // 5. 토큰 검증 테스트
  //   if (accessToken) {
  //     await runTest("토큰 검증", () => testTokenVerification(accessToken));
  //   }

  //   // 6. 유효하지 않은 토큰 테스트
  //   await runTest("유효하지 않은 토큰", testInvalidToken);

  //   // 7. 토큰 누락 테스트
  //   await runTest("토큰 누락", testMissingToken);

  // 테스트 결과 출력
  console.log("\n" + "=" * 50);
  console.log("📊 테스트 결과");
  console.log(`✅ 통과: ${testResults.passed}`);
  console.log(`❌ 실패: ${testResults.failed}`);
  console.log(`📈 총계: ${testResults.total}`);
  console.log(
    `🎯 성공률: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );

  if (testResults.failed === 0) {
    console.log("\n🎉 모든 테스트가 통과했습니다!");
  } else {
    console.log("\n⚠️  일부 테스트가 실패했습니다.");
  }

  return { accessToken, refreshToken };
}

// 서버 연결 확인
async function checkServerConnection() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) {
      throw new Error(`서버 연결 실패: HTTP ${response.status}`);
    }
    console.log("✅ 서버 연결 확인됨");
    return true;
  } catch (error) {
    console.log("❌ 서버 연결 실패:", error.message);
    console.log("💡 서버가 실행 중인지 확인하세요: npm start");
    return false;
  }
}

// 테스트 실행
async function main() {
  console.log("🔍 서버 연결 확인 중...");
  const isServerRunning = await checkServerConnection();

  if (!isServerRunning) {
    process.exit(1);
  }

  await runTokenTests();
}

// node-fetch가 없는 경우를 위한 대체 함수
if (typeof fetch === "undefined") {
  console.log("⚠️  node-fetch가 설치되지 않았습니다.");
  console.log("💡 다음 명령어로 설치하세요: npm install node-fetch");
  process.exit(1);
}

main().catch(console.error);
