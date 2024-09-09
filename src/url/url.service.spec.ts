import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getModelToken } from '@nestjs/sequelize';
import { Url } from './url.model';

// Creamos un mock del modelo Url usando jest.fn()
const mockUrlModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
  findByPk: jest.fn(),
  save: jest.fn(),
};

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url),
          useValue: mockUrlModel,  
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();  
  });

  describe('shortenUrl', () => {
    it('should generate a short URL and return it with the original URL', async () => {
      const originalUrl = 'https://www.example.com';
      const shortUrl = Math.random().toString(36).substring(2, 8);

      // Mockeamos el comportamiento de create
      mockUrlModel.create.mockResolvedValue({ originalUrl, shortUrl });

      const result = await service.shortenUrl(originalUrl);

      // Verificamos que se haya llamado el método create con los valores correctos
      expect(mockUrlModel.create).toHaveBeenCalledWith({ originalUrl, shortUrl: expect.any(String) });
      
      // Verificamos que se haya generado correctamente la URL completa
      const urlObject = new URL(originalUrl);
      const domain = `${urlObject.protocol}//${urlObject.host}`;
      const fullShortUrl = `${domain}/${shortUrl}`;

      expect(result.url.originalUrl).toEqual(originalUrl);
      expect(result.url.shortUrl).toEqual(shortUrl);
      expect(result.fullShortUrl).toEqual(fullShortUrl);
    });
  });

  // Test para el método findByShortUrl
  describe('findByShortUrl', () => {
    it('should return a URL object if the short URL is found', async () => {
      const shortUrl = 'abc123';
      const url = { id: 1, originalUrl: 'https://www.example.com', shortUrl };

      mockUrlModel.findOne.mockResolvedValue(url);

      const result = await service.findByShortUrl(shortUrl);

      expect(mockUrlModel.findOne).toHaveBeenCalledWith({ where: { shortUrl } });
      expect(result).toEqual(url);
    });

    it('should return null if the short URL is not found', async () => {
      const shortUrl = 'notfound';
      mockUrlModel.findOne.mockResolvedValue(null);

      const result = await service.findByShortUrl(shortUrl);

      expect(mockUrlModel.findOne).toHaveBeenCalledWith({ where: { shortUrl } });
      expect(result).toBeNull();
    });
  });

  // Test para el método listUrls
  describe('listUrls', () => {
    it('should return all URLs', async () => {
      const urls = [
        { id: 1, originalUrl: 'https://www.example1.com', shortUrl: 'abc123' },
        { id: 2, originalUrl: 'https://www.example2.com', shortUrl: 'def456' },
      ];

      mockUrlModel.findAll.mockResolvedValue(urls);

      const result = await service.listUrls();

      expect(mockUrlModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(urls);
    });
  });

  // Test para el método deleteUrl
  describe('deleteUrl', () => {
    it('should delete a URL by ID', async () => {
      const id = 1;

      mockUrlModel.destroy.mockResolvedValue(1);  // Sequelize retorna el número de filas eliminadas

      await service.deleteUrl(id);

      expect(mockUrlModel.destroy).toHaveBeenCalledWith({ where: { id } });
    });
  });

  // Test para el método updateUrl
  describe('updateUrl', () => {
    it('should update the original URL if the URL exists', async () => {
      const id = 1;
      const newOriginalUrl = 'https://new-url.com';
      const existingUrl = { id, originalUrl: 'https://old-url.com', shortUrl: 'abc123', save: jest.fn() };

      mockUrlModel.findByPk.mockResolvedValue(existingUrl);
      existingUrl.save.mockResolvedValue({ ...existingUrl, originalUrl: newOriginalUrl });

      const result = await service.updateUrl(id, newOriginalUrl);

      expect(mockUrlModel.findByPk).toHaveBeenCalledWith(id);
      expect(existingUrl.save).toHaveBeenCalled();
      expect(result.originalUrl).toEqual(newOriginalUrl);
    });

    it('should return null if the URL does not exist', async () => {
      const id = 1;
      const newOriginalUrl = 'https://new-url.com';

      mockUrlModel.findByPk.mockResolvedValue(null);

      const result = await service.updateUrl(id, newOriginalUrl);

      expect(mockUrlModel.findByPk).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });
});
