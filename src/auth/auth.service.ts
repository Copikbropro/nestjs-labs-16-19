import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  // ЛР 17 (Задание 1): Регистрация с хешированием пароля через bcrypt
  async register(registerDto: RegisterDto) {
    const existingByUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingByUsername) {
      throw new ConflictException(
        `Пользователь с именем "${registerDto.username}" уже существует`,
      );
    }

    const existingByEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException(
        `Пользователь с email "${registerDto.email}" уже существует`,
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const roleName = registerDto.role || 'user';
    const assignedRole = await this.rolesService.findOrCreate(roleName);

    const createdUser = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      roles: [assignedRole],
    });

    const { password, ...safeUser } = createdUser as any;
    const tokenData = await this.login(safeUser);

    return {
      message: 'Пользователь успешно зарегистрирован',
      ...tokenData,
    };
  }

  // Проверка учетных данных для LocalStrategy
  async validateUser(username: string, pass: string): Promise<any> {
    let user = await this.usersService.findByUsername(username);
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  // ЛР 17 (Задание 2): Выдача JWT после успешного входа
  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.map((r: any) => r.name) : [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      user,
    };
  }
}
