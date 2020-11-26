import { Options } from 'argon2';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface CypherModuleOptions {
  iv: string;
  secret: string;
  argon2Options: Omit<Options, 'salt' | 'version'>;
}

export interface CypherModuleOptionsFactory {
  createCypherOptions(): Promise<CypherModuleOptions> | CypherModuleOptions;
}

export interface CypherModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CypherModuleOptionsFactory>;
  useClass?: Type<CypherModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<CypherModuleOptions> | CypherModuleOptions;
  inject?: any[];
}
