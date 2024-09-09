import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getModelToken } from '@nestjs/sequelize';
import { Url } from './url.model';

describe('UrlService', () => {
  let service: UrlService;
  let urlModel: typeof Url;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            destroy: jest.fn(),
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlModel = module.get<typeof Url>(getModelToken(Url));
  });

  // Mock de Math.random()
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.123456); // Valor fijo para pruebas
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restaurar el comportamiento original
  });

  describe('shortenUrl', () => {
    it('debería acortar una URL correctamente', async () => {
      const originalUrl = 'https://www.example.com';
      const shortUrl = '4fzkjl'; // Valor generado con el mock de Math.random()
      const fullShortUrl = `${process.env.BASE_URL}/${shortUrl}`;
      
      const createdUrl = { id: 1, originalUrl, shortUrl, fullShortUrl, clickCount: 0 } as Url;

      // Mock del método `create`
      (urlModel.create as jest.Mock).mockResolvedValue(createdUrl);

      const result = await service.shortenUrl(originalUrl);

      // Verificar que el servicio llama correctamente al método `create` del modelo
      expect(urlModel.create).toHaveBeenCalledWith({
        fullShortUrl,
      });

      // Verificar el resultado
      expect(result).toEqual(createdUrl);
    });
  });

  describe('findByShortUrl', () => {
    it('debería encontrar una URL por su shortUrl', async () => {
      const shortUrl = '4fzkjl';
      const urlData = { id: 1, originalUrl: 'https://www.example.com', shortUrl } as Url;

      // Mock del método `findOne`
      (urlModel.findOne as jest.Mock).mockResolvedValue(urlData);

      const result = await service.findByShortUrl(shortUrl);

      // Verificar que el método `findOne` fue llamado con el parámetro correcto
      expect(urlModel.findOne).toHaveBeenCalledWith({ where: { shortUrl } });

      // Verificar el resultado
      expect(result).toEqual(urlData);
    });
  });

  describe('listUrls', () => {
    it('debería listar todas las URLs', async () => {
      const urls = [
        { id: 1, originalUrl: 'https://www.example.com', shortUrl: '4fzkjl' } as Url,
        { id: 2, originalUrl: 'https://www.test.com', shortUrl: '2gfrty' } as Url,
      ];

      // Mock del método `findAll`
      (urlModel.findAll as jest.Mock).mockResolvedValue(urls);

      const result = await service.listUrls();

      // Verificar que el método `findAll` fue llamado
      expect(urlModel.findAll).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toEqual(urls);
    });
  });

  describe('deleteUrl', () => {
    it('debería eliminar una URL por su ID', async () => {
      const id = 1;

      // Mock del método `destroy`
      (urlModel.destroy as jest.Mock).mockResolvedValue(undefined);

      await service.deleteUrl(id);

      // Verificar que el método `destroy` fue llamado con el parámetro correcto
      expect(urlModel.destroy).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('updateUrl', () => {
    it('debería actualizar la URL original', async () => {
      const id = 1;
      const newOriginalUrl = 'https://www.updated.com';
      const urlData = { id, originalUrl: 'https://www.example.com', shortUrl: '4fzkjl', save: jest.fn().mockResolvedValue(true) } as any;

      // Mock del método `findByPk`
      (urlModel.findByPk as jest.Mock).mockResolvedValue(urlData);

      const result = await service.updateUrl(id, newOriginalUrl);

      // Verificar que la URL fue encontrada y actualizada
      expect(urlModel.findByPk).toHaveBeenCalledWith(id);
      expect(urlData.originalUrl).toBe(newOriginalUrl);
      expect(urlData.save).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toEqual(urlData);
    });

    it('debería devolver null si la URL no se encuentra', async () => {
      const id = 1;
      const newOriginalUrl = 'https://www.updated.com';

      // Mock del método `findByPk`
      (urlModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.updateUrl(id, newOriginalUrl);

      // Verificar que la URL no fue encontrada
      expect(result).toBeNull();
    });
  });
});
