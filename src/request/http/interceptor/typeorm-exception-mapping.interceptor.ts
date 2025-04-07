/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  EntityNotFoundError,
  QueryFailedError,
  EntityPropertyNotFoundError,
} from 'typeorm';

@Injectable()
export class TypeOrmExceptionMappinInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        let newException;
        if (error instanceof EntityNotFoundError) {
          newException = new NotFoundException(this.formatNotFoundError(error));
        }

        if (error instanceof QueryFailedError) {
          const anyError = error as any;

          if (anyError.errno === 1062 || anyError.code === '23505') {
            newException = new ConflictException('Duplicate entry not allowed');
          }
          newException = new BadRequestException('Bad request');
        }

        if (error instanceof EntityPropertyNotFoundError) {
          newException = new BadRequestException('Invalid entity property');
          return throwError(
            () => new BadRequestException('Invalid entity property'),
          );
        }

        if (newException) {
          this.logger.warn(
            `An orm exception ocurred due to ${error} and was converted to ${newException}`,
          );
          return throwError(() => newException);
        }

        return throwError(() => error);
      }),
    );
  }

  private formatNotFoundError(error: EntityNotFoundError): string {
    const entityMatch = error.message.match(/type "(.*?)"/);
    return entityMatch ? `${entityMatch[1]} not found` : 'Resource not found';
  }
}
