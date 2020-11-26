import { HttpException, HttpStatus } from '@nestjs/common';

export default class OpenIdException extends HttpException {
  protected payload: Record<string, any>;

  constructor(
    error: string,
    error_description?: string,
    httpStatusCode = HttpStatus.BAD_REQUEST,
  ) {
    super({ error, error_description }, httpStatusCode);

    this.payload = { error, error_description };
  }

  static accountSuspended(): OpenIdException {
    return new OpenIdException(
      'account_has_been_suspended',
      'User account has been suspended by SSO admin',
      HttpStatus.FORBIDDEN
    );
  }
}
