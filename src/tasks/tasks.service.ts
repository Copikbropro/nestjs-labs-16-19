import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  // ЛР 16 (Задание 1 и 2): Создание задачи, связанной с конкретным пользователем
  async create(createTaskDto: CreateTaskDto, defaultUserId?: number): Promise<Task> {
    const targetUserId = createTaskDto.userId ?? defaultUserId;

    let user = null;
    if (targetUserId !== undefined && targetUserId !== null) {
      user = await this.usersService.findOne(targetUserId);
    }

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      completed: createTaskDto.completed ?? false,
      userId: user ? user.id : undefined,
      user: user ?? undefined,
    });

    const saved = await this.tasksRepository.save(task);
    return this.findOne(saved.id);
  }

  // ЛР 16 (Задание 1): Получение всех задач
  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  // ЛР 16 (Задание 2): Получение всех задач для конкретного пользователя
  async findByUserId(userId: number): Promise<Task[]> {
    await this.usersService.findOne(userId);
    return this.tasksRepository.find({
      where: { userId },
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  // ЛР 16 (Задание 2): Получение задачи по ID, включая информацию о связанном пользователе
  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`);
    }
    return task;
  }

  // ЛР 16 (Задание 1): Обновление задачи
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.userId !== undefined) {
      const user = await this.usersService.findOne(updateTaskDto.userId);
      task.user = user;
      task.userId = user.id;
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.completed !== undefined) {
      task.completed = updateTaskDto.completed;
    }

    await this.tasksRepository.save(task);
    return this.findOne(id);
  }

  // ЛР 16 (Задание 1): Удаление задачи
  async remove(id: number): Promise<{ deleted: boolean; id: number }> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { deleted: true, id };
  }
}
