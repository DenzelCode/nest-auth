import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from 'src/common/mongoose/create-schema';
import { ObjectId } from 'src/common/types/object-id';
import { User } from 'src/modules/user/schema/user.schema';

@Schema()
export class Recover extends Document {
  @Prop()
  code: string;

  @Prop({ type: ObjectId, ref: User.name })
  owner: User;

  @Prop()
  expiration: Date;
}

export const RecoverSchema = createSchemaForClassWithMethods(Recover);
