import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { Response } from 'express';

// Creamos un mock del servicio
const mockUrlService = {
  shortenUrl: jest.fn(),
  findByShortUrl: jest.fn(),
  listUrls: jest.fn(),
  deleteUrl: jest.fn(),
  updateUrl: jest.fn(),
};

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService, // Usamos el mock del servicio
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks después de cada test
  });

  // Test para el método shortenUrl
  describe('shortenUrl', () => {
    it('should return the shortened URL', async () => {
      const originalUrl = 'https://www.example.com';
      const shortenedUrl = 'https://my.domain/abc123';
      const mockUrl: Url = { id: 1, originalUrl, shortUrl: 'abc123', clickCount: 0 } as Url;

      mockUrlService.shortenUrl.mockResolvedValue({
        url: mockUrl,
        fullShortUrl: shortenedUrl,
      });

      const result = await controller.shortenUrl(originalUrl);

      expect(service.shortenUrl).toHaveBeenCalledWith(originalUrl);
      expect(result).toEqual({ url: mockUrl, shortUrl: shortenedUrl });
    });
  });

  // Test para el método redirect
  describe('redirect', () => {
    it('should redirect to the original URL if the short URL exists', async () => {
      const shortUrl = 'abc123';
      const originalUrl = 'https://www.example.com';
      const mockUrl: Url = { id: 1, originalUrl, shortUrl, clickCount: 0, save: jest.fn() } as unknown as Url;
      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      mockUrlService.findByShortUrl.mockResolvedValue(mockUrl);

      await controller.redirect(shortUrl, mockResponse);

      expect(service.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(mockUrl.clickCount).toBe(1);
      expect(mockUrl.save).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(originalUrl);
    });

    it('should return 404 if the short URL is not found', async () => {
      const shortUrl = 'notfound';
      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      mockUrlService.findByShortUrl.mockResolvedValue(null);

      await controller.redirect(shortUrl, mockResponse);

      expect(service.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('URL no encontrada');
    });
  });

  // Test para el método listUrls
  describe('listUrls', () => {
    it('should return all URLs', async () => {
      const mockUrls: Url[] = [
        { id: 1, originalUrl: 'https://www.example1.com', shortUrl: 'abc123', clickCount: 0 },
        { id: 2, originalUrl: 'https://www.example2.com', shortUrl: 'def456', clickCount: 0 },
      ] as Url[];

      mockUrlService.listUrls.mockResolvedValue(mockUrls);

      const result = await controller.listUrls();

      expect(service.listUrls).toHaveBeenCalled();
      expect(result).toEqual(mockUrls);
    });
  });

  // Test para el método deleteUrl
  describe('deleteUrl', () => {
    it('should delete a URL by ID', async () => {
      const id = 1;

      mockUrlService.deleteUrl.mockResolvedValue(undefined);

      await controller.deleteUrl(id);

      expect(service.deleteUrl).toHaveBeenCalledWith(id);
    });
  });

  // Test para el método updateUrl
  describe('updateUrl', () => {
    it('should update the original URL if it exists', async () => {
      const id = 1;
      const newOriginalUrl = 'https://new-url.com';
      const mockUrl: Url = { id, originalUrl: newOriginalUrl, shortUrl: 'abc123', clickCount: 0 } as Url;

      mockUrlService.updateUrl.mockResolvedValue(mockUrl);

      const result = await controller.updateUrl(id, newOriginalUrl);

      expect(service.updateUrl).toHaveBeenCalledWith(id, newOriginalUrl);
      expect(result).toEqual(mockUrl);
    });

    it('should return null if the URL does not exist', async () => {
      const id = 1;
      const newOriginalUrl = 'https://new-url.com';

      mockUrlService.updateUrl.mockResolvedValue(null);

      const result = await controller.updateUrl(id, newOriginalUrl);

      expect(service.updateUrl).toHaveBeenCalledWith(id, newOriginalUrl);
      expect(result).toBeNull();
    });
  });
});
