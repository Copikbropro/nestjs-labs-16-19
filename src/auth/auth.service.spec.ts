import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockRolesService = {
    findOrCreate: jest.fn().mockResolvedValue({ id: 1, name: 'user' }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('должен проверять валидный пароль через bcrypt', async () => {
    const passwordHash = await bcrypt.hash('secret123', 10);
    mockUsersService.findByUsername.mockResolvedValueOnce({
      id: 1,
      username: 'tester',
      email: 'tester@example.com',
      password: passwordHash,
      roles: [{ id: 1, name: 'user' }],
    });

    const user = await service.validateUser('tester', 'secret123');
    expect(user).toBeDefined();
    expect(user.username).toBe('tester');
    expect(user.password).toBeUndefined();
  });

  it('должен возвращать access_token при логине', async () => {
    const result = await service.login({
      id: 1,
      username: 'tester',
      email: 'tester@example.com',
      roles: [{ name: 'user' }],
    });

    expect(result.access_token).toBe('mocked.jwt.token');
    expect(result.token_type).toBe('Bearer');
  });
});
