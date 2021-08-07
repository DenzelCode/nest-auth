import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { hostname } from 'os';

@Controller()
export class AppController {
  @Get()
  main(@Req() req: Request) {
    return this.getContainer(req);
  }

  @Get('test')
  test(@Req() req: Request) {
    return this.getContainer(req);
  }

  private getContainer(req: Request) {
    return {
      ip: req.ip,
      forwardedFor: req.headers['x-forwarded-for'],
      realIp: req.headers['x-real-ip'],
      container: hostname(),
    };
  }
}
