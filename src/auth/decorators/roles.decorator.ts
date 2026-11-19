import { SetMetadata } from '@nestjs/common';

// ЛР 17 (Задание 3): Кастомный декоратор @Roles с использованием @SetMetadata()
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
