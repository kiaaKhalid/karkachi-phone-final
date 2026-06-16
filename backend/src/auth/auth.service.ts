import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { CryptoService } from './crypto.service.js';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { User, AuthProvider } from '../entities/index.js';
import { TokenPayload } from './jwt.strategy.js';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(googleClientId);
  }

  getPublicKey() {
    return { publicKey: this.cryptoService.getPublicKey() };
  }

  async validateUser(email: string, encryptedPasswordBase64: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new BadRequestException('Veuillez utiliser votre compte Google pour vous connecter');
    }

    // Décryptage du mot de passe envoyé par le frontend (RSA)
    let decryptedPassword = '';
    try {
      decryptedPassword = this.cryptoService.decrypt(encryptedPasswordBase64);
    } catch {
      throw new BadRequestException('Échec du décryptage du mot de passe');
    }

    // Vérification du hash bcrypt
    const isPasswordValid = await bcrypt.compare(decryptedPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  }

  async login(user: User) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async signup(email: string, name: string, encryptedPasswordBase64: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Décryptage du mot de passe envoyé par le frontend (RSA)
    let decryptedPassword = '';
    try {
      decryptedPassword = this.cryptoService.decrypt(encryptedPasswordBase64);
    } catch {
      throw new BadRequestException('Échec du décryptage du mot de passe');
    }

    // Hashage du mot de passe pour la base de données
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

    const newUser = await this.usersService.create({
      email,
      name,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
    });

    return this.login(newUser);
  }

  async googleLogin(idToken: string) {
    try {
      const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new BadRequestException('Token Google invalide');
      }

      const { email, name, picture } = payload;

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Créer un nouvel utilisateur si n'existe pas
        user = await this.usersService.create({
          email,
          name: name || 'Google User',
          avatar: picture,
          authProvider: AuthProvider.GOOGLE,
          isEmailVerified: true, // Google vérifie les emails
        });
      } else if (user.authProvider !== AuthProvider.GOOGLE) {
        // Optionnel: Mettre à jour le compte existant ou rejeter
        // throw new BadRequestException('Ce compte utilise déjà une authentification classique');
        // Pour plus de flexibilité, on peut juste le loguer
      }

      return this.login(user);
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new UnauthorizedException('Échec de l\'authentification Google');
    }
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { success: true };
  }
}
