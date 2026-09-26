const express = require("express");
const path = require("path");
const { createUser, loginUser } = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
