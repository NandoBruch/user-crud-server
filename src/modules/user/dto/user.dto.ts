import { Exclude } from 'class-transformer';
import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class UserDTO {
  constructor(partial: Partial<UserDTO>) {
    Object.assign(this, partial);
  }

  id?: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail({ require_tld: false })
  email: string;

  password: string;

  @IsPhoneNumber('BR')
  phone: string;
}

export class UserCreateDTO extends UserDTO {
  @Exclude()
  declare id?: number;
}
