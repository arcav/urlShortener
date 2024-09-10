# Usa una imagen base de Node.js
FROM node:18

# Crea y establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el archivo de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto en el que tu aplicación va a correr
EXPOSE 3000

# Comando para ejecutar tu aplicación
CMD ["npm", "run", "start:prod"]
