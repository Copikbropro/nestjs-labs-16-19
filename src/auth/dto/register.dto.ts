import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя пользователя обязательно' })
  username: string;

  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsString()
  @MinLength(4, { message: 'Пароль должен содержать минимум 4 символа' })
  password: string;

  // Опциональная роль ('user' или 'administrator') для удобного тестирования RBAC
  @IsString()
  @IsOptional()
  role?: string;
}
