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
import { ParseObjectIdPipe } from '../../../common/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

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
