import { createHmac } from "node:crypto";
import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { db } from "@tspec/db";
import { verifyPassword } from "./password.js";

type LoginInput = {
  loginIdentifier?: unknown;
  password?: unknown;
};

const accessTokenTtlSeconds = 15 * 60;

@Injectable()
export class AuthService {
  async login(input: LoginInput) {
    const loginIdentifier = typeof input.loginIdentifier === "string" ? input.loginIdentifier : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (!loginIdentifier || loginIdentifier.length > 320 || !password || password.length > 256) {
      throw new UnauthorizedException("Invalid login credentials");
    }

    const account = await db.userAccount.findUnique({ where: { loginIdentifier } });
    const verified = Boolean(
      account &&
        account.identityProvider === "LOCAL" &&
        account.status === "ACTIVE" &&
        account.passwordHash &&
        (await verifyPassword(password, account.passwordHash)),
    );
    if (!verified || !account) throw new UnauthorizedException("Invalid login credentials");

    return {
      accessToken: this.issueAccessToken(account.id),
      tokenType: "Bearer",
      expiresIn: accessTokenTtlSeconds,
      firstLoginStatus: account.firstLoginStatus,
    };
  }

  private issueAccessToken(accountId: string) {
    const secret = process.env.AUTH_ACCESS_TOKEN_SECRET;
    if (!secret || secret.startsWith("change-me-") || Buffer.byteLength(secret) < 32) {
      throw new InternalServerErrorException("Local authentication is not configured");
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: accountId, iat: issuedAt, exp: issuedAt + accessTokenTtlSeconds })).toString("base64url");
    const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
    return `${header}.${payload}.${signature}`;
  }
}
