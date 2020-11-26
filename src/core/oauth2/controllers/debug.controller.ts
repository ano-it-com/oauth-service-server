import { Body, Controller, Get, Inject, Post, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { Repository } from 'typeorm';
import {
  CYPHER_MODULE_METADATA,
  CypherService,
  RS256Generator,
} from '@iac-auth/library/cypher';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { Response } from 'express';
import forge from 'node-forge';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly cypherService: CypherService,
    private readonly rS256Generator: RS256Generator,
    @InjectRepository(KeyEntity)
    private readonly keyRepository: Repository<KeyEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  @Get('clients')
  clients() {
    return this.clientRepository.find();
  }

  @Post('clients')
  createClient(@Body() data: any) {
    return this.clientRepository.save(this.clientRepository.create(data));
  }

  @Post('keys')
  async makeKeys(
    @Body() data: { name: string },
    @Res() response: Response,
  ): Promise<Response> {
    const keyPair = await this.rS256Generator.generateKeyPair();

    const pubKey = this.keyRepository.create({
      name: data.name,
      type: 'public',
      data: this.cypherService.encrypt(
        forge.pki.publicKeyToPem(keyPair.publicKey),
      ),
    });

    const privKey = this.keyRepository.create({
      name: data.name,
      type: 'private',
      data: this.cypherService.encrypt(
        forge.pki.privateKeyToPem(keyPair.privateKey),
      ),
    });

    await this.keyRepository.save([pubKey, privKey]);

    return response.status(201).json({ pub: pubKey.id, private: privKey.id });
  }
}
