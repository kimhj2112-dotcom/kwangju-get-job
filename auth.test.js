const test = require("node:test");
const assert = require("node:assert/strict");
const { createUser, loginUser } = require("./auth");

test("회원 생성 및 로그인 성공", () => {
  const username = `tester_${Date.now()}`;
  const email = `tester_${Date.now()}@example.com`;

  const created = createUser({
    name: "테스트유저",
    username,
    email,
    password: "123456"
  });

  assert.equal(created.username, username);

  const loggedIn = loginUser({
    username,
    password: "123456"
  });

  assert.equal(loggedIn.email, email);
});

test("중복 아이디는 거절된다", () => {
  const username = `dup_${Date.now()}`;
  const email = `dup_${Date.now()}@example.com`;

  createUser({
    name: "유저1",
    username,
    email,
    password: "123456"
  });

  assert.throws(() => {
    createUser({
      name: "유저2",
      username,
      email: `another_${Date.now()}@example.com`,
      password: "654321"
    });
  }, /이미 사용 중인 아이디 또는 이메일입니다/);
});
