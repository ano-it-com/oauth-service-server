import { HttpException, HttpStatus } from '@nestjs/common';

export class RegisterException extends HttpException {
  protected payload: Record<string, any>;

  constructor(
    error: string,
    error_description?: string,
    httpStatusCode = HttpStatus.BAD_REQUEST,
  ) {
    super({ error, error_description }, httpStatusCode);

    this.payload = { error, error_description };
  }

  static alreadyTaken(param?: string): RegisterException {
    let message = 'Email or username already taken';
    if (param) {
      message = `${param} already taken`;
    }

    return new RegisterException(
      'already_taken',
      message,
      HttpStatus.BAD_REQUEST,
    );
  }

  static unsafePassword(): RegisterException {
    return new RegisterException(
      'unsafe_password',
      'Password so easy. Try new one',
      HttpStatus.BAD_REQUEST,
    );
  }
}
