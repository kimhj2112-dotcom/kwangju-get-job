const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
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
  usersFilePath,
  readUsers,
  writeUsers
};
