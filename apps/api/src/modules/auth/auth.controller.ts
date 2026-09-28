import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() input: Record<string, unknown>) {
    return this.authService.login(input);
  }
}
