import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const cost = 16_384;
const blockSize = 8;
const parallelization = 1;
const keyLength = 64;

async function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, {
      N: cost,
      r: blockSize,
      p: parallelization,
      maxmem: 32 * 1024 * 1024,
    }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return ["scrypt", cost, blockSize, parallelization, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [scheme, storedCost, storedBlockSize, storedParallelization, encodedSalt, encodedKey, ...extra] = passwordHash.split("$");
  if (
    extra.length ||
    scheme !== "scrypt" ||
    storedCost !== String(cost) ||
    storedBlockSize !== String(blockSize) ||
    storedParallelization !== String(parallelization) ||
    !encodedSalt ||
    !encodedKey
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const storedKey = Buffer.from(encodedKey, "base64url");
    const derivedKey = await deriveKey(password, salt);
    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
  } catch {
    return false;
  }
}
