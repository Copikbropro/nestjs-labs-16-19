import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  // Автоматически создаем базовые роли при запуске приложения
  async onModuleInit() {
    await this.findOrCreate('user');
    await this.findOrCreate('administrator');
  }

  async findOrCreate(name: string): Promise<Role> {
    let role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      role = this.rolesRepository.create({ name });
      role = await this.rolesRepository.save(role);
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }
}
