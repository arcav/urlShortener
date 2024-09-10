import { Body, Controller, Delete, Get, Param, Post, Put, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { Response } from 'express';
import { CreateUrlDto } from './create-url.dto';

@ApiTags('url')  // Agrupa este controlador bajo la etiqueta 'url' en la documentación

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Crea una nueva URL acortada' })  // Describe la operación
  @ApiResponse({ status: 201, description: 'La URL ha sido acortada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async shortenUrl(@Body() createUrlDto: CreateUrlDto ): Promise<Url> {
    const { originalUrl } = createUrlDto;
    return this.urlService.shortenUrl(originalUrl);
  }

  @Get(':shortUrl')
  @ApiOperation({ summary: 'Obtiene la URL acortada' })
  @ApiResponse({ status: 302, description: 'Redirecciona la Url a la Url Original.' })
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
  @ApiOperation({ summary: 'Obtiene todas las URLs acortadas' })
  @ApiResponse({ status: 200, description: 'Lista de URLs acortadas.' })
  async listUrls(): Promise<Url[]> {
    return this.urlService.listUrls();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina Url' })
  @ApiResponse({ status: 200, description: 'Elimina la Url por su Id' })
  async deleteUrl(@Param('id') id: number): Promise<void> {
    return this.urlService.deleteUrl(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza la  Url' })
  @ApiResponse({ status: 200, description: 'Actualiza la Url por su Id' })
  async updateUrl(
    @Param('id') id: number,
    @Body('originalUrl') originalUrl: string,
  ): Promise<Url> {
    return this.urlService.updateUrl(id, originalUrl);
  }
}
