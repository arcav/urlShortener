import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno sean accesibles globalmente
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres', // O 'mysql' si prefieres esa base de datos
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true,  // Carga los modelos automáticamente
      synchronize: true,     // Sincroniza los modelos con la base de datos (solo en desarrollo)
    }),
    UrlModule, // Módulo que gestionará la lógica del acortador de URLs
  ],
})
export class AppModule {}
