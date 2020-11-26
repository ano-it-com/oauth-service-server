import { SignatureOptions } from 'signed';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type SignModuleOptions = SignatureOptions;

export interface SignatureModuleOptionsFactory {
  createSignOptions(): SignModuleOptions | Promise<SignModuleOptions>;
}

export interface SignModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SignatureModuleOptionsFactory>;
  useClass?: Type<SignatureModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<SignModuleOptions> | SignModuleOptions;
  inject?: any[];
}
