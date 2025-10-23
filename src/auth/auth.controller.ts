import { Controller, Get, UseGuards, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./guards/google-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Inicia o fluxo OAuth
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.validateGoogleUser(req.user);
    const result = await this.authService.login(user);

    // Redirecionar para o frontend com o token
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${result.access_token}`
    );
  }
}
