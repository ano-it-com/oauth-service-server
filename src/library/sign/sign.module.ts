import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import {
  SIGN_MODULE_METADATA,
  UrlSignService,
} from '@iac-auth/library/sign/services';
import { SignedGuard } from '@iac-auth/library/sign/guards';
import {
  SignatureModuleOptionsFactory,
  SignModuleAsyncOptions,
  SignModuleOptions,
} from '@iac-auth/library/sign/interfaces';

@Module({
  providers: [UrlSignService, SignedGuard],
  exports: [UrlSignService, SignedGuard],
})
export class SignModule {
  static register(options: SignModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: SIGN_MODULE_METADATA,
      useValue: options,
    };

    return {
      module: SignModule,
      providers: [optionsProvider],
      exports: [optionsProvider],
    };
  }

  private static createAsyncOptionsProvider(
    options: SignModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SIGN_MODULE_METADATA,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: SIGN_MODULE_METADATA,
      useFactory: async (
        optionsFactory: SignatureModuleOptionsFactory,
      ): Promise<SignModuleOptions> => await optionsFactory.createSignOptions(),
      inject: [
        (options.useClass || options.useExisting) as Type<
          SignatureModuleOptionsFactory
        >,
      ],
    };
  }

  private static createAsyncProviders(
    options: SignModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this.createAsyncOptionsProvider(options)];

    const useClass = options.useClass as Type<SignatureModuleOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  static registerAsync(options: SignModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: SignModule,
      providers: asyncProviders,
      exports: asyncProviders,
    };
  }
}
