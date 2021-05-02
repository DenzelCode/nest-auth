import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  main(): string {
    return 'NestJS Passport JWT Authentication';
  }
}
