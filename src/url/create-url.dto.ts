import { IsNotEmpty, Matches, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
    @ApiProperty({
        example: 'https://institucional.condor.com.br/lojas_/mi-tienda',
        description: 'La URL original que deseas acortar',
        required: true, // Indica que el campo es obligatorio
      })
  @IsNotEmpty({ message: 'La URL no puede estar vacía' })
  @Matches(
    /^https:\/\/institucional\.condor\.com\.br\/lojas_\//,
    { message: 'La URL debe comenzar con "https://institucional.condor.com.br/lojas_/"' }
  )
  @IsUrl({}, { message: 'Debe ser una URL válida' })  // `IsUrl` no acepta directamente el `message`
  originalUrl: string;
}