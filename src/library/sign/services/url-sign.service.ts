import { Inject, Injectable } from '@nestjs/common';
import signed, { Signature, VerifyResult } from 'signed';
import { SignModuleOptions } from '@iac-auth/library/sign/interfaces';
import { Request } from 'express';

export const SIGN_MODULE_METADATA = '__SIGN_MODULE_METADATA__';

@Injectable()
export class UrlSignService {
  private signed: Signature;

  constructor(
    @Inject(SIGN_MODULE_METADATA)
    private readonly options: SignModuleOptions,
  ) {
    this.signed = signed(options);
  }

  /**
   *
   * @param url
   */
  sign(url: string): string {
    return this.signed.sign(url);
  }

  /**
   *
   * @param request
   */
  verifyRequest(request: Request): VerifyResult {
    return this.signed.verifyUrl(request, req => req.connection.remoteAddress);
  }
}
