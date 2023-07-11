import {fileURLToPath} from 'node:url';
import path from 'node:path';
import winston from 'winston';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

winston.configure({
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, 'playball.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    })
  ]
});

export default winston;
