import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { TaskDto } from '../dto/task.dto';
import { TaskService } from '../service/task.service';
import { User } from '../../user/schema/user.schema';
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  getAll(@CurrentUser() user: User) {
    return this.taskService.getAll(user);
  }

  @Post()
  create(@Body() body: TaskDto, @CurrentUser() user: User) {
    return this.taskService.create(body, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: TaskDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.update(id, body, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.delete(id, user);
  }
}
