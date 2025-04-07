/* eslint-disable @typescript-eslint/unbound-method */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@src/modules/user/entities/user.entity';
import { UserService } from '@src/modules/user/user.service';
import {
  EntityNotFoundError,
  Repository,
  TypeORMError,
  UpdateResult,
} from 'typeorm';

const repositoryFn = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOneByOrFail: jest.fn(),
  existsBy: jest.fn(),
};

const cacheManagerFn = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

const CACHE_SEARCH_KEY = 'user:all';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let cacheManager: typeof cacheManagerFn;

  const mockUser: User = {
    id: 1,
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@email.com',
    password: 'hashedpassword',
    phone: '99999999',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryFn,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerFn },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('createUser() should return a new user DTO when successful', async () => {
      jest.spyOn(repository, 'existsBy').mockResolvedValueOnce(false);
      jest.spyOn(repository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

      const result = await service.createUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(cacheManager.del).toHaveBeenCalledWith(CACHE_SEARCH_KEY);
      expect(cacheManager.del).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(mockUser);
      expect(repository.existsBy).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('createUser() should throw when email already exists', async () => {
      const error = new TypeORMError('email already exists');
      jest.spyOn(repository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(service.createUser(mockUser)).rejects.toThrow(error);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('createUser() should throw when user already exists', async () => {
      const error = new ConflictException('User already exists');
      jest.spyOn(repository, 'existsBy').mockResolvedValueOnce(true);

      await expect(service.createUser(mockUser)).rejects.toThrow(error);

      expect(repository.create).toHaveBeenCalledTimes(0);
      expect(repository.save).toHaveBeenCalledTimes(0);
      expect(cacheManager.del).toHaveBeenCalledTimes(0);
    });
  });

  describe('getUsers', () => {
    it('getUsers() should return an array of user DTOs', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockUser]);
      cacheManager.get.mockResolvedValueOnce(undefined);
      const result = await service.getUsers();

      expect(result).toEqual([mockUser]);
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledWith(
        CACHE_SEARCH_KEY,
        [mockUser],
        1800,
      );
      expect(repository.find).toHaveBeenCalled();
    });

    it('getUsers() should return an empty array when no users exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getUsers();

      expect(result).toEqual([]);
    });

    it('getUsers() should return an value from cache', async () => {
      const find = jest.spyOn(repository, 'find');
      cacheManager.get.mockResolvedValueOnce([mockUser]);

      const result = await service.getUsers();

      expect(result).toEqual([mockUser]);
      expect(find).toHaveBeenCalledTimes(0);
    });
  });

  describe('getUserById', () => {
    it('getUserById() should return a user DTO when user exists', async () => {
      jest.spyOn(repository, 'findOneByOrFail').mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({
        id: mockUser.id,
      });
      expect(repository.findOneByOrFail).toHaveBeenCalledTimes(1);
    });

    it('getUserById() should throw when user does not exist', async () => {
      const error = new EntityNotFoundError('not found', 1);
      jest.spyOn(repository, 'findOneByOrFail').mockRejectedValueOnce(error);

      await expect(service.getUserById(1)).rejects.toThrow(error);
    });
  });

  describe('getUserByEmail', () => {
    it('getUserByEmail() should return a user DTO when user exists', async () => {
      jest.spyOn(repository, 'findOneByOrFail').mockResolvedValue(mockUser);

      const result = await service.getUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(repository.findOneByOrFail).toHaveBeenCalledTimes(1);
    });

    it('getUserByEmail() should throw when user does not exist', async () => {
      const error = new EntityNotFoundError('not found', 1);
      jest.spyOn(repository, 'findOneByOrFail').mockRejectedValueOnce(error);

      await expect(
        service.getUserByEmail('nonexistent@example.com'),
      ).rejects.toThrow(error);
    });
  });

  describe('updateUser', () => {
    it('updateUser() should return updated user DTO when successful', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(new UpdateResult());

      jest.spyOn(repository, 'findOneByOrFail').mockResolvedValueOnce(mockUser);

      const result = await service.updateUser(1, mockUser);

      expect(result).toEqual(mockUser);
      expect(repository.update).toHaveBeenCalledWith(1, mockUser);
      expect(cacheManager.del).toHaveBeenCalledTimes(1);
    });

    it('updateUser() should throw when user does not exist', async () => {
      const error = new EntityNotFoundError('not found', 1);
      jest.spyOn(repository, 'update').mockRejectedValueOnce(error);

      await expect(service.updateUser(999, mockUser)).rejects.toThrow(error);
      expect(cacheManager.del).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteUser', () => {
    it('deleteUser() should not throw when user exists', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 1 } as any);

      await expect(service.deleteUser(1)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(cacheManager.del).toHaveBeenCalledTimes(1);
    });

    it('deleteUser() should throw when user does not exist', async () => {
      const error = new NotFoundException('User not found');
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0 } as any);

      await expect(service.deleteUser(9999)).rejects.toThrow(error);
      expect(cacheManager.del).toHaveBeenCalledTimes(0);
    });
  });
});
