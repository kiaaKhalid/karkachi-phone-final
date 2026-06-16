import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 1. GET Public Key
   * Le frontend appelle cette API pour récupérer la clé publique RSA.
   * Il l'utilisera pour crypter le mot de passe avant de l'envoyer au login/signup.
   */
  @Get('public-key')
  getPublicKey() {
    return this.authService.getPublicKey();
  }

  /**
   * 2. POST Signup
   * L'inscription classique (Email / Mot de passe crypté).
   */
  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') encryptedPasswordBase64: string,
  ) {
    return this.authService.signup(email, name, encryptedPasswordBase64);
  }

  /**
   * 3. POST Login
   * La connexion classique.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') encryptedPasswordBase64: string,
  ) {
    const user = await this.authService.validateUser(email, encryptedPasswordBase64);
    return this.authService.login(user);
  }

  /**
   * 4. POST Google Auth
   * La connexion via Google OAuth. Reçoit l'idToken généré par le SDK Google front.
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body('idToken') idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  /**
   * 5. POST Refresh Token
   * Utilise le refreshToken pour obtenir un nouvel accessToken.
   * Protégé par la stratégie 'jwt-refresh'.
   */
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: any) {
    // req.user contient l'utilisateur validé par la stratégie 'jwt-refresh'
    return this.authService.login(req.user);
  }

  /**
   * 6. POST Logout
   * Supprime le refreshToken de la BDD.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  /**
   * 7. GET Profil Actuel
   * Route protégée pour vérifier si l'utilisateur est connecté et récupérer ses infos.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: any) {
    return { user: req.user };
  }
}
