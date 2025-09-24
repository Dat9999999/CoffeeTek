import {
    ArgumentsHost,
    Catch,
    ConflictException,
    ExceptionFilter,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let errorResponse: HttpException;

        if (exception.code) {
            // Prisma error
            switch (exception.code) {
                case 'P2002':
                    errorResponse = new ConflictException(
                        `Unique constraint failed on field: ${exception.meta?.target}`,
                    );
                    break;

                case 'P2025':
                    errorResponse = new NotFoundException(`Record not found`);
                    break;

                default:
                    errorResponse = new InternalServerErrorException(exception.message);
            }
        } else if (exception instanceof HttpException) {
            // Nếu là HttpException (NotFoundException, BadRequestException...)
            errorResponse = exception;
        } else {
            // fallback
            errorResponse = new InternalServerErrorException(
                exception.message || 'Internal server error',
            );
        }

        const res = errorResponse.getResponse();
        const status = errorResponse.getStatus();

        response.status(status).json(res);
    }
}
