import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { Response } from 'express';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shortenUrl(@Body('originalUrl') originalUrl: string): Promise<{ url: Url, shortUrl: string }> {
    // Llama al servicio para acortar la URL
    const result = await this.urlService.shortenUrl(originalUrl);
    return {
      url: result.url,              // objeto Url original desde la base de datos
      shortUrl: result.fullShortUrl // URL completa (dominio + shortUrl)
    };
  }

  @Get(':shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const url = await this.urlService.findByShortUrl(shortUrl);
    if (url) {
      url.clickCount++;
      await url.save();
      res.redirect(url.originalUrl);
    } else {
      res.status(404).send('URL no encontrada');
    }
  }

  @Get()
  async listUrls(): Promise<Url[]> {
    return this.urlService.listUrls();
  }

  @Delete(':id')
  async deleteUrl(@Param('id') id: number): Promise<void> {
    return this.urlService.deleteUrl(id);
  }

  @Put(':id')
  async updateUrl(
    @Param('id') id: number,
    @Body('originalUrl') originalUrl: string,
  ): Promise<Url> {
    return this.urlService.updateUrl(id, originalUrl);
  }
}
