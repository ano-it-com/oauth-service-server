import { resolve } from 'path';

export default {
  keyLength: process.env.CERT_KEY_LENGTH,
  basePath: resolve(__dirname, process.env.CERT_BASE_PATH),
};
