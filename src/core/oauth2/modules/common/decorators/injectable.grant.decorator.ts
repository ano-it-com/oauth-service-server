import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { applyDecorators, Injectable, InjectableOptions } from '@nestjs/common';
import { GRANT_TYPE_METADATA } from '@iac-auth/core/oauth2/modules/common';

function Grant(grantType: GrantTypes): ClassDecorator {
  return (target: Record<any, any>) => {
    Reflect.defineMetadata(GRANT_TYPE_METADATA, grantType, target);
  };
}

export const InjectableGrant = (
  grantType: GrantTypes,
  options?: InjectableOptions,
): any => applyDecorators(Injectable(options), Grant(grantType));
