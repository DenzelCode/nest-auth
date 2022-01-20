import { SetMetadata } from '@nestjs/common';

export const AUTH_NOT_REQUIRED = 'auth-not-required';

export const AuthNotRequired = () => SetMetadata(AUTH_NOT_REQUIRED, true);
