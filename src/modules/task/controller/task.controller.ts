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
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt-auth.guard';
import { ParseObjectIdPipe } from 'src/common/pipe/parse-object-id.pipe';
import { User } from 'src/modules/user/schema/user.schema';
import { TaskDto } from '../dto/task.dto';
import { TaskService } from '../service/task.service';

@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  getAll(@CurrentUser() user: User) {
    return this.taskService.getAll({
      owner: user._id,
    });
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: TaskDto) {
    return this.taskService.create({
      ...body,
      owner: user._id,
    });
  }

  @Put(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() body: TaskDto,
  ) {
    return this.taskService.update(id, {
      ...body,
      owner: user._id,
    });
  }

  @Delete(':id')
  delete(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    return this.taskService.delete({
      _id: id,
      owner: user._id,
    });
  }
}
