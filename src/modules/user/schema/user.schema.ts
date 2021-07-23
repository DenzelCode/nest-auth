import * as bcrypt from 'bcrypt';
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { randomString } from '../../../utils/random-string';
import { createSchemaForClassWithMethods } from '../../../common/mongoose/create-schema';

@Schema()
export class User extends Document {
  @Prop({
    index: {
      unique: true,
      collation: {
        locale: 'en',
        strength: 2,
      },
    },
  })
  username: string;

  @Prop({
    index: {
      unique: true,
      collation: {
        locale: 'en',
        strength: 2,
      },
    },
  })
  email: string;

  @Prop()
  sessionToken: string;

  generateSessionToken() {
    this.sessionToken = randomString(60);
  }

  @Prop()
  password?: string;

  @Prop()
  facebookId?: string;

  @Prop()
  googleId?: string;

  @Prop()
  appleId?: string;

  validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password || '');
  }
}

export const UserSchema = createSchemaForClassWithMethods(User);

// Update password into a hashed one.
UserSchema.pre('save', async function(next) {
  const user: User = this as any;

  if (!user.password || user.password.startsWith('$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt();

    user.password = await bcrypt.hash(user.password, salt);

    next();
  } catch (e) {
    next(e);
  }
});
