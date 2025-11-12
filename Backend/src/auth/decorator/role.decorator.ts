import { SetMetadata } from "@nestjs/common";
export const ROLE_KEY = 'roles';
export const Role = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);