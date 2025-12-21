import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
});
