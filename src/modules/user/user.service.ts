import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDTO, UserDTO } from './dto/user.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly USER_LIST_CACHE_KEY = 'user:all';
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createUser(userDto: UserCreateDTO): Promise<UserDTO> {
    const user = this.userRepository.create(userDto);
    const savedUser = await this.userRepository.save(user);
    await this.cacheManager.del(this.USER_LIST_CACHE_KEY);
    return savedUser;
  }

  async getUsers(): Promise<UserDTO[]> {
    const userListFromCache = await this.cacheManager.get<UserDTO[]>(
      this.USER_LIST_CACHE_KEY,
    );

    if (userListFromCache) return userListFromCache;

    const users = await this.userRepository.find();
    await this.cacheManager.set(this.USER_LIST_CACHE_KEY, users, 30 * 60);

    return users;
  }

  async getUserById(id: number): Promise<UserDTO> {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    return await this.userRepository.findOneByOrFail({ email });
  }

  async updateUser(id: number, userDto: UserDTO): Promise<UserDTO> {
    await this.userRepository.update(id, userDto);
    await this.cacheManager.del(this.USER_LIST_CACHE_KEY);

    return await this.userRepository.findOneByOrFail({ id });
  }

  async deleteUser(id: number): Promise<void> {
    const { affected } = await this.userRepository.delete(id);
    if (!affected) throw new NotFoundException('User not found');
    await this.cacheManager.del(this.USER_LIST_CACHE_KEY);
  }
}
