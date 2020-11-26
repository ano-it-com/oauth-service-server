import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { CypherModule } from '@iac-auth/library/cypher';
import { JwtService } from '@iac-auth/library/jwt';

@Module({
  imports: [
    ConfigModule,
    CypherModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('crypto'),
    }),
    TypeOrmModule.forFeature([KeyEntity]),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
