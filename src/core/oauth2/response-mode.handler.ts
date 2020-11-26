import { Response } from 'express';
import * as qs from 'querystring';
import { ResponseModes } from '@iac-auth/core/oauth2/const';
import { AuthenticationRequest } from '@iac-auth/core/oauth2/authentication.request';

export const handleResponseMode = (
  res: Response,
  responseModes: ResponseModes,
  returnTo: string,
  params: Record<string, any>,
) => {
  switch (responseModes) {
    case ResponseModes.query:
      return res.status(302).redirect(this.makeRedirectUri(returnTo, params));
    case ResponseModes.fragment:
      return res
        .status(302)
        .redirect(this.makeRedirectUri(returnTo, undefined, params));
    case ResponseModes.form_post:
      return res.render('form_post', {
        returnTo,
        hiddenFields: params,
        layout: false,
      });
  }
};

export const makeRedirectUri = (
  uri: string,
  params?: Record<string, any>,
  hash?: Record<string, any>,
): string => {
  const url = new URL(uri);
  if (params) {
    url.search = qs.stringify(params);
  }
  if (hash) {
    url.hash = qs.stringify(hash);
  }

  return url.toString();
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAuthRequestFromSession = (
  session: any,
): AuthenticationRequest => {
  const authRequest = session.authRequest as AuthenticationRequest;
  if (!authRequest) {
    throw new Error('Authorization request was not present in the session.');
  }
  delete session.authRequest;
  return authRequest;
};
