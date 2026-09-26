const bcrypt = require("bcryptjs");
const db = require("./db");

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

  const existing = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(safeUsername, safeEmail);
  if (existing) {
    throw new Error("이미 사용 중인 아이디 또는 이메일입니다.");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (name, username, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(safeName, safeUsername, safeEmail, passwordHash);

  return {
    id: result.lastInsertRowid,
    name: safeName,
    username: safeUsername,
    email: safeEmail,
    createdAt: new Date().toISOString()
  };
}

function loginUser({ username, password }) {
  const safeUsername = String(username || "").trim();
  validateUsername(safeUsername);
  validatePassword(password);

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(safeUsername);
  if (!user) {
    throw new Error("존재하지 않는 아이디입니다.");
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.created_at
  };
}

module.exports = {
  createUser,
  loginUser
};
