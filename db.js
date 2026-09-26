const fs = require("fs");
const path = require("path");
const os = require("os");

function resolveDataDir() {
  const candidates = [
    process.env.DATA_DIR,
    path.join(__dirname, "data"),
    path.join(os.tmpdir(), "kwangju-get-job-data")
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK);
      return candidate;
    } catch (error) {
      // 다음 후보를 시도합니다.
    }
  }

  return path.join(os.tmpdir(), "kwangju-get-job-data");
}

const dataDir = resolveDataDir();
const usersFilePath = path.join(dataDir, "users.json");

fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2), "utf8");
}

function readUsers() {
  try {
    const content = fs.readFileSync(usersFilePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

module.exports = {
  dataDir,
  usersFilePath,
  readUsers,
  writeUsers
};
