import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignInRequestDTO,
  SignInResponseDTO,
  SignUpRequestDTO,
} from './dto/auth.dto';
import { Public } from 'src/request/http/decorator/auth-decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  async signIn(
    @Body() signInDto: SignInRequestDTO,
  ): Promise<SignInResponseDTO> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Post('signup')
  async signUp(
    @Body() signUPDto: SignUpRequestDTO,
  ): Promise<SignInResponseDTO> {
    return this.authService.signUp(signUPDto);
  }
}
