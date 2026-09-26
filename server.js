const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  createUser,
  loginUser,
  ensureAdminUser,
  getUsers,
  deleteUserByUsername
} = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

ensureAdminUser();

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "서버 정상 작동 중" });
});

app.post("/api/signup", (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const user = createUser({ name, username, email, password });
    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const user = loginUser({ username, password });
    res.json({
      success: true,
      message: "로그인 성공",
      user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/users", (req, res) => {
  const dataPath = path.join(__dirname, "data", "users.json");

  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const users = JSON.parse(raw).map(({ passwordHash, ...user }) => user);
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: true, users: [] });
  }
});

app.get("/api/admin/users", (req, res) => {
  try {
    const users = getUsers().map(({ passwordHash, ...user }) => user);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: "관리자 목록 조회 실패" });
  }
});

app.delete("/api/admin/users/:username", (req, res) => {
  try {
    deleteUserByUsername(req.params.username);
    res.json({ success: true, message: "회원이 삭제되었습니다." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/api/user/:username", (req, res) => {
  const dataPath = path.join(__dirname, "data", "users.json");
  const username = req.params.username;

  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const users = JSON.parse(raw);
    const user = users.find((entry) => entry.username === username);

    if (!user) {
      return res.status(404).json({ success: false, error: "사용자를 찾을 수 없습니다." });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: "서버 오류" });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "존재하지 않는 API 경로입니다."
  });
});

app.put("/api/user/:username", (req, res) => {
  const dataPath = path.join(__dirname, "data", "users.json");
  const username = req.params.username;
  const { name, email, password } = req.body;

  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const users = JSON.parse(raw);
    const targetIndex = users.findIndex((entry) => entry.username === username);

    if (targetIndex === -1) {
      return res.status(404).json({ success: false, error: "사용자를 찾을 수 없습니다." });
    }

    const user = users[targetIndex];
    const nextName = String(name || user.name).trim();
    const nextEmail = String(email || user.email).trim();

    if (!nextName) {
      return res.status(400).json({ success: false, error: "이름을 입력해주세요." });
    }

    if (!nextEmail || !nextEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "올바른 이메일을 입력해주세요." });
    }

    const passwordHash = password && password.length >= 4
      ? require("bcryptjs").hashSync(password, 10)
      : user.passwordHash;

    users[targetIndex] = {
      ...user,
      name: nextName,
      email: nextEmail,
      passwordHash
    };

    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), "utf8");

    const { passwordHash: removedHash, ...safeUser } = users[targetIndex];
    return res.json({ success: true, message: "회원정보가 수정되었습니다.", user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: "회원정보 수정 중 오류가 발생했습니다." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
