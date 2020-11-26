import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  CYPHER_MODULE_METADATA,
  CypherService,
} from '@iac-auth/library/cypher/services/cypher.service';
import { RS256Generator } from '@iac-auth/library/cypher/generators';
import {
  CypherModuleAsyncOptions,
  CypherModuleOptions,
  CypherModuleOptionsFactory,
} from '@iac-auth/library/cypher/interfaces';

@Module({
  providers: [CypherService, RS256Generator],
  exports: [CypherService, RS256Generator],
})
export class CypherModule {
  static register(options: CypherModuleOptions): DynamicModule {
    return {
      module: CypherModule,
      providers: [
        {
          provide: CYPHER_MODULE_METADATA,
          useValue: options,
        },
      ],
    };
  }

  private static createAsyncOptionsProvider(
    options: CypherModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CYPHER_MODULE_METADATA,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: CYPHER_MODULE_METADATA,
      useFactory: async (
        factory: CypherModuleOptionsFactory,
      ): Promise<CypherModuleOptions> => await factory.createCypherOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  private static createAsyncProviders(
    options: CypherModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this.createAsyncOptionsProvider(options)];

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  static registerAsync(options: CypherModuleAsyncOptions): DynamicModule {
    return {
      module: CypherModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }
}
