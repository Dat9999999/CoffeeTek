import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        // Nếu trong Controller gọi @GetUser('id') -> data = 'id'
        // Lúc này code sẽ trả về request.user['id'] (là số 1)
        if (data) {
            return request.user ? request.user[data] : null;
        }

        // Nếu chỉ gọi @GetUser() -> trả về cả object user
        return request.user;
    },
);