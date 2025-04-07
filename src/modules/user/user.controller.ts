import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDTO, UserDTO } from './dto/user.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userDto: UserCreateDTO): Promise<UserDTO> {
    return await this.userService.createUser(userDto);
  }

  @Get()
  async findAll(): Promise<UserDTO[]> {
    return await this.userService.getUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDTO> {
    return await this.userService.getUserById(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userDto: UserDTO,
  ): Promise<UserDTO> {
    return await this.userService.updateUser(+id, userDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
