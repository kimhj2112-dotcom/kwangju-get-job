const fs = require("fs");
const path = require("path");
const os = require("os");

function resolveDataDir() {
  const projectDataDir = path.join(__dirname, "data");
  const explicitDataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : null;
  const candidates = [explicitDataDir, projectDataDir];

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

  return projectDataDir;
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
