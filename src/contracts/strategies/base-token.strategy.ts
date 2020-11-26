export interface BaseTokenStrategy {
  sign(payload: Record<any, any>): Promise<string>;

  verify<P = any>(encrypted: string): Promise<P>;
}

export const TOKEN_STRATEGY = 'TOKEN_STRATEGY';
