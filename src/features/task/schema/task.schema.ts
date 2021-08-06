import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { ObjectId } from '../../../shared/types/object-id';
import { User } from '../../user/schema/user.schema';

@Schema()
export class Task extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: ObjectId, ref: User.name })
  owner: User;
}

export const TaskSchema = createSchemaForClassWithMethods(Task);
