import { createParamDecorator, ExecutionContext } from "@nestjs/common";
export const GetUser = createParamDecorator(
    (data: unknown | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);