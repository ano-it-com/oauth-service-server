import { Inject, Injectable } from '@nestjs/common';
import { CypherModuleOptions } from '@iac-auth/library/cypher/interfaces';
import crypto, { HexBase64Latin1Encoding } from 'crypto';
import farmhash from 'farmhash';
import forge from 'node-forge';
import {
  hashValue,
  verifyValue,
} from '@iac-auth/library/cypher/utils/hash.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { Repository } from 'typeorm/index';
import { RS256Generator } from '@iac-auth/library/cypher';
import { Command, Console } from 'nestjs-console';

export const CYPHER_MODULE_METADATA = '__CYPHER_MODULE_METADATA__';

@Console()
@Injectable()
export class CypherService {
  protected readonly iv: any;
  protected readonly secret: string;

  constructor(
    @Inject(CYPHER_MODULE_METADATA)
    protected readonly options: CypherModuleOptions,
  ) {
    this.iv = this.options.iv;
    this.secret = this.options.secret;
  }

  sha256(
    data: string,
    digest: HexBase64Latin1Encoding | boolean = 'hex',
  ): string | Buffer {
    const hash = crypto.createHash('sha256').update(data);

    if (digest) return hash.digest(digest as HexBase64Latin1Encoding);
    return hash.digest();
  }

  encrypt(data: any, secret = this.secret, iv = this.iv): string {
    const cipher = forge.cipher.createCipher('AES-CBC', secret);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(data)));
    cipher.finish();

    return cipher.output.toHex();
  }

  decrypt(hexString: string, secret = this.secret, iv = this.iv): any {
    const decipher = forge.cipher.createDecipher('AES-CBC', secret);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(hexString)));
    decipher.finish();

    return JSON.parse(decipher.output.toString());
  }

  farmHash(data: string): number {
    return farmhash.fingerprint32(Buffer.from(data));
  }

  farmHashVerify(value: string, hashed: string | number): boolean {
    const hashedValue = this.farmHash(value).toString();
    return hashedValue === hashed.toString();
  }

  /**
   * Get hash of string using argon2 algorithm
   * @param value
   */
  argonHash(value: string): Promise<string> {
    return hashValue(value, this.options.argon2Options);
  }

  /**
   * Verify string with an argon hash
   * @param value
   * @param hashed
   */
  argonVerify(value: string, hashed: string): Promise<boolean> {
    return verifyValue(value, hashed, this.options.argon2Options);
  }

  // @Command({
  //   description: 'Generate certificates for given name',
  //   command: 'certs-gen <name>',
  // })
  // private async generateCerts(name: string): Promise<string> {
  //   const keyPair = await this.rS256Generator.generateKeyPair();
  //
  //   const pubKey = this.keyRepository.create({
  //     name: name,
  //     type: 'public',
  //     data: this.encrypt(forge.pki.publicKeyToPem(keyPair.publicKey)),
  //   });
  //
  //   const privKey = this.keyRepository.create({
  //     name: name,
  //     type: 'private',
  //     data: this.encrypt(forge.pki.privateKeyToPem(keyPair.privateKey)),
  //   });
  //
  //   await this.keyRepository.save([pubKey, privKey]);
  //
  //   return 'Certificates build successfully';
  // }
}
