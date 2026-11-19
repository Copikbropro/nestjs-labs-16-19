import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'nestjs-labs-16-19',
      timestamp: new Date().toISOString(),
    };
  }
}
