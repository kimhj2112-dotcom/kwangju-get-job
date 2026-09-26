const bcrypt = require("bcryptjs");
const { readUsers, writeUsers } = require("./db");

function validateUsername(username) {
  if (!username || username.trim().length < 3) {
    throw new Error("아이디는 3자 이상 입력해주세요.");
  }
}

function validatePassword(password) {
  if (!password || password.length < 4) {
    throw new Error("비밀번호는 4자 이상 입력해주세요.");
  }
}

function ensureAdminUser() {
  const users = readUsers();
  const adminUser = users.find((user) => user.username === "admin");

  if (adminUser) {
    return adminUser;
  }

  const newAdmin = {
    id: Date.now(),
    name: "관리자",
    username: "admin",
    email: "admin@kwangju-job.com",
    passwordHash: bcrypt.hashSync("admin1234", 10),
    role: "admin",
    createdAt: new Date().toISOString()
  };

  users.push(newAdmin);

  try {
    writeUsers(users);
  } catch (error) {
    // 배포 환경에서는 폴더 권한 문제로 저장이 실패할 수 있으므로,
    // 로그인 자체는 계속 동작하도록 안전하게 처리합니다.
  }

  return newAdmin;
}

function getUsers() {
  return readUsers();
}

function deleteUserByUsername(username) {
  const safeUsername = String(username || "").trim();

  if (!safeUsername) {
    throw new Error("삭제할 사용자 아이디가 필요합니다.");
  }

  if (safeUsername === "admin") {
    throw new Error("관리자 계정은 삭제할 수 없습니다.");
  }

  const users = readUsers();
  const index = users.findIndex((user) => user.username === safeUsername);

  if (index === -1) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  users.splice(index, 1);
  writeUsers(users);
  return true;
}

function createUser({ name, username, email, password }) {
  const safeName = String(name || "").trim();
  const safeUsername = String(username || "").trim();
  const safeEmail = String(email || "").trim();

  if (!safeName) {
    throw new Error("이름을 입력해주세요.");
  }

  if (!safeEmail || !safeEmail.includes("@")) {
    throw new Error("올바른 이메일을 입력해주세요.");
  }

  validateUsername(safeUsername);
  validatePassword(password);

  const users = readUsers();
  const exists = users.some(
    (user) => user.username === safeUsername || user.email === safeEmail
  );

  if (exists) {
    throw new Error("이미 사용 중인 아이디 또는 이메일입니다.");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const nextUser = {
    id: Date.now(),
    name: safeName,
    username: safeUsername,
    email: safeEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(nextUser);
  writeUsers(users);

  return {
    id: nextUser.id,
    name: safeName,
    username: safeUsername,
    email: safeEmail,
    createdAt: nextUser.createdAt
  };
}

function loginUser({ username, password }) {
  const users = readUsers();
  const adminCandidate = users.find((entry) => entry.username === "admin");

  if (!adminCandidate) {
    ensureAdminUser();
  }

  const safeUsername = String(username || "").trim();
  validateUsername(safeUsername);
  validatePassword(password);

  const user = readUsers().find((entry) => entry.username === safeUsername);

  if (!user) {
    throw new Error("존재하지 않는 아이디입니다.");
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role || "user",
    createdAt: user.createdAt
  };
}

module.exports = {
  createUser,
  loginUser,
  ensureAdminUser,
  getUsers,
  deleteUserByUsername
};
