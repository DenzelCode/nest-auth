import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { hostname } from 'os';

@Controller()
export class AppController {
  @Get()
  main(@Req() req: Request): string {
    return this.getContainer(req);
  }

  @Get('test')
  test(@Req() req: Request): string {
    return this.getContainer(req);
  }

  private getContainer(req: Request) {
    return `${req.ip} - ${hostname()}`;
  }
}
