import { CypherService, RS256Generator } from '@iac-auth/library/cypher';
import { Repository } from 'typeorm';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  Pagination,
  PaginationOptionsInterface,
} from '@iac-auth/contracts/pagination';
import forge from 'node-forge';

export type KeyEntityPreview = Pick<KeyEntity, 'id' | 'name' | 'type'>;

@Controller('api/cert-keys')
export class CertKeysController {
  constructor(
    private readonly cypherService: CypherService,
    private readonly rS256Generator: RS256Generator,
    @InjectRepository(KeyEntity)
    private readonly keyRepository: Repository<KeyEntity>,
  ) {}

  @Get()
  public async index(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<Response> {
    const options: PaginationOptionsInterface = {
      perPage: request.query.hasOwnProperty('perPage')
        ? parseInt(request.query.perPage)
        : 10,
      page: request.query.hasOwnProperty('page') ? request.query.page : 1,
    };

    const [results, total] = await this.keyRepository.findAndCount({
      take: options.perPage,
      skip: options.page ? (options.page - 1) * options.perPage : 0,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'type'],
    });

    const data = new Pagination<KeyEntityPreview>({
      results,
      total,
      currentPage: options.page,
      perPage: options.perPage,
    });

    return response.status(200).json(data);
  }

  @Post()
  public async create(
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

  @Delete(':keyId')
  public async delete(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    await this.keyRepository.delete(request.params.keyId);
    return response.status(204);
  }
}
