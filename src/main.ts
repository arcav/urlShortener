import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Acortador de URLs')   // Título de la documentación
    .setDescription('La API para acortar URLs') // Descripción de la API
    .setVersion('0.1.0')              // Versión de la API
    .addTag('url')                  // Puedes agregar etiquetas para organizar los endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);  // Configura la ruta de Swagger (en este caso, '/api')

  await app.listen(3000);
}
bootstrap();

