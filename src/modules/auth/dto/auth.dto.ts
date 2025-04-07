import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserDTO } from 'src/modules/user/dto/user.dto';

export class SignInResponseDTO {
  access_token: string;
  expires_in?: number;
}

export class SignInRequestDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SignUpRequestDTO extends UserDTO {
  @IsNotEmpty()
  declare password: string;
}

export class SignupResponseDTO extends SignInResponseDTO {}
