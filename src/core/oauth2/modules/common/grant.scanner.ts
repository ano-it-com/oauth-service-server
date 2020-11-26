import { ModuleRef, NestContainer } from '@nestjs/core';
import { GrantInterface } from '@iac-auth/core/oauth2/modules/common/grant.interface';
import { GRANT_TYPE_METADATA } from '@iac-auth/core/oauth2/modules/common/index';

export class GrantScanner {
  private static getModules(modulesContainer: Map<any, any>): any[] {
    return [...modulesContainer.values()];
  }

  public scan(moduleRef: ModuleRef): Map<string, GrantInterface> {
    const map = new Map();
    const container: NestContainer = (moduleRef as any).container;
    const modules = GrantScanner.getModules(container.getModules());

    modules.forEach(module => {
      module._providers.forEach(provider => {
        const { metatype, name } = provider;

        if (typeof metatype !== 'function') return;
        if (!provider.instance) return;

        const dataSourceMetadata = Reflect.getMetadata(
          GRANT_TYPE_METADATA,
          provider.instance.constructor,
        );
        if (!dataSourceMetadata) return;

        provider.instance.constructor.prototype.getIdentifier = () =>
          dataSourceMetadata;
        map.set(name, moduleRef.get(name, { strict: false }));
      });
    });

    return map;
  }
}
