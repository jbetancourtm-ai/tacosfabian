import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Azure Static Web Apps busca staticwebapp.config.json en la raíz del artefacto.
const source = 'staticwebapp.config.json';
const targetDirectory = 'dist';
if (!existsSync(source) || !existsSync(targetDirectory)) {
  console.error('No se encontró staticwebapp.config.json o dist/.');
  process.exitCode = 1;
} else {
  mkdirSync(targetDirectory, { recursive: true });
  copyFileSync(source, join(targetDirectory, 'staticwebapp.config.json'));
  console.log('Configuración de rutas SWA incluida en dist/.');
}
