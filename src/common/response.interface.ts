export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: string;
}

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(code: number, message: string, data?: any): ApiResponse {
    return {
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static unauthorized(message: string = 'Token已过期或无效'): ApiResponse {
    return {
      code: 401,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return {
      code: 400,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return {
      code: 404,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static serverError(message: string = '服务器内部错误'): ApiResponse {
    return {
      code: 500,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}