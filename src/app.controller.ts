import { Controller, Get } from '@nestjs/common';
import { hostname } from 'os';

@Controller()
export class AppController {
  @Get()
  main(): string {
    return `NestJS Passport JWT Authentication ${hostname()}`;
  }

  @Get('test')
  test(): string {
    return hostname();
  }
}
