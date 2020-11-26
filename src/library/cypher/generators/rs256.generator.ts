import { ConfigService } from 'nestjs-config';
import { Injectable } from '@nestjs/common';
import { promises } from 'fs';
import { resolve } from 'path';
import forge from 'node-forge';

@Injectable()
export class RS256Generator {
  constructor(private readonly config: ConfigService) {}

  protected keyLength = parseInt(this.config.get('certificates.keyLength'));

  generateKeyPair(): Promise<forge.pki.KeyPair> {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair(this.keyLength, 0x10001, (error, pair) => {
        if (error) return reject(error);
        resolve(pair);
      });
    });
  }

  async persist(
    pair: forge.pki.KeyPair,
    out = this.config.get('certificates.basePath'),
    pubOut = 'public.key',
    privOut = 'private.key',
  ): Promise<void> {
    await promises.writeFile(
      resolve(out, pubOut),
      forge.pki.publicKeyToPem(pair.publicKey),
    );
    await promises.writeFile(
      resolve(out, privOut),
      forge.pki.privateKeyToPem(pair.privateKey),
    );
  }
}
