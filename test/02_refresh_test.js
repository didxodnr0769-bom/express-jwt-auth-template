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

// 로그인하여 토큰을 가져오는 헬퍼 함수
async function getTokens() {
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

  if (!response.ok || !data.success) {
    throw new Error("로그인 실패");
  }

  return {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  };
}

// 토큰 재발급 테스트 함수들
async function testValidRefresh() {
  const { refreshToken } = await getTokens();

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }

  if (!data.success) {
    throw new Error(`토큰 갱신 실패: ${data.message}`);
  }

  if (!data.data.accessToken) {
    throw new Error("새로운 액세스 토큰이 발급되지 않았습니다.");
  }

  if (data.data.accessToken === refreshToken) {
    throw new Error("갱신된 토큰이 리프레시 토큰과 같습니다.");
  }

  console.log(
    `   - 새로운 Access Token: ${data.data.accessToken.substring(0, 20)}...`
  );
  console.log(`   - 만료시간: ${data.data.expiresIn}`);

  return data.data.accessToken;
}

async function testRefreshWithNewToken(newAccessToken) {
  const response = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: {
      Authorization: `Bearer ${newAccessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }

  if (!data.success) {
    throw new Error(`새로운 토큰 검증 실패: ${data.message}`);
  }

  if (data.data.user.id !== "test" || data.data.user.type !== "access") {
    throw new Error("새로운 토큰에서 추출된 사용자 정보가 올바르지 않습니다.");
  }

  console.log(`   - 사용자 ID: ${data.data.user.id}`);
  console.log(`   - 토큰 타입: ${data.data.user.type}`);
  console.log(`   - 토큰 검증 성공`);
}

async function testMissingRefreshToken() {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("리프레시 토큰 없이 갱신이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("리프레시 토큰 없이 갱신이 성공했습니다.");
  }

  if (data.code !== "MISSING_REFRESH_TOKEN") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testInvalidRefreshToken() {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: "invalid-refresh-token-12345",
    }),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("유효하지 않은 리프레시 토큰으로 갱신이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("유효하지 않은 리프레시 토큰으로 갱신이 성공했습니다.");
  }

  if (data.code !== "INVALID_REFRESH_TOKEN") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testAccessTokenAsRefreshToken() {
  const { accessToken } = await getTokens();

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: accessToken,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("액세스 토큰으로 리프레시가 성공했습니다.");
  }

  if (data.success) {
    throw new Error("액세스 토큰으로 리프레시가 성공했습니다.");
  }

  if (data.code !== "INVALID_TOKEN_TYPE") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testEmptyRefreshToken() {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: "",
    }),
  });

  const data = await response.json();

  if (response.ok) {
    throw new Error("빈 리프레시 토큰으로 갱신이 성공했습니다.");
  }

  if (data.success) {
    throw new Error("빈 리프레시 토큰으로 갱신이 성공했습니다.");
  }

  if (data.code !== "MISSING_REFRESH_TOKEN") {
    throw new Error(`예상된 에러 코드가 아닙니다: ${data.code}`);
  }

  console.log(`   - 에러 코드: ${data.code}`);
  console.log(`   - 에러 메시지: ${data.message}`);
}

async function testMultipleRefresh() {
  // 각 리프레시마다 새로운 로그인을 통해 새로운 refresh token을 가져옴
  for (let i = 1; i <= 3; i++) {
    const { refreshToken } = await getTokens();

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(`${i}번째 리프레시 실패: ${data.message}`);
    }

    console.log(`   - ${i}번째 리프레시 성공`);
  }

  console.log(`   - 연속 리프레시 테스트 완료`);
}

// 메인 테스트 실행 함수
async function runRefreshTests() {
  console.log("🚀 JWT 토큰 재발급 테스트 시작\n");
  console.log("=" * 50);

  let newAccessToken = null;

  // 1. 유효한 리프레시 테스트
  await runTest("유효한 토큰 갱신", async () => {
    newAccessToken = await testValidRefresh();
  });

  // 2. 새로운 토큰으로 검증 테스트
  if (newAccessToken) {
    await runTest("새로운 토큰 검증", () =>
      testRefreshWithNewToken(newAccessToken)
    );
  }

  // 3. 리프레시 토큰 누락 테스트
  await runTest("리프레시 토큰 누락", testMissingRefreshToken);

  // 4. 유효하지 않은 리프레시 토큰 테스트
  await runTest("유효하지 않은 리프레시 토큰", testInvalidRefreshToken);

  // 5. 액세스 토큰을 리프레시 토큰으로 사용 테스트
  await runTest(
    "액세스 토큰을 리프레시 토큰으로 사용",
    testAccessTokenAsRefreshToken
  );

  // 6. 빈 리프레시 토큰 테스트
  await runTest("빈 리프레시 토큰", testEmptyRefreshToken);

  // 7. 연속 리프레시 테스트
  await runTest("연속 리프레시", testMultipleRefresh);

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

  await runRefreshTests();
}

// node-fetch가 없는 경우를 위한 대체 함수
if (typeof fetch === "undefined") {
  console.log("⚠️  node-fetch가 설치되지 않았습니다.");
  console.log("💡 다음 명령어로 설치하세요: npm install node-fetch");
  process.exit(1);
}

main().catch(console.error);
