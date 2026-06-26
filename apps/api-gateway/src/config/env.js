import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Walk up the directory tree to find the .env file (mimicking python-dotenv find_dotenv)
function findDotEnv(startDir) {
  let currentDir = startDir;
  while (true) {
    const potentialPath = path.join(currentDir, ".env");
    if (fs.existsSync(potentialPath)) {
      return potentialPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return null;
}

const envPath = findDotEnv(__dirname);
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
