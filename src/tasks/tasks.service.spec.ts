import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { UsersService } from '../users/users.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockTask: Task = {
    id: 1,
    title: 'Изучить NestJS и Docker',
    description: 'Выполнить лабораторные работы 16-19',
    completed: false,
    userId: 1,
    user: { id: 1, username: 'student', email: 'student@psu.by' } as any,
  };

  const mockTasksRepository = {
    create: jest.fn().mockReturnValue(mockTask),
    save: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue(mockTask),
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue({
      id: 1,
      username: 'student',
      email: 'student@psu.by',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен создавать задачу и связывать с пользователем', async () => {
    const result = await service.create(
      { title: 'Изучить NestJS и Docker', userId: 1 },
      1,
    );
    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    expect(mockTasksRepository.save).toHaveBeenCalled();
    expect(result.title).toEqual('Изучить NestJS и Docker');
  });

  it('должен возвращать список всех задач', async () => {
    const tasks = await service.findAll();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(1);
  });

  it('должен выбрасывать NotFoundException, если задача не найдена', async () => {
    mockTasksRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
