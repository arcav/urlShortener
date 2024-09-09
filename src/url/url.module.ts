import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Url } from './url.model';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  imports: [SequelizeModule.forFeature([Url])],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
