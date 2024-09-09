import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { Response } from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            shortenUrl: jest.fn(),
            findByShortUrl: jest.fn(),
            listUrls: jest.fn(),
            deleteUrl: jest.fn(),
            updateUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  describe('shortenUrl', () => {
    it('debería acortar una URL correctamente', async () => {
      const originalUrl = 'https://www.example.com';
      const shortUrl = '4fzkjl';
      const mockUrl = { id: 1, originalUrl, shortUrl } as Url

      jest.spyOn(service, 'shortenUrl').mockResolvedValue(mockUrl);

      const result = await controller.shortenUrl(originalUrl );

      // Verificar que el servicio fue llamado correctamente
      expect(service.shortenUrl).toHaveBeenCalledWith(originalUrl);

      // Verificar el resultado
      expect(result).toEqual({
        url: mockUrl,
        shortUrl: `${process.env.BASE_URL}/${shortUrl}`,
      });
    });
  });

  describe('redirect', () => {
    it('debería redirigir correctamente a la URL original si se encuentra', async () => {
      const shortUrl = '4fzkjl';
      const mockUrl = { originalUrl: 'https://www.example.com', clickCount: 0, save: jest.fn().mockResolvedValue(true) } as any;

      jest.spyOn(service, 'findByShortUrl').mockResolvedValue(mockUrl);

      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.redirect(shortUrl, mockResponse);

      // Verificar que la URL fue encontrada y el redireccionamiento ocurrió
      expect(service.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrl.originalUrl);

      // Verificar que el contador de clicks fue incrementado
      expect(mockUrl.clickCount).toBe(1);
      expect(mockUrl.save).toHaveBeenCalled();
    });

    it('debería devolver 404 si no se encuentra la URL', async () => {
      const shortUrl = 'nonexistent';

      jest.spyOn(service, 'findByShortUrl').mockResolvedValue(null);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.redirect(shortUrl, mockResponse);

      // Verificar que se devolvió 404
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('URL no encontrada');
    });
  });

  describe('listUrls', () => {
    it('debería listar todas las URLs correctamente', async () => {
      const urls = [
        { id: 1, originalUrl: 'https://www.example.com', shortUrl: '4fzkjl' } as Url,
        { id: 2, originalUrl: 'https://www.test.com', shortUrl: '2gfrty' } as Url,
      ];

      jest.spyOn(service, 'listUrls').mockResolvedValue(urls);

      const result = await controller.listUrls();

      // Verificar que el servicio fue llamado
      expect(service.listUrls).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toEqual(urls);
    });
  });

  describe('deleteUrl', () => {
    it('debería eliminar una URL correctamente', async () => {
      const id = 1;

      jest.spyOn(service, 'deleteUrl').mockResolvedValue(undefined);

      await controller.deleteUrl(id);

      // Verificar que el servicio fue llamado correctamente
      expect(service.deleteUrl).toHaveBeenCalledWith(id);
    });
  });

  describe('updateUrl', () => {
    it('debería actualizar la URL correctamente', async () => {
      const id = 1;
      const originalUrl = 'https://www.updated.com';
      const updatedUrl = { id, originalUrl, shortUrl: '4fzkjl' } as Url;

      jest.spyOn(service, 'updateUrl').mockResolvedValue(updatedUrl);

      const result = await controller.updateUrl(id, originalUrl );

      // Verificar que el servicio fue llamado correctamente
      expect(service.updateUrl).toHaveBeenCalledWith(id, originalUrl);

      // Verificar el resultado
      expect(result).toEqual(updatedUrl);
    });
  });
});
