import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInResponseDTO, SignUpRequestDTO } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { EAppConfig, JwtConfig } from 'src/config/configuration-type';

@Injectable()
export class AuthService {
  private HASH_SALT_OR_ROUNDS = 10;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessTokenExpiration() {
    const { accessTokenExpiration } =
      this.configService.get<JwtConfig>(EAppConfig.JWT_CONFIG) ?? {};
    return accessTokenExpiration;
  }

  async signIn(email: string, password: string): Promise<SignInResponseDTO> {
    const user = await this.userService.getUserByEmail(email);
    const accessTokenExpiration = this.getAccessTokenExpiration();

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const jwtSignPayload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(jwtSignPayload);

    return { access_token, expires_in: accessTokenExpiration };
  }

  async signUp(payload: SignUpRequestDTO): Promise<SignInResponseDTO> {
    const { password, ...user } = payload;
    const accessTokenExpiration = this.getAccessTokenExpiration();

    const hashPass = await bcrypt.hash(password, this.HASH_SALT_OR_ROUNDS);

    const newUser = await this.userService.createUser({
      ...user,
      password: hashPass,
    });

    const jwtSignPayload = { sub: newUser.id, email: newUser.email };

    const access_token = await this.jwtService.signAsync(jwtSignPayload);

    return { access_token, expires_in: accessTokenExpiration };
  }
}
