import { Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';

@Schema()
export class Notification extends Document {
  
}

export const NotificationSchema = createSchemaForClassWithMethods(Notification);
