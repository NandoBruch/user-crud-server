import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  private logResponse(timestamp: number, req: Request, res: Response): void {
    try {
      const requestData = `"${req.method} ${req.url} HTTP/${req.httpVersion}"`;
      const responseData = `${res.statusCode} ${Date.now() - timestamp}ms`;

      const logFormat = `${requestData} ${responseData}`;

      const headers = { ...req.headers };
      delete headers.cookie;
      delete headers.authorization;

      this.logger.log(logFormat, {
        requestPath: req.url,
        responseStatusCode: res.statusCode,
        responseTime: Date.now() - timestamp,
        originIp: req.ip,
        userAgent: req.get('user-agent') || '',
        headers,
      });
    } catch (err) {
      this.logger.warn(`Error ${err} while loggin response time.`);
    }
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const now = Date.now();

    response.on('finish', () => {
      this.logResponse(now, request, response);
    });

    next();
  }
}
