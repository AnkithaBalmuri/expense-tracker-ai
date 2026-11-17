import fs from "fs";

const envPath = new URL("../.env.local", import.meta.url);
const envRaw = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, "utf8")
  : "";

const found = envRaw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .find((l) => l && !l.startsWith("#") && l.startsWith("MONGODB_URI="));

const fileValue = found ? found.split("=", 2)[1] : undefined;

console.log("process.env.MONGODB_URI:", process.env.MONGODB_URI ? "set" : "not set");
console.log(".env.local MONGODB_URI:", fileValue ? "present in file" : "missing in file");

