import { ArgumentsHost, ConflictException, ExceptionFilter, InternalServerErrorException } from "@nestjs/common";

export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let errorResponse: any;
        switch (exception.code) {
            case 'P2002':
                errorResponse = new ConflictException(
                    {
                        message: `Unique constraint failed on field: ${exception.meta?.target}`,
                    }
                );
                break;
            default:
                errorResponse = new InternalServerErrorException({
                    message: `${exception.message}`,
                });
        }
        const res = errorResponse.getResponse();
        const status = errorResponse.getStatus();
        response.status(status).json(res)
    }

}