import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from './url.model';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url)
    private readonly urlModel: typeof Url,
  ) { }

  // Acortardor de URL
  async shortenUrl(originalUrl: string): Promise<Url> {
    //shortUrl de 6 caracteres usando Math.random
    const shortUrl = Math.random().toString(36).substring(2, 8);

    // Crear el registro en la base de datos con la URL original y el shortUrl
    const fullShortUrl = `${process.env.BASE_URL}/${shortUrl}`;
    const newUrl = await this.urlModel.create({ originalUrl, shortUrl,fullShortUrl });

    //URL completa con el dominio extraído del originalUrl

    return  newUrl
  }

  // Encontrar una URL por su versión acortada
  async findByShortUrl(shortUrl: string): Promise<Url> {
    return this.urlModel.findOne({ where: { shortUrl } });
  }

  // Lista todas las URLs
  async listUrls(): Promise<Url[]> {
    return this.urlModel.findAll();
  }

  // Elimina la URL
  async deleteUrl(id: number): Promise<void> {
    await this.urlModel.destroy({ where: { id } });
  }

  // Actualizar la URL original
  async updateUrl(id: number, newOriginalUrl: string): Promise<Url> {
    const url = await this.urlModel.findByPk(id);
    if (url) {
      url.originalUrl = newOriginalUrl;
      return await url.save();
    }
    return null;
  }
}

